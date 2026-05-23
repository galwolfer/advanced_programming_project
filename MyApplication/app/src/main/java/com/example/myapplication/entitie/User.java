package com.example.myapplication.entitie;

import android.net.Uri;
import android.os.Parcel;
import android.os.Parcelable;

import org.json.JSONException;
import org.json.JSONObject;

public class User implements Parcelable {
    private String user_pass; // User's password
    private String displayName; // User's display name
    private String userName; // User's username
    private Uri profilePicture; // User's profile picture URI

    /**
     * Default constructor for creating a default admin user.
     */
    public User() {
        this("Admin", "admin", null, "12345678aA");
    }

    /**
     * Parameterized constructor to create a new user.
     *
     * @param displayName    User's display name.
     * @param userName       User's username.
     * @param profilePicture User's profile picture URI.
     * @param pass           User's password.
     */
    public User(String displayName, String userName, Uri profilePicture, String pass) {
        this.user_pass = pass;
        this.displayName = displayName;
        this.userName = userName;
        this.profilePicture = profilePicture;
    }

    /**
     * JSON constructor to create a user from a JSON object.
     *
     * @param userJson JSON object containing user information.
     * @throws JSONException If there is an error parsing JSON data.
     */
    public User(JSONObject userJson) throws JSONException {
        this.user_pass = null; // Password not included in JSON
        this.displayName = userJson.optString("displayName", "Default Display Name");
        // Extracting username if available from JSON
        this.userName = ""; // You may need to determine how to extract the username from the JSON if available
        String imageUri = userJson.optString("imageUri");
        this.profilePicture = imageUri.isEmpty() ? null : Uri.parse(imageUri);
    }

    // Parcelable implementation methods

    protected User(Parcel in) {
        user_pass = in.readString();
        displayName = in.readString();
        userName = in.readString();
        profilePicture = in.readParcelable(Uri.class.getClassLoader());
    }

    @Override
    public void writeToParcel(Parcel dest, int flags) {
        dest.writeString(user_pass);
        dest.writeString(displayName);
        dest.writeString(userName);
        dest.writeParcelable(profilePicture, flags);
    }

    @Override
    public int describeContents() {
        return 0;
    }

    public static final Creator<User> CREATOR = new Creator<User>() {
        @Override
        public User createFromParcel(Parcel in) {
            return new User(in);
        }

        @Override
        public User[] newArray(int size) {
            return new User[size];
        }
    };

    // Getters and Setters

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public Uri getProfilePicture() {
        return profilePicture;
    }

    public void setProfilePicture(Uri profilePicture) {
        this.profilePicture = profilePicture;
    }

    public String getUser_pass() {
        return user_pass;
    }

    public void setUser_pass(String user_pass) {
        this.user_pass = user_pass;
    }
}
