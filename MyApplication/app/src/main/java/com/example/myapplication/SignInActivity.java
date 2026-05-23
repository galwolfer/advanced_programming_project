package com.example.myapplication;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.EditText;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.myapplication.entitie.User;

public class SignInActivity extends BaseActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_signin);


        // Optionally, check if a user is already signed in and handle it
        if (usersManager.getSignedInUser() != null) {
            // If a user is signed in, navigate to MainActivity
            Intent intent = new Intent(this, MainActivity.class);
            startActivity(intent);
            finish(); // Finish the SignInActivity to prevent returning to it
        }
    }

    // Method to navigate to RegisterActivity for user registration
    public void Register(View view) {
        Intent intent = new Intent(this, RegisterActivity.class);
        startActivity(intent);
        finish(); // Finish the SignInActivity to prevent returning to it
    }

    // Method to handle login attempt and navigation to MainActivity
    public void moveToFeed(View view) {
        EditText id = findViewById(R.id.usernameLogin);
        EditText pass = findViewById(R.id.passwordLogin);
        String enteredUsername = id.getText().toString();
        String enteredPassword = pass.getText().toString();

        // Check entered credentials against registered users
        for (User user : usersManager.getSignedUpUsers()) {
            if (user.getUserName().equals(enteredUsername) && user.getUser_pass().equals(enteredPassword)) {
                // Set the signed-in user and navigate to MainActivity
                usersManager.setSignedInUser(user);
                Intent intent = new Intent(this, MainActivity.class);
                startActivity(intent);
                finish(); // Finish the SignInActivity to prevent returning to it
                return;
            }
        }
        // Display a toast message for invalid login attempt
        Toast.makeText(this, "Oops\n Wrong username or password", Toast.LENGTH_LONG).show();
    }

    // Method to handle navigation to MainActivity without login
    public void moveToMainIn(View view) {
        Intent intent = new Intent(this, MainActivity.class);
        startActivity(intent);
        finish(); // Finish the SignInActivity to prevent returning to it
    }

    // Method to handle user logout
    public void logoutApp() {
        usersManager.signOut();
    }
}
