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

import androidx.appcompat.app.AppCompatActivity;

import com.example.myapplication.entitie.User;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.regex.Pattern;

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

        // Initialize UI elements
        invalidTextView = findViewById(R.id.invalidInput);
        passwordEditText = findViewById(R.id.passwordRegister);
        passwordEditText.addTextChangedListener(passwordWatcher);
        verifyEditText = findViewById(R.id.verifyPasswordRegister);
        verifyEditText.addTextChangedListener(verifyWatcher);
        displayNameEditText = findViewById(R.id.displayNameRegister);
        userNameEditText = findViewById(R.id.userNameRegister);
        profilePicView = findViewById(R.id.profilePicRegister);
    }

    // TextWatcher for password field
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

    // TextWatcher for verify password field
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

    // Validate password criteria
    private boolean validatePassword(String password) {
        boolean containsUppercase = !password.equals(password.toLowerCase());
        boolean containsLowercase = !password.equals(password.toUpperCase());
        boolean containsDigit = Pattern.compile("[0-9]").matcher(password).find();
        boolean has8Chars = password.length() >= 8;

        boolean validPassword = containsUppercase && containsLowercase && containsDigit && has8Chars;

        return validPassword;
    }

    // Validate password match with verify field
    private boolean validateVerify(String verify) {
        String password = passwordEditText.getText().toString();

        boolean validVerify = verify.equals(password);

        return validVerify;
    }

    // Validate username availability
    private boolean validateUserName(String userName) {
        for (User user : usersManager.getSignedUpUsers()) {
            if (user.getUserName().equals(userName)) {
                // Username is already taken
                return false;
            }
        }
        // Username is available
        return true;
    }

    // Handle registration button click
    public void register(View view) {
        String verify = verifyEditText.getText().toString();
        String password = passwordEditText.getText().toString();
        String displayName = displayNameEditText.getText().toString();
        String userName = userNameEditText.getText().toString();

        // Validate input fields
        boolean validVerify = validateVerify(verify);
        boolean validPassword = validatePassword(password);
        boolean allFieldsFilled = !displayName.isEmpty() && !userName.isEmpty() && !password.isEmpty() && !verify.isEmpty();
        boolean validUserName = validateUserName(userName);

        // Display error messages for invalid input
        if (!allFieldsFilled) {
            invalidTextView.setVisibility(View.VISIBLE);
            invalidTextView.setText(R.string.fillAll);
            return;
        }
        if (!validUserName) {
            invalidTextView.setVisibility(View.VISIBLE);
            invalidTextView.setText(R.string.takenUserName);
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

        // If all validations pass, proceed with user registration
        if (allFieldsFilled && validUserName && validPassword && validVerify) {
            invalidTextView.setVisibility(View.GONE);

            Uri profilePicUri = null;
            if (profilePicView.getTag() != null) {
                profilePicUri = Uri.parse(profilePicView.getTag().toString());
            }

            // Create new User object with provided details
            User newUser = new User(displayName, userName, profilePicUri, password);
            usersManager.addUser(newUser);

            // Set the signed-in user and navigate to home activity
            usersManager.setSignedInUser(newUser);
            Intent intent = new Intent(this, MainActivity.class);
            startActivity(intent);
            finish(); // Close the RegisterActivity
        }
    }

    // Navigate to main activity upon cancel
    public void moveToMainUp(View view) {
        Intent intent = new Intent(this, MainActivity.class);
        startActivity(intent);
        finish();
    }

    // Handle profile picture upload button click
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

    // Handle result from profile picture selection
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == UPLOAD_PIC_REQUEST && resultCode == RESULT_OK) {
            if (data.getData() == null) {
                Bitmap thumbnail = (Bitmap) data.getExtras().get("data");
                saveImageToInternalStorage(thumbnail); // Handle camera capture
            } else {
                Uri newImageUri = data.getData();
                profilePicView.setImageURI(newImageUri); // Display selected image
                profilePicView.setColorFilter(Color.TRANSPARENT);
                profilePicView.setTag(newImageUri.toString()); // Store URI as tag
            }
        }
    }

    // Save selected image to internal storage
    private void saveImageToInternalStorage(Bitmap bitmap) {
        String fileName = "user_profile_pic.png";
        File internalStorageDir = getFilesDir();
        File imageFile = new File(internalStorageDir, fileName);
        try (FileOutputStream outputStream = new FileOutputStream(imageFile)) {
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, outputStream);
            Uri imagePath = Uri.fromFile(imageFile);
            profilePicView.setImageURI(imagePath); // Display saved image
            profilePicView.setColorFilter(Color.TRANSPARENT);
            profilePicView.setTag(imagePath.toString()); // Store URI as tag
        } catch (IOException e) {
            e.printStackTrace();
            runOnUiThread(() -> Toast.makeText(this, "Error saving image. Please try again.", Toast.LENGTH_SHORT).show());
        }
    }
}
