package com.example.myapplication;

import android.content.Intent;
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
import com.example.myapplication.entitie.Post;
import com.example.myapplication.entitie.User;

import java.util.List;

/**
 * MainActivity displays a list of posts in a RecyclerView, allows searching posts,
 * and handles user interactions like adding posts, logging in/out, and changing dark mode.
 */
public class MainActivity extends BaseActivity implements OnPostClickListener {

    // Instance variables
    private List<Post> postList;         // List of posts to display
    private RecyclerView recyclerView;  // RecyclerView to show posts
    private PostListAdapter postAdapter; // Adapter for RecyclerView
    private EditText searchEditText;     // EditText for search input
    private ImageButton searchButton;    // Button to perform search

    private static final int ADD_POST_REQUEST = 3; // Request code for adding a new post

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Initialize RecyclerView and its adapter
        postList = postListManager.getPosts();
        recyclerView = findViewById(R.id.postList);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        postAdapter = new PostListAdapter(this, postList, this);
        recyclerView.setAdapter(postAdapter);

        // Check if the admin user exists; add only if it doesn't
        if (!usersManager.userExists("admin")) {
            usersManager.addUser(new User("Admin", "admin", null, "12345678aA"));
        }

        // Set up user information display
        setUserInfoFeed();

        // Set up search functionality
        searchEditText = findViewById(R.id.searchEditText);
        searchButton = findViewById(R.id.buttonSearch);
        searchButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // Perform search based on entered text
                String searchText = searchEditText.getText().toString().trim();
                PostListManager postManager = postListManager.getInstance(MainActivity.this);

                if (!searchText.isEmpty()) {
                    List<Post> searchResults = postManager.searchPosts(searchText);
                    if (searchResults == null) {
                        // No results found, show all posts
                        List<Post> allPosts = postManager.getPosts();
                        postAdapter.updatePosts(allPosts);
                    } else {
                        // Update RecyclerView with search results
                        postAdapter.updatePosts(searchResults);
                    }
                } else {
                    // Empty search text, show all posts
                    List<Post> allPosts = postManager.getPosts();
                    postAdapter.updatePosts(allPosts);
                }
            }
        });
    }

    /**
     * Updates the user information displayed in the UI based on whether a user is signed in.
     * If signed in, displays the user's display name and profile picture.
     * If not signed in, displays a default profile picture.
     */
    private void setUserInfoFeed() {
        if (usersManager.getSignedInUser() != null) {
            // Set user's display name
            TextView activeUserInfo = findViewById(R.id.activeUserInfo);
            String displayName = usersManager.getSignedInUser().getDisplayName();
            activeUserInfo.setText(displayName);

            // Set user's profile picture
            ImageView activeUserPic = findViewById(R.id.activeUserPic);
            Uri profilePicUri = usersManager.getSignedInUser().getProfilePicture();
            if (profilePicUri != null) {
                activeUserPic.setImageURI(profilePicUri);
            } else {
                activeUserPic.setImageResource(R.drawable.default_profile_pic);
            }
        } else {
            // No signed-in user, display default profile picture
            ImageView activeUserPic = findViewById(R.id.activeUserPic);
            activeUserPic.setImageResource(R.drawable.default_profile_pic);
        }
    }

    /**
     * Handles the click on the dark mode switch.
     * Toggles the app's dark mode based on the current state of the switch.
     */
    public void changeDarkModClick(View view) {
        changeDarkMode();
    }

    /**
     * Logs out the current user by signing them out and returning to the MainActivity.
     * Displays a message if no user is currently signed in.
     */
    public void logout(View view) {
        if (usersManager.getSignedInUser() != null) {
            // Sign out the current user
            usersManager.signOut();
            Intent intent = new Intent(this, MainActivity.class);
            startActivity(intent);
            finish();
        } else {
            // No signed-in user, display a toast message
            Toast.makeText(this, "No signed-in user", Toast.LENGTH_SHORT).show();
        }
    }

    /**
     * Redirects the user to the SignInActivity to log in if not already signed in.
     * Displays a message if a user is already signed in.
     */
    public void login(View view) {
        if (usersManager.getSignedInUser() == null) {
            // Start SignInActivity for logging in
            Intent intent = new Intent(this, SignInActivity.class);
            startActivity(intent);
            finish();
        } else {
            // User is already signed in, display a toast message
            Toast.makeText(this, "Already signed in!", Toast.LENGTH_SHORT).show();
        }
    }

    /**
     * Redirects the user to the AddPostActivity to add a new post if signed in.
     * Displays a message prompting the user to sign in if not already signed in.
     */
    public void addItem(View view) {
        if (usersManager.getSignedInUser() != null) {
            // Start AddPostActivity for adding a new post
            Intent intent = new Intent(this, AddPostActivity.class);
            startActivityForResult(intent, ADD_POST_REQUEST);
        } else {
            // User not signed in, display a toast message
            Toast.makeText(this, "Please sign in to upload a new video.", Toast.LENGTH_SHORT).show();
        }
    }

    /**
     * Handles the click on a post item in the RecyclerView.
     * Opens the VideoActivity to view the selected post's video.
     *
     * @param post The post object that was clicked
     */
    @Override
    public void onPostClick(Post post) {
        Intent intent = new Intent(this, VideoActivity.class);
        intent.putExtra("id", post.getId());
        startActivity(intent);
    }

    /**
     * Handles the result returned from AddPostActivity after adding a new post.
     * Refreshes the post list displayed in the RecyclerView.
     *
     * @param requestCode The request code passed to AddPostActivity
     * @param resultCode  The result code returned from AddPostActivity
     * @param data        The data returned from AddPostActivity
     */
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (resultCode == RESULT_OK && requestCode == ADD_POST_REQUEST) {
            // Refresh the post list in the RecyclerView
            postAdapter.notifyDataSetChanged();
        }
    }
}
