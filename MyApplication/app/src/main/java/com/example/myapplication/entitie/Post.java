package com.example.myapplication.entitie;

import android.content.Context;
import android.graphics.Bitmap;

import org.json.JSONException;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

/**
 * The class representation of a post.
 */
public class Post {
    private UUID id; // Unique identifier for the post

    private String videoString; // URI string for the video
    private String text; // The text content of the post
    private Bitmap imageBit; // The bitmap image associated with the post (when applicable)
    private int imageResource; // Resource ID for images from res/raw
    private User author = null; // The author of the post
    private final String timeStamp; // Timestamp of post creation
    private final List<User> usersLiked; // List of users who liked the post
    private final List<Comment> comments; // List of comments on the post

    /**
     * Constructor for creating a new post with given details.
     *
     * @param text       The text content of the post.
     * @param imageBit   The bitmap image associated with the post.
     * @param videoString The URI string for the video.
     * @param author     The author of the post.
     */
    public Post(String text, Bitmap imageBit, String videoString, User author) {
        this.id = UUID.randomUUID();
        this.text = text;
        this.imageBit = imageBit;
        this.videoString = videoString;
        this.author = author;
        this.timeStamp = getCurrentDate();
        this.comments = new ArrayList<>();
        this.usersLiked = new ArrayList<>();
    }

    /**
     * Constructor for creating a post with existing ID, text, image, video, author, date, and empty lists.
     *
     * @param text       The text content of the post.
     * @param imageBit   The bitmap image associated with the post.
     * @param videoString The URI string for the video.
     * @param author     The author of the post.
     * @param id         The UUID of the post.
     * @param date       The timestamp of the post creation.
     */
    public Post(String text, Bitmap imageBit, String videoString, User author, UUID id, String date) {
        this.id = id;
        this.text = text;
        this.imageBit = imageBit;
        this.videoString = videoString;
        this.author = author;
        this.timeStamp = date;
        this.comments = new ArrayList<>();
        this.usersLiked = new ArrayList<>();
    }

    /**
     * JSON constructor - parses data from JSON.
     *
     * @param videoJson The JSON object containing post data.
     * @param context   The context for resolving resources.
     * @throws JSONException If there is an error parsing JSON.
     */
    public Post(JSONObject videoJson, Context context) throws JSONException {
        this.id = UUID.randomUUID();
        this.text = videoJson.getString("text");
        String imageName = videoJson.optString("image", "");
        this.imageResource = context.getResources().getIdentifier(imageName, "raw", context.getPackageName());
        JSONObject authorJson = videoJson.getJSONObject("author");
        this.author = new User(authorJson);
        this.timeStamp = videoJson.getString("timeStamp");
        this.videoString = null; // Default to null if no video URI provided
        this.imageBit = null; // Set to null as we're using resource ID
        this.comments = new ArrayList<>();
        this.usersLiked = new ArrayList<>();
    }

    /**
     * Gets the current date in dd/MM/yyyy format.
     *
     * @return The current date as a formatted string.
     */
    private String getCurrentDate() {
        Date currentDate = new Date();
        SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy", Locale.getDefault());
        return dateFormat.format(currentDate);
    }

    // Getters and setters

    /**
     * Retrieves the text content of the post.
     *
     * @return The text content of the post.
     */
    public String getText() {
        return this.text;
    }

    /**
     * Retrieves the bitmap image associated with the post.
     *
     * @return The bitmap image associated with the post.
     */
    public Bitmap getImageBit() {
        return this.imageBit;
    }

    /**
     * Retrieves the author of the post.
     *
     * @return The author of the post.
     */
    public User getAuthor() {
        return this.author;
    }

    /**
     * Retrieves the timestamp of the post creation.
     *
     * @return The timestamp of the post creation.
     */
    public String getTimeStamp() {
        return this.timeStamp;
    }

    /**
     * Retrieves the URI string for the video associated with the post.
     *
     * @return The URI string for the video.
     */
    public String getVideoString() {
        return this.videoString;
    }

    /**
     * Adds a user to the list of users who liked the post.
     *
     * @param userLiked The user to add to the list of liked users.
     */
    public void addLikeUsers(User userLiked) {
        this.usersLiked.add(userLiked);
    }

    /**
     * Removes a user from the list of users who liked the post.
     *
     * @param userDisLiked The user to remove from the list of liked users.
     */
    public void removeLikeUsers(User userDisLiked) {
        this.usersLiked.remove(userDisLiked);
    }

    /**
     * Checks if a user has liked the post.
     *
     * @param user The user to check.
     * @return True if the user has liked the post, false otherwise.
     */
    public boolean isLiked(User user) {
        return this.usersLiked.contains(user);
    }

    /**
     * Retrieves the list of users who liked the post.
     *
     * @return The list of users who liked the post.
     */
    public List<User> getLikedUsers() {
        return this.usersLiked;
    }

    /**
     * Retrieves the number of users who liked the post.
     *
     * @return The number of users who liked the post.
     */
    public int getLikeCount() {
        return this.usersLiked.size();
    }

    /**
     * Sets the text content of the post.
     *
     * @param text The new text content of the post.
     */
    public void setText(String text) {
        this.text = text;
    }

    /**
     * Sets the bitmap image associated with the post.
     *
     * @param imageBit The new bitmap image to associate with the post.
     */
    public void setImageBit(Bitmap imageBit) {
        this.imageBit = imageBit;
    }

    /**
     * Retrieves the list of comments on the post.
     *
     * @return The list of comments on the post.
     */
    public List<Comment> getComments() {
        return this.comments;
    }

    /**
     * Adds a comment to the list of comments on the post.
     *
     * @param comment The comment to add.
     */
    public void addComment(Comment comment) {
        this.comments.add(comment);
    }

    /**
     * Deletes a comment from the list of comments on the post.
     *
     * @param comment The comment to delete.
     */
    public void deleteComment(Comment comment) {
        this.comments.remove(comment);
    }

    /**
     * Retrieves the resource ID for images from resources.
     *
     * @return The resource ID for images from resources.
     */
    public int getImageResource() {
        return this.imageResource;
    }

    /**
     * Retrieves the UUID of the post.
     *
     * @return The UUID of the post.
     */
    public UUID getId() {
        return this.id;
    }

    /**
     * Sets the UUID of the post.
     *
     * @param uuid The new UUID to set for the post.
     */
    public void setId(UUID uuid) {
        this.id = uuid;
    }
}
