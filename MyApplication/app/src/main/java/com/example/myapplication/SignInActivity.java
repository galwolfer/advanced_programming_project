package com.example.myapplication;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.EditText;
import android.widget.Toast;

import com.example.myapplication.api.ApiClient;
import com.example.myapplication.api.ApiModels;
import com.example.myapplication.api.ApiService;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class SignInActivity extends BaseActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_signin);

        if (tokenManager.isSignedIn()) {
            Intent intent = new Intent(this, MainActivity.class);
            startActivity(intent);
            finish();
        }
    }

    public void Register(View view) {
        Intent intent = new Intent(this, RegisterActivity.class);
        startActivity(intent);
        finish();
    }

    public void moveToFeed(View view) {
        EditText usernameField = findViewById(R.id.usernameLogin);
        EditText passwordField = findViewById(R.id.passwordLogin);
        String username = usernameField.getText().toString().trim();
        String password = passwordField.getText().toString();

        if (username.isEmpty() || password.isEmpty()) {
            Toast.makeText(this, "Please enter username and password", Toast.LENGTH_SHORT).show();
            return;
        }

        ApiClient.getClient().create(ApiService.class)
                .signIn(new ApiModels.SignInRequest(username, password))
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
                            Intent intent = new Intent(SignInActivity.this, MainActivity.class);
                            startActivity(intent);
                            finish();
                        } else {
                            String msg = "Invalid username or password";
                            if (response.code() == 401) {
                                msg = "Invalid username or password";
                            } else if (response.code() >= 500) {
                                msg = "Server error, please try again";
                            }
                            Toast.makeText(SignInActivity.this, msg, Toast.LENGTH_LONG).show();
                        }
                    }

                    @Override
                    public void onFailure(Call<ApiModels.AuthResponse> call, Throwable t) {
                        Toast.makeText(SignInActivity.this,
                                "Connection failed: " + t.getMessage(), Toast.LENGTH_LONG).show();
                    }
                });
    }

    public void moveToMainIn(View view) {
        Intent intent = new Intent(this, MainActivity.class);
        startActivity(intent);
        finish();
    }
}
