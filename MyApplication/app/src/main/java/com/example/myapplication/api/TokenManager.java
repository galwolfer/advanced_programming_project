package com.example.myapplication.api;

import android.content.Context;
import android.content.SharedPreferences;

public class TokenManager {
    private static final String PREF_NAME = "wetube_auth";
    private static final String KEY_TOKEN = "jwt_token";
    private static final String KEY_USER_JSON = "user_json";
    private SharedPreferences prefs;
    
    public TokenManager(Context context) {
        prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
    }
    
    public void saveToken(String token) { prefs.edit().putString(KEY_TOKEN, token).apply(); }
    public String getToken() { return prefs.getString(KEY_TOKEN, null); }
    public void clearToken() { prefs.edit().remove(KEY_TOKEN).remove(KEY_USER_JSON).apply(); }
    public boolean isLoggedIn() { return getToken() != null; }
    public String getAuthHeader() { String t = getToken(); return t != null ? "Bearer " + t : null; }
    public void saveUser(String userJson) { prefs.edit().putString(KEY_USER_JSON, userJson).apply(); }
    public String getUserJson() { return prefs.getString(KEY_USER_JSON, null); }
}