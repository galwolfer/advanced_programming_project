package com.example.myapplication;

import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;
import android.widget.VideoView;

import androidx.annotation.Nullable;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.myapplication.adapters.CommentAdapter;
import com.example.myapplication.api.ApiClient;
import com.example.myapplication.api.ApiModels;
import com.example.myapplication.api.ApiService;
import com.example.myapplication.entitie.Comment;
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

public class VideoActivity extends BaseActivity implements CommentAdapter.OnCommentDeleteListener {

    private ImageView ivAuthorPicture;
    private TextView tvAuthor;
    private TextView tvTimeStamp;
    private TextView tvContent;
    private VideoView videoView;
    private ImageButton likeButton;
    private TextView likeCount;
    private ImageButton btnAddComment;
    private EditText etNewComment;
    private RecyclerView rvComments;

    private Post post;
    private CommentAdapter commentAdapter;
    private String serverVideoId;
    private boolean isLiked = false;
    private int currentLikesCount = 0;
    private final Map<Comment, String> commentIdMap = new HashMap<>();

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_video);

        ivAuthorPicture = findViewById(R.id.ivAuthorPicture);
        tvAuthor = findViewById(R.id.tvAuthor);
        tvTimeStamp = findViewById(R.id.tvTimeStamp);
        tvContent = findViewById(R.id.tvContent);
        videoView = findViewById(R.id.videoView);
        likeButton = findViewById(R.id.likeButton);
        likeCount = findViewById(R.id.likeCount);
        btnAddComment = findViewById(R.id.btnAddComment);
        etNewComment = findViewById(R.id.etNewComment);
        rvComments = findViewById(R.id.rvComments);

        // Get the video ID from intent
        serverVideoId = getIntent().getStringExtra("serverVideoId");
        if (serverVideoId == null) {
            Toast.makeText(this, "Video not found", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }

        fetchVideoDetails();

        btnAddComment.setOnClickListener(v -> {
            if (tokenManager.isSignedIn()) {
                String text = etNewComment.getText().toString().trim();
                if (!text.isEmpty()) {
                    addComment(text);
                }
            } else {
                Toast.makeText(this, "Sign in to comment", Toast.LENGTH_SHORT).show();
            }
        });

        likeButton.setOnClickListener(v -> {
            if (tokenManager.isSignedIn()) {
                toggleLike();
            } else {
                Toast.makeText(this, "Sign in to like this post", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void fetchVideoDetails() {
        ApiClient.getClient().create(ApiService.class)
                .getVideoDetails(serverVideoId)
                .enqueue(new Callback<ApiModels.VideoDetailResponse>() {
                    @Override
                    public void onResponse(Call<ApiModels.VideoDetailResponse> call,
                                           Response<ApiModels.VideoDetailResponse> response) {
                        if (response.isSuccessful() && response.body() != null) {
                            ApiModels.VideoDetailResponse detail = response.body();
                            populateVideo(detail.video, detail.comments);
                            recordView();
                        } else {
                            Toast.makeText(VideoActivity.this,
                                    "Failed to load video", Toast.LENGTH_SHORT).show();
                        }
                    }

                    @Override
                    public void onFailure(Call<ApiModels.VideoDetailResponse> call, Throwable t) {
                        Toast.makeText(VideoActivity.this,
                                "Connection error", Toast.LENGTH_SHORT).show();
                    }
                });
    }

    private void recordView() {
        ApiClient.getClient().create(ApiService.class)
                .incrementViews(serverVideoId)
                .enqueue(new Callback<Map<String, Object>>() {
                    @Override
                    public void onResponse(Call<Map<String, Object>> call,
                                           Response<Map<String, Object>> response) {
                        // View recorded, no UI update needed
                    }

                    @Override
                    public void onFailure(Call<Map<String, Object>> call, Throwable t) {
                        // Non-critical, ignore
                    }
                });
    }

    private void populateVideo(ApiModels.VideoResponse video,
                               List<ApiModels.CommentResponse> comments) {
        // Create local Post entity
        String uploaderName = video.uploaderName != null ? video.uploaderName : "Unknown";
        User author = new User(uploaderName, uploaderName, null, "");
        String title = video.title != null ? video.title : "";
        post = new Post(title, null, video.videoUrl, author);
        isLiked = video.likedByCurrentUser;
        currentLikesCount = video.likesCount;

        // Set UI
        tvAuthor.setText(uploaderName);
        tvContent.setText(title);
        tvTimeStamp.setText(video.createdAt != null ? video.createdAt : "");

        // Load author profile picture
        // The video list endpoint doesn't return profile picture, so skip for now
        ivAuthorPicture.setImageResource(R.drawable.default_profile_pic);

        // Set up video player
        if (video.videoUrl != null && !video.videoUrl.isEmpty()) {
            MediaContr mediaController = new MediaContr(this, videoView);
            videoView.setMediaController(mediaController);
            videoView.setVideoURI(Uri.parse(video.videoUrl));
            videoView.start();
        }

        // Like button state
        updateLikeButtonState();
        updateLikeCount();

        // Set up comments
        List<Comment> commentList = new ArrayList<>();
        commentIdMap.clear();
        if (comments != null) {
            for (ApiModels.CommentResponse cr : comments) {
                User commentAuthor = new User(cr.authorName, cr.authorName, null, "");
                Comment comment = new Comment(cr.text, commentAuthor);
                commentList.add(comment);
                commentIdMap.put(comment, cr.id);
            }
        }

        commentAdapter = new CommentAdapter(commentList, this);
        rvComments.setLayoutManager(new LinearLayoutManager(this));
        rvComments.setAdapter(commentAdapter);
    }

    private void toggleLike() {
        String authHeader = "Bearer " + tokenManager.getToken();
        ApiClient.getClient().create(ApiService.class)
                .toggleLike(authHeader, serverVideoId)
                .enqueue(new Callback<ApiModels.LikeResponse>() {
                    @Override
                    public void onResponse(Call<ApiModels.LikeResponse> call,
                                           Response<ApiModels.LikeResponse> response) {
                        if (response.isSuccessful() && response.body() != null) {
                            isLiked = response.body().likedByCurrentUser;
                            currentLikesCount = response.body().likesCount;
                            runOnUiThread(() -> {
                                updateLikeButtonState();
                                updateLikeCount();
                            });
                        }
                    }

                    @Override
                    public void onFailure(Call<ApiModels.LikeResponse> call, Throwable t) {
                        Toast.makeText(VideoActivity.this,
                                "Failed to update like", Toast.LENGTH_SHORT).show();
                    }
                });
    }

    private void addComment(String text) {
        String authHeader = "Bearer " + tokenManager.getToken();
        ApiClient.getClient().create(ApiService.class)
                .addComment(authHeader, serverVideoId,
                        new ApiModels.AddCommentRequest(text))
                .enqueue(new Callback<ApiModels.CreateCommentResponse>() {
                    @Override
                    public void onResponse(Call<ApiModels.CreateCommentResponse> call,
                                           Response<ApiModels.CreateCommentResponse> response) {
                        if (response.isSuccessful()) {
                            etNewComment.setText("");
                            fetchVideoDetails(); // Reload to show new comment
                        } else {
                            Toast.makeText(VideoActivity.this,
                                    "Failed to add comment", Toast.LENGTH_SHORT).show();
                        }
                    }

                    @Override
                    public void onFailure(Call<ApiModels.CreateCommentResponse> call, Throwable t) {
                        Toast.makeText(VideoActivity.this,
                                "Connection error", Toast.LENGTH_SHORT).show();
                    }
                });
    }

    private void updateLikeButtonState() {
        if (isLiked) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                likeButton.setBackgroundColor(getColor(R.color.like_red));
            }
        } else {
            likeButton.setBackgroundColor(Color.TRANSPARENT);
        }
    }

    private void updateLikeCount() {
        likeCount.setText(String.valueOf(currentLikesCount));
    }

    public void sharePost(View view) {
        String shareText = post != null && post.getVideoString() != null
                ? post.getVideoString() : "Check out this video";
        Intent shareIntent = new Intent(Intent.ACTION_SEND);
        shareIntent.setType("text/plain");
        shareIntent.putExtra(Intent.EXTRA_TEXT, shareText);
        startActivity(Intent.createChooser(shareIntent, "Share with"));
    }

    @Override
    public void onCommentDelete(Comment comment) {
        if (!tokenManager.isSignedIn()) {
            Toast.makeText(this, "Only the comment author can delete it",
                    Toast.LENGTH_SHORT).show();
            return;
        }

        String commentId = commentIdMap.get(comment);
        if (commentId == null) {
            Toast.makeText(this, "Cannot delete this comment",
                    Toast.LENGTH_SHORT).show();
            return;
        }

        String authHeader = "Bearer " + tokenManager.getToken();
        ApiClient.getClient().create(ApiService.class)
                .deleteComment(authHeader, serverVideoId, commentId)
                .enqueue(new Callback<Map<String, String>>() {
                    @Override
                    public void onResponse(Call<Map<String, String>> call,
                                           Response<Map<String, String>> response) {
                        if (response.isSuccessful()) {
                            fetchVideoDetails(); // Reload to reflect deletion
                        } else {
                            Toast.makeText(VideoActivity.this,
                                    "Failed to delete comment", Toast.LENGTH_SHORT).show();
                        }
                    }

                    @Override
                    public void onFailure(Call<Map<String, String>> call, Throwable t) {
                        Toast.makeText(VideoActivity.this,
                                "Connection error", Toast.LENGTH_SHORT).show();
                    }
                });
    }
}
