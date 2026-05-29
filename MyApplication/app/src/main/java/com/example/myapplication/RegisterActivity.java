package com.example.myapplication;

import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import com.example.myapplication.api.ApiClient;
import com.example.myapplication.api.ApiModels;
import com.example.myapplication.api.ApiService;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.regex.Pattern;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class RegisterActivity extends BaseActivity {
    public final static int UPLOAD_PIC_REQUEST = 1;

    private TextView invalidTextView;
    private EditText passwordEditText;
    private EditText verifyEditText;
    private EditText displayNameEditText;
    private EditText userNameEditText;
    private ImageView profilePicView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_register);

        invalidTextView = findViewById(R.id.invalidInput);
        passwordEditText = findViewById(R.id.passwordRegister);
        passwordEditText.addTextChangedListener(passwordWatcher);
        verifyEditText = findViewById(R.id.verifyPasswordRegister);
        verifyEditText.addTextChangedListener(verifyWatcher);
        displayNameEditText = findViewById(R.id.displayNameRegister);
        userNameEditText = findViewById(R.id.userNameRegister);
        profilePicView = findViewById(R.id.profilePicRegister);
    }

    private final TextWatcher passwordWatcher = new TextWatcher() {
        @Override
        public void beforeTextChanged(CharSequence s, int start, int count, int after) { }

        @Override
        public void onTextChanged(CharSequence s, int start, int before, int count) { }

        @Override
        public void afterTextChanged(Editable s) {
            validatePassword(s.toString());
        }
    };

    private final TextWatcher verifyWatcher = new TextWatcher() {
        @Override
        public void beforeTextChanged(CharSequence s, int start, int count, int after) { }

        @Override
        public void onTextChanged(CharSequence s, int start, int before, int count) { }

        @Override
        public void afterTextChanged(Editable s) {
            validateVerify(s.toString());
        }
    };

    private boolean validatePassword(String password) {
        boolean containsUppercase = !password.equals(password.toLowerCase());
        boolean containsLowercase = !password.equals(password.toUpperCase());
        boolean containsDigit = Pattern.compile("[0-9]").matcher(password).find();
        boolean has8Chars = password.length() >= 8;
        return containsUppercase && containsLowercase && containsDigit && has8Chars;
    }

    private boolean validateVerify(String verify) {
        String password = passwordEditText.getText().toString();
        return verify.equals(password);
    }

    public void register(View view) {
        String verify = verifyEditText.getText().toString();
        String password = passwordEditText.getText().toString();
        String displayName = displayNameEditText.getText().toString();
        String userName = userNameEditText.getText().toString();

        boolean validVerify = validateVerify(verify);
        boolean validPassword = validatePassword(password);
        boolean allFieldsFilled = !displayName.isEmpty() && !userName.isEmpty()
                && !password.isEmpty() && !verify.isEmpty();

        if (!allFieldsFilled) {
            invalidTextView.setVisibility(View.VISIBLE);
            invalidTextView.setText(R.string.fillAll);
            return;
        }
        if (!validPassword) {
            invalidTextView.setVisibility(View.VISIBLE);
            invalidTextView.setText(R.string.invalidPass);
            return;
        }
        if (!validVerify) {
            invalidTextView.setVisibility(View.VISIBLE);
            invalidTextView.setText(R.string.verifyPass);
            return;
        }

        if (allFieldsFilled && validPassword && validVerify) {
            invalidTextView.setVisibility(View.GONE);

            String email = userName + "@app.com";

            ApiModels.SignUpRequest request =
                    new ApiModels.SignUpRequest(userName, email, password, displayName);

            ApiClient.getClient().create(ApiService.class)
                    .signUp(request)
                    .enqueue(new Callback<ApiModels.AuthResponse>() {
                        @Override
                        public void onResponse(Call<ApiModels.AuthResponse> call,
                                               Response<ApiModels.AuthResponse> response) {
                            if (response.isSuccessful() && response.body() != null) {
                                ApiModels.AuthResponse auth = response.body();
                                ApiModels.UserResponse user = auth.user;
                                tokenManager.saveSession(
                                        auth.token,
                                        user.id,
                                        user.username,
                                        user.displayName,
                                        user.profilePictureUrl
                                );
                                Intent intent = new Intent(RegisterActivity.this, MainActivity.class);
                                startActivity(intent);
                                finish();
                            } else {
                                invalidTextView.setVisibility(View.VISIBLE);
                                String msg = "Registration failed";
                                if (response.code() == 409) {
                                    msg = "Username already taken";
                                } else if (response.code() == 400) {
                                    msg = "Invalid input, check requirements";
                                }
                                invalidTextView.setText(msg);
                            }
                        }

                        @Override
                        public void onFailure(Call<ApiModels.AuthResponse> call, Throwable t) {
                            invalidTextView.setVisibility(View.VISIBLE);
                            invalidTextView.setText("Connection error: " + t.getMessage());
                        }
                    });
        }
    }

    public void moveToMainUp(View view) {
        Intent intent = new Intent(this, MainActivity.class);
        startActivity(intent);
        finish();
    }

    public void uploadPic(View view) {
        Intent pickImageIntent = new Intent(Intent.ACTION_PICK);
        pickImageIntent.setDataAndType(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, "image/*");

        Intent takePictureIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);

        Intent combinedIntent = new Intent(Intent.ACTION_CHOOSER);
        combinedIntent.putExtra(Intent.EXTRA_INTENT, pickImageIntent);
        combinedIntent.putExtra(Intent.EXTRA_ALTERNATE_INTENTS, new Intent[]{takePictureIntent});
        combinedIntent.putExtra(Intent.EXTRA_TITLE, "Select Image");

        startActivityForResult(combinedIntent, UPLOAD_PIC_REQUEST);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == UPLOAD_PIC_REQUEST && resultCode == RESULT_OK) {
            if (data.getData() == null) {
                Bitmap thumbnail = (Bitmap) data.getExtras().get("data");
                saveImageToInternalStorage(thumbnail);
            } else {
                Uri newImageUri = data.getData();
                profilePicView.setImageURI(newImageUri);
                profilePicView.setColorFilter(Color.TRANSPARENT);
                profilePicView.setTag(newImageUri.toString());
            }
        }
    }

    private void saveImageToInternalStorage(Bitmap bitmap) {
        String fileName = "user_profile_pic.png";
        File internalStorageDir = getFilesDir();
        File imageFile = new File(internalStorageDir, fileName);
        try (FileOutputStream outputStream = new FileOutputStream(imageFile)) {
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, outputStream);
            Uri imagePath = Uri.fromFile(imageFile);
            profilePicView.setImageURI(imagePath);
            profilePicView.setColorFilter(Color.TRANSPARENT);
            profilePicView.setTag(imagePath.toString());
        } catch (IOException e) {
            e.printStackTrace();
            runOnUiThread(() -> Toast.makeText(this, "Error saving image. Please try again.", Toast.LENGTH_SHORT).show());
        }
    }
}
