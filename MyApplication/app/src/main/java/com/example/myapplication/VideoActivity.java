package com.example.myapplication;

import android.content.Intent;
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
import com.example.myapplication.entitie.Comment;
import com.example.myapplication.entitie.Post;
import com.example.myapplication.entitie.User;

import java.util.UUID;

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
    private Post post; // Current post being displayed
    private CommentAdapter commentAdapter; // Adapter for comments

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_video);

        // Initialize views
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

        // Get the post ID from the intent
        UUID postId = (UUID) getIntent().getSerializableExtra("id");

        // Fetch the post using the ID
        post = postListManager.getPostById(postId);

        if (post != null) {
            // Set the post details
            if (post.getAuthor().getProfilePicture() != null) {
                ivAuthorPicture.setImageURI(post.getAuthor().getProfilePicture());
            } else {
                ivAuthorPicture.setImageResource(R.drawable.default_profile_pic);
            }

            tvAuthor.setText(post.getAuthor().getDisplayName());
            tvTimeStamp.setText(post.getTimeStamp());
            tvContent.setText(post.getText());

            MediaContr mediaController = new MediaContr(this, videoView);
            videoView.setMediaController(mediaController);

            String videoUri = post.getVideoString();
            if (videoUri != null) {
                videoView.setVideoURI(Uri.parse(videoUri));
                videoView.start();
            }

            // Set like button state and like count
            updateLikeButtonState();
            updateLikeCount();

            likeButton.setOnClickListener(v -> {
                if (usersManager.getSignedInUser() != null) {
                    if (post.isLiked(usersManager.getSignedInUser())) {
                        post.removeLikeUsers(usersManager.getSignedInUser());
                    } else {
                        post.addLikeUsers(usersManager.getSignedInUser());
                    }
                    updateLikeButtonState();
                    updateLikeCount();
                } else {
                    Toast.makeText(this, "Sign in to like this post", Toast.LENGTH_SHORT).show();
                }
            });

            commentAdapter = new CommentAdapter(post.getComments(), this);
            rvComments.setLayoutManager(new LinearLayoutManager(this));
            rvComments.setAdapter(commentAdapter);

            // Add new comment
            btnAddComment.setOnClickListener(v -> {
                if (usersManager.getSignedInUser() != null) {
                    String commentText = etNewComment.getText().toString().trim();
                    if (!commentText.isEmpty()) {
                        User currentUser = usersManager.getSignedInUser();
                        Comment newComment = new Comment(commentText, currentUser);
                        post.addComment(newComment);
                        commentAdapter.updateData(post.getComments());
                        etNewComment.setText("");
                    }
                } else {
                    Toast.makeText(this, "Sign in to comment", Toast.LENGTH_SHORT).show();
                }
            });
        }
    }

    private void updateLikeButtonState() {
        if (usersManager.getSignedInUser() != null) {
            if (post.isLiked(usersManager.getSignedInUser())) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    likeButton.setBackgroundColor(getColor(R.color.like_red));
                }
            } else {
                likeButton.setBackgroundColor(Color.TRANSPARENT);
            }
        }
    }

    private void updateLikeCount() {
        likeCount.setText(String.valueOf(post.getLikeCount()));
    }

    public void sharePost(View view) {
        String postUrl = tvTimeStamp.getText().toString();

        Intent shareIntent = new Intent(Intent.ACTION_SEND);
        shareIntent.setType("text/plain");
        shareIntent.putExtra(Intent.EXTRA_TEXT, postUrl);

        // Show a toast message indicating that sharing was successful
        Toast.makeText(this, "Post shared successfully", Toast.LENGTH_SHORT).show();

        startActivity(Intent.createChooser(shareIntent, "Share with"));
    }

    @Override
    public void onCommentDelete(Comment comment) {
        if (usersManager.getSignedInUser() != null) {
            if (usersManager.getSignedInUser().getUserName().equals(comment.getAuthor().getUserName())) {
                post.deleteComment(comment);
                commentAdapter.notifyDataSetChanged();
            } else {
                Toast.makeText(this, "Only the comment author can delete it", Toast.LENGTH_SHORT).show();
            }
        } else {
            Toast.makeText(this, "Only the comment author can delete it", Toast.LENGTH_SHORT).show();
        }
    }
}
