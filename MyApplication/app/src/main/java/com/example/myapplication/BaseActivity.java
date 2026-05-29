package com.example.myapplication;

import android.os.Bundle;

import androidx.appcompat.app.AppCompatActivity;

import com.example.myapplication.api.TokenManager;

/**
 * BaseActivity serves as the base class for all activities in the application.
 * Manages dark mode theme and provides TokenManager for API authentication.
 */
public class BaseActivity extends AppCompatActivity {
    private static boolean isInDarkMode = false;
    protected TokenManager tokenManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        if (isInDarkMode) {
            setTheme(R.style.AppTheme_Dark);
        } else {
            setTheme(R.style.AppTheme);
        }

        super.onCreate(savedInstanceState);

        tokenManager = TokenManager.getInstance(this);
    }

    protected void changeDarkMode() {
        isInDarkMode = !isInDarkMode;
        recreate();
    }
}
