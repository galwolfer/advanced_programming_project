package com.example.myapplication;

import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.Toast;
import android.widget.VideoView;

import androidx.annotation.Nullable;

import com.example.myapplication.adapters.PostListAdapter;
import com.example.myapplication.entitie.Post;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;

/**
 * AddPostActivity allows users to create and upload posts containing images and videos.
 * Users can upload an image and a video, enter text, and then add the post to the app.
 */
public class AddPostActivity extends BaseActivity {
    private static final int UPLOAD_IMAGE_REQUEST = 1;
    private static final int UPLOAD_VIDEO_REQUEST = 2;

    private EditText videoEditText;      // EditText for entering post text
    private ImageView postImage;         // ImageView to upload image
    private ImageView postVideo;         // ImageView to upload video
    private VideoView postVideoView;     // VideoView to display selected video
    private Bitmap imageB;               // Bitmap to store uploaded image
    private Uri videoUri;                // Uri to store uploaded video

    private List<Post> userPosts;        // List of user's posts
    private PostListAdapter postAdapter; // Adapter for RecyclerView

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.video_add_layout);

        // Initialize UI elements and set click listeners
        videoEditText = findViewById(R.id.videoText);
        postImage = findViewById(R.id.postImage);
        postVideo = findViewById(R.id.postVideo);
        postVideoView = findViewById(R.id.postVideoView);
        Button btnAdd = findViewById(R.id.btnAddPost);

        // Click listener for uploading an image
        postImage.setOnClickListener(v -> uploadImage());

        // Click listener for uploading a video
        postVideo.setOnClickListener(v -> uploadVideo());

        // Click listener for adding the post
        btnAdd.setOnClickListener(v -> addPost());
    }

    /**
     * Initiates an intent to pick an image from the gallery.
     */
    private void uploadImage() {
        Intent pickImageIntent = new Intent(Intent.ACTION_PICK);
        pickImageIntent.setType("image/*");
        startActivityForResult(pickImageIntent, UPLOAD_IMAGE_REQUEST);
    }

    /**
     * Initiates an intent to pick a video from the gallery.
     */
    private void uploadVideo() {
        Intent pickVideoIntent = new Intent(Intent.ACTION_PICK);
        pickVideoIntent.setType("video/*");
        startActivityForResult(pickVideoIntent, UPLOAD_VIDEO_REQUEST);
    }

    /**
     * Handles the result from picking an image or video.
     *
     * @param requestCode The request code of the intent
     * @param resultCode  The result code returned
     * @param data        The intent data containing the result
     */
    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if (resultCode == RESULT_OK && data != null) {
            Uri selectedUri = data.getData();
            if (selectedUri != null) {
                try {
                    if (requestCode == UPLOAD_IMAGE_REQUEST) {
                        // Load selected image into Bitmap and display in ImageView
                        imageB = BitmapFactory.decodeStream(getContentResolver().openInputStream(selectedUri));
                        postImage.setImageBitmap(imageB);
                    } else if (requestCode == UPLOAD_VIDEO_REQUEST) {
                        // Initialize custom MediaController for video playback
                        MediaContr mediaController = new MediaContr(this, postVideoView);
                        postVideoView.setMediaController(mediaController);

                        // Store video URI and display in VideoView
                        videoUri = selectedUri;
                        postVideoView.setVideoURI(videoUri);
                        postVideoView.start(); // Start playing the video
                    }
                } catch (FileNotFoundException e) {
                    e.printStackTrace();
                    Toast.makeText(this, "File not found!", Toast.LENGTH_SHORT).show();
                }
            } else {
                Toast.makeText(this, "Failed to retrieve selected file URI.", Toast.LENGTH_SHORT).show();
            }
        }
    }

    /**
     * Validates inputs and adds a new post containing image, video, and text.
     */
    private void addPost() {
        String postText = videoEditText.getText().toString().trim();

        // Check if both image and video are uploaded
        if (imageB == null) {
            Toast.makeText(this, "Please upload an image", Toast.LENGTH_SHORT).show();
            return;
        }
        if (videoUri == null) {
            Toast.makeText(this, "Please upload a video", Toast.LENGTH_SHORT).show();
            return;
        }

        // Check if post text is entered
        if (postText.isEmpty()) {
            Toast.makeText(this, "Please enter post text", Toast.LENGTH_SHORT).show();
            return;
        }

        // Generate a unique file name for the video
        String vidName = "video_" + System.currentTimeMillis() + ".mp4";
        File vidFile = vidToFile(videoUri, vidName);

        // Check if video file creation was successful
        if (vidFile == null) {
            Toast.makeText(this, "Failed to save video file.", Toast.LENGTH_SHORT).show();
            return;
        }

        // Create a new Post object and add it to the list
        Post newPost = new Post(postText, imageB, vidFile.getAbsolutePath(), usersManager.getSignedInUser());
        postListManager.addPost(newPost);

        // Set result to indicate success and finish the activity
        setResult(RESULT_OK);
        finish();
    }

    /**
     * Converts the selected video URI to a file and saves it in internal storage.
     *
     * @param videoUri  The URI of the selected video
     * @param videoName The name to assign to the video file
     * @return The File object representing the saved video file
     */
    private File vidToFile(Uri videoUri, String videoName) {
        File videoFile = new File(getFilesDir(), videoName);
        try (InputStream inputStream = getContentResolver().openInputStream(videoUri);
             FileOutputStream outputStream = new FileOutputStream(videoFile)) {

            byte[] buffer = new byte[1024];
            int length;
            while ((length = inputStream.read(buffer)) > 0) {
                outputStream.write(buffer, 0, length);
            }

        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
        return videoFile;
    }
}
