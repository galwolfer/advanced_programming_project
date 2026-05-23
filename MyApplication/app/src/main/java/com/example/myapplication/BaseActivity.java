package com.example.myapplication;

import android.os.Bundle;

import androidx.appcompat.app.AppCompatActivity;

import com.example.myapplication.entitie.User;

import java.util.ArrayList;
import java.util.Set;
import java.util.UUID;

/**
 * BaseActivity serves as the base class for all activities in the application.
 * It manages common functionality such as theme setting (dark mode) and initialization
 * of post and user managers.
 */
public class BaseActivity extends AppCompatActivity {
    private static boolean isInDarkMode = false; // Flag to track dark mode state
    protected PostListManager postListManager; // Manager for handling posts
    protected UsersManager usersManager; // Manager for handling users

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Set the appropriate theme based on the dark mode state
        if (isInDarkMode) {
            setTheme(R.style.AppTheme_Dark);
        } else {
            setTheme(R.style.AppTheme);
        }

        super.onCreate(savedInstanceState);

        // Initialize post and user managers
        postListManager = PostListManager.getInstance(this);
        usersManager = UsersManager.getInstance();

    }

    /**
     * Toggles the dark mode state and recreates the activity to apply the new theme.
     */
    protected void changeDarkMode() {
        isInDarkMode = !isInDarkMode;
        recreate();
    }
}
