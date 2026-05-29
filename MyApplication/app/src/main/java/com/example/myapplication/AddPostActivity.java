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

import com.example.myapplication.api.ApiClient;
import com.example.myapplication.api.ApiModels;
import com.example.myapplication.api.ApiService;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;

import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * AddPostActivity allows users to create and upload videos to the server.
 * Users can upload a thumbnail image and a video, enter text, then submit via API.
 */
public class AddPostActivity extends BaseActivity {
    private static final int UPLOAD_IMAGE_REQUEST = 1;
    private static final int UPLOAD_VIDEO_REQUEST = 2;

    private EditText videoEditText;
    private ImageView postImage;
    private ImageView postVideo;
    private VideoView postVideoView;
    private Bitmap imageB;
    private Uri videoUri;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.video_add_layout);

        videoEditText = findViewById(R.id.videoText);
        postImage = findViewById(R.id.postImage);
        postVideo = findViewById(R.id.postVideo);
        postVideoView = findViewById(R.id.postVideoView);
        Button btnAdd = findViewById(R.id.btnAddPost);

        postImage.setOnClickListener(v -> uploadImage());
        postVideo.setOnClickListener(v -> uploadVideo());
        btnAdd.setOnClickListener(v -> addPost());
    }

    private void uploadImage() {
        Intent pickImageIntent = new Intent(Intent.ACTION_PICK);
        pickImageIntent.setType("image/*");
        startActivityForResult(pickImageIntent, UPLOAD_IMAGE_REQUEST);
    }

    private void uploadVideo() {
        Intent pickVideoIntent = new Intent(Intent.ACTION_PICK);
        pickVideoIntent.setType("video/*");
        startActivityForResult(pickVideoIntent, UPLOAD_VIDEO_REQUEST);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if (resultCode == RESULT_OK && data != null) {
            Uri selectedUri = data.getData();
            if (selectedUri != null) {
                try {
                    if (requestCode == UPLOAD_IMAGE_REQUEST) {
                        imageB = BitmapFactory.decodeStream(
                                getContentResolver().openInputStream(selectedUri));
                        postImage.setImageBitmap(imageB);
                    } else if (requestCode == UPLOAD_VIDEO_REQUEST) {
                        MediaContr mediaController = new MediaContr(this, postVideoView);
                        postVideoView.setMediaController(mediaController);
                        videoUri = selectedUri;
                        postVideoView.setVideoURI(videoUri);
                        postVideoView.start();
                    }
                } catch (FileNotFoundException e) {
                    e.printStackTrace();
                    Toast.makeText(this, "File not found!", Toast.LENGTH_SHORT).show();
                }
            } else {
                Toast.makeText(this, "Failed to retrieve selected file URI.",
                        Toast.LENGTH_SHORT).show();
            }
        }
    }

    private void addPost() {
        String postText = videoEditText.getText().toString().trim();

        if (imageB == null) {
            Toast.makeText(this, "Please select a thumbnail image",
                    Toast.LENGTH_SHORT).show();
            return;
        }
        if (videoUri == null) {
            Toast.makeText(this, "Please select a video",
                    Toast.LENGTH_SHORT).show();
            return;
        }
        if (postText.isEmpty()) {
            Toast.makeText(this, "Please enter a title",
                    Toast.LENGTH_SHORT).show();
            return;
        }

        if (!tokenManager.isSignedIn()) {
            Toast.makeText(this, "Please sign in to upload",
                    Toast.LENGTH_SHORT).show();
            return;
        }

        // Save thumbnail to cache
        String thumbnailPath = saveImageToFile(imageB);
        String videoPath = videoUri.toString();

        String authHeader = "Bearer " + tokenManager.getToken();

        ApiModels.CreateVideoRequest request =
                new ApiModels.CreateVideoRequest(postText, postText, videoPath, thumbnailPath);

        Button btnAdd = findViewById(R.id.btnAddPost);
        btnAdd.setEnabled(false);
        btnAdd.setText("Uploading...");

        ApiClient.getClient().create(ApiService.class)
                .createVideo(authHeader, request)
                .enqueue(new Callback<Map<String, Object>>() {
                    @Override
                    public void onResponse(Call<Map<String, Object>> call,
                                           Response<Map<String, Object>> response) {
                        btnAdd.setEnabled(true);
                        btnAdd.setText("Add Post");
                        if (response.isSuccessful()) {
                            Toast.makeText(AddPostActivity.this,
                                    "Video uploaded!", Toast.LENGTH_SHORT).show();
                            setResult(RESULT_OK);
                            finish();
                        } else {
                            Toast.makeText(AddPostActivity.this,
                                    "Upload failed", Toast.LENGTH_SHORT).show();
                        }
                    }

                    @Override
                    public void onFailure(Call<Map<String, Object>> call, Throwable t) {
                        btnAdd.setEnabled(true);
                        btnAdd.setText("Add Post");
                        Toast.makeText(AddPostActivity.this,
                                "Upload error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
                    }
                });
    }

    private String saveImageToFile(Bitmap bitmap) {
        String fileName = "thumb_" + System.currentTimeMillis() + ".jpg";
        File file = new File(getCacheDir(), fileName);
        try (FileOutputStream fos = new FileOutputStream(file)) {
            bitmap.compress(Bitmap.CompressFormat.JPEG, 80, fos);
            return file.toURI().toString();
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }
}
