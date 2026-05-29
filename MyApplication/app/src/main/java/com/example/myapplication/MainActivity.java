package com.example.myapplication;

import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.myapplication.adapters.PostListAdapter;
import com.example.myapplication.api.ApiClient;
import com.example.myapplication.api.ApiModels;
import com.example.myapplication.api.ApiService;
import com.example.myapplication.entitie.Post;
import com.example.myapplication.entitie.User;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * MainActivity displays a video feed from the Express API in a RecyclerView,
 * allows searching, and handles user interactions like adding videos,
 * logging in/out, and dark mode.
 */
public class MainActivity extends BaseActivity implements OnPostClickListener {

    private List<Post> postList;
    private RecyclerView recyclerView;
    private PostListAdapter postAdapter;
    private EditText searchEditText;
    private ImageButton searchButton;

    private final Map<UUID, String> serverIdMap = new HashMap<>();

    private static final int ADD_POST_REQUEST = 3;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        postList = new ArrayList<>();
        recyclerView = findViewById(R.id.postList);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        postAdapter = new PostListAdapter(this, postList, this);
        recyclerView.setAdapter(postAdapter);

        setUserInfoFeed();

        searchEditText = findViewById(R.id.searchEditText);
        searchButton = findViewById(R.id.buttonSearch);
        searchButton.setOnClickListener(v -> {
            String query = searchEditText.getText().toString().trim();
            if (!query.isEmpty()) {
                searchVideos(query);
            } else {
                loadVideos();
            }
        });

        loadVideos();
    }

    private void loadVideos() {
        ApiClient.getClient().create(ApiService.class)
                .getVideos(null, null, "latest", 1, 50)
                .enqueue(new Callback<ApiModels.VideoListResponse>() {
                    @Override
                    public void onResponse(Call<ApiModels.VideoListResponse> call,
                                           Response<ApiModels.VideoListResponse> response) {
                        if (response.isSuccessful() && response.body() != null) {
                            List<ApiModels.VideoResponse> videos = response.body().videos;
                            if (videos != null) {
                                buildPostList(videos);
                            }
                        }
                    }

                    @Override
                    public void onFailure(Call<ApiModels.VideoListResponse> call, Throwable t) {
                        Toast.makeText(MainActivity.this,
                                "Failed to load videos", Toast.LENGTH_SHORT).show();
                    }
                });
    }

    private void searchVideos(String query) {
        ApiClient.getClient().create(ApiService.class)
                .getVideos(query, null, "latest", 1, 50)
                .enqueue(new Callback<ApiModels.VideoListResponse>() {
                    @Override
                    public void onResponse(Call<ApiModels.VideoListResponse> call,
                                           Response<ApiModels.VideoListResponse> response) {
                        if (response.isSuccessful() && response.body() != null) {
                            List<ApiModels.VideoResponse> videos = response.body().videos;
                            if (videos != null) {
                                buildPostList(videos);
                            }
                        }
                    }

                    @Override
                    public void onFailure(Call<ApiModels.VideoListResponse> call, Throwable t) {
                        Toast.makeText(MainActivity.this,
                                "Search failed", Toast.LENGTH_SHORT).show();
                    }
                });
    }

    private void buildPostList(List<ApiModels.VideoResponse> videos) {
        final List<Post> posts = new ArrayList<>();
        serverIdMap.clear();

        for (ApiModels.VideoResponse v : videos) {
            String displayName = v.uploaderName != null ? v.uploaderName : "Unknown";
            String userName = v.uploaderName != null ? v.uploaderName : "unknown";
            User author = new User(displayName, userName, null, "");
            String title = v.title != null ? v.title : (v.description != null ? v.description : "");
            Post post = new Post(title, null, v.videoUrl, author);
            posts.add(post);
            serverIdMap.put(post.getId(), v.id);
        }

        postAdapter.setPosts(posts);

        // Load thumbnails in background
        new Thread(() -> {
            for (int i = 0; i < posts.size(); i++) {
                ApiModels.VideoResponse v = videos.get(i);
                Post post = posts.get(i);
                if (v.thumbnailUrl != null && !v.thumbnailUrl.isEmpty()) {
                    Bitmap thumb = ImageLoader.loadBitmap(v.thumbnailUrl);
                    if (thumb != null) {
                        post.setImageBit(thumb);
                    }
                }
            }
            runOnUiThread(() -> postAdapter.notifyDataSetChanged());
        }).start();
    }

    private void setUserInfoFeed() {
        TextView activeUserInfo = findViewById(R.id.activeUserInfo);
        ImageView activeUserPic = findViewById(R.id.activeUserPic);

        if (tokenManager.isSignedIn()) {
            String displayName = tokenManager.getDisplayName();
            activeUserInfo.setText(displayName != null ? displayName : "");

            String picUrl = tokenManager.getProfilePicUrl();
            if (picUrl != null && !picUrl.isEmpty()) {
                new Thread(() -> {
                    Bitmap bmp = ImageLoader.loadBitmap(picUrl);
                    if (bmp != null) {
                        runOnUiThread(() -> activeUserPic.setImageBitmap(bmp));
                    }
                }).start();
            }
        } else {
            activeUserInfo.setText("");
            activeUserPic.setImageResource(R.drawable.default_profile_pic);
        }
    }

    public void changeDarkModClick(View view) {
        changeDarkMode();
    }

    public void logout(View view) {
        if (tokenManager.isSignedIn()) {
            tokenManager.clearSession();
            Intent intent = new Intent(this, MainActivity.class);
            startActivity(intent);
            finish();
        } else {
            Toast.makeText(this, "No signed-in user", Toast.LENGTH_SHORT).show();
        }
    }

    public void login(View view) {
        if (!tokenManager.isSignedIn()) {
            Intent intent = new Intent(this, SignInActivity.class);
            startActivity(intent);
            finish();
        } else {
            Toast.makeText(this, "Already signed in!", Toast.LENGTH_SHORT).show();
        }
    }

    public void addItem(View view) {
        if (tokenManager.isSignedIn()) {
            Intent intent = new Intent(this, AddPostActivity.class);
            startActivityForResult(intent, ADD_POST_REQUEST);
        } else {
            Toast.makeText(this, "Please sign in to upload a new video.", Toast.LENGTH_SHORT).show();
        }
    }

    @Override
    public void onPostClick(Post post) {
        Intent intent = new Intent(this, VideoActivity.class);
        intent.putExtra("id", post.getId());
        String serverId = serverIdMap.get(post.getId());
        if (serverId != null) {
            intent.putExtra("serverVideoId", serverId);
        }
        startActivity(intent);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (resultCode == RESULT_OK && requestCode == ADD_POST_REQUEST) {
            loadVideos();
        }
    }
}
