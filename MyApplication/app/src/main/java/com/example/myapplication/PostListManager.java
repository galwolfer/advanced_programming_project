package com.example.myapplication;

import android.content.ContentResolver;
import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Build;

import com.example.myapplication.entitie.Post;
import com.example.myapplication.entitie.User;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * PostListManager is a singleton class that manages a list of posts,
 * including adding, removing, and searching posts.
 */
public class PostListManager {
    private static PostListManager instance; // Singleton instance
    private List<Post> posts; // List of posts
    private Context context; // Application context
    private Set<UUID> postIds; // Set of post IDs to ensure uniqueness

    /**
     * Private constructor to prevent instantiation from other classes.
     * Initializes the context, posts list, and post IDs set.
     * Adds default posts to the list.
     *
     * @param context the application context
     */
    private PostListManager(Context context) {
        this.context = context.getApplicationContext();
        posts = new ArrayList<>();
        postIds = new HashSet<>();
        addDefPosts();
    }

    /**
     * Returns the singleton instance of PostListManager.
     * Creates the instance if it does not already exist.
     *
     * @param context the application context
     * @return the singleton instance of PostListManager
     */
    public static synchronized PostListManager getInstance(Context context) {
        if (instance == null) {
            instance = new PostListManager(context);
        }
        return instance;
    }

    /**
     * Adds default posts to the posts list.
     */
    private void addDefPosts() {
        posts.add(new Post("Hello, World!", fetchImageBitmap(R.drawable.thumbnail1), fetchVideoFilePath(R.raw.video1, "video1.mp4"),
                new User("itube", "user1", getUriFromDrawable(R.drawable.profilepic1), "1"), generateUniqueId(), "1/1/2000"));

        posts.add(new Post("Nature", fetchImageBitmap(R.drawable.thumbnail2), fetchVideoFilePath(R.raw.video2, "video2.mp4"),
                new User("natureLover", "user2", getUriFromDrawable(R.drawable.profilepic1), "1"), generateUniqueId(), "5/10/1990"));

        posts.add(new Post("Sheep on the move", fetchImageBitmap(R.drawable.thumbnail3), fetchVideoFilePath(R.raw.video3, "video3.mp4"),
                new User("SheepMan", "user3", getUriFromDrawable(R.drawable.profilepic1), "1"), generateUniqueId(), "18/12/1995"));

        posts.add(new Post("The cutest cat ever!", fetchImageBitmap(R.drawable.thumbnail4), fetchVideoFilePath(R.raw.video4, "video4.mp4"),
                new User("CatLover", "user4", getUriFromDrawable(R.drawable.profilepic1), "1"), generateUniqueId(), "30/1/2000"));

        posts.add(new Post("Above the sea", fetchImageBitmap(R.drawable.thumbnail5), fetchVideoFilePath(R.raw.video5, "video5.mp4"),
                new User("viewPerson", "user5", getUriFromDrawable(R.drawable.profilepic1), "1"), generateUniqueId(), "15/6/2005"));

        posts.add(new Post("The power of dance!", fetchImageBitmap(R.drawable.thumbnail6), fetchVideoFilePath(R.raw.video6, "video6.mp4"),
                new User("DanceLessons", "user6", getUriFromDrawable(R.drawable.profilepic1), "1"), generateUniqueId(), "14/7/2005"));

        posts.add(new Post("Watch my new controller", fetchImageBitmap(R.drawable.thumbnail7), fetchVideoFilePath(R.raw.video7, "video7.mp4"),
                new User("PlayerOne", "user7", getUriFromDrawable(R.drawable.profilepic1), "1"), generateUniqueId(), "9/9/2010"));

        posts.add(new Post("Learn how to code with me", fetchImageBitmap(R.drawable.thumbnail8), fetchVideoFilePath(R.raw.video8, "video8.mp4"),
                new User("ComputerGuy", "user8", getUriFromDrawable(R.drawable.profilepic1), "1"), generateUniqueId(), "15/6/2005"));

        posts.add(new Post("The hidden world", fetchImageBitmap(R.drawable.thumbnail9), fetchVideoFilePath(R.raw.video9, "video9.mp4"),
                new User("CosmosMan", "user9", getUriFromDrawable(R.drawable.profilepic1), "1"), generateUniqueId(), "23/5/2015"));

        posts.add(new Post("Formula in 3D!", fetchImageBitmap(R.drawable.thumbnail10), fetchVideoFilePath(R.raw.video10, "video10.mp4"),
                new User("MathWoman", "user10", getUriFromDrawable(R.drawable.profilepic1), "1"), generateUniqueId(), "11/11/2011"));
    }

    /**
     * Returns the URI for a drawable resource.
     *
     * @param drawableId the drawable resource ID
     * @return the URI for the drawable resource
     */
    private Uri getUriFromDrawable(int drawableId) {
        return Uri.parse(ContentResolver.SCHEME_ANDROID_RESOURCE +
                "://" + context.getResources().getResourcePackageName(drawableId)
                + '/' + context.getResources().getResourceTypeName(drawableId) + '/' +
                context.getResources().getResourceEntryName(drawableId));
    }

    /**
     * Returns the file path for a video resource by copying it to the app's files directory.
     *
     * @param videoResourceId the video resource ID
     * @param fileName        the file name to be used in the files directory
     * @return the file path for the video resource
     */
    private String fetchVideoFilePath(int videoResourceId, String fileName) {
        File videoFile = copyRawResourceToFileForVideo(videoResourceId, fileName);
        if (videoFile != null) {
            return videoFile.getAbsolutePath();
        } else {
            return null;
        }
    }

    /**
     * Copies a raw video resource to a file in the app's files directory.
     *
     * @param videoResourceId the video resource ID
     * @param fileName        the file name to be used in the files directory
     * @return the File object representing the copied video file
     */
    private File copyRawResourceToFileForVideo(int videoResourceId, String fileName) {
        try {
            InputStream inputStream = context.getResources().openRawResource(videoResourceId);
            File videoFile = new File(context.getFilesDir(), fileName);
            FileOutputStream outputStream = new FileOutputStream(videoFile);

            byte[] buffer = new byte[1024];
            int length;
            while ((length = inputStream.read(buffer)) > 0) {
                outputStream.write(buffer, 0, length);
            }

            outputStream.close();
            inputStream.close();

            return videoFile;
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }

    /**
     * Returns a Bitmap object for a drawable resource.
     *
     * @param drawableId the drawable resource ID
     * @return the Bitmap object for the drawable resource
     */
    private Bitmap fetchImageBitmap(int drawableId) {
        return BitmapFactory.decodeResource(context.getResources(), drawableId);
    }

    /**
     * Sets the list of posts.
     *
     * @param posts the list of posts
     */
    public void setPosts(List<Post> posts) {
        this.posts = posts;
    }

    /**
     * Returns the list of posts.
     *
     * @return the list of posts
     */
    public List<Post> getPosts() {
        return posts;
    }

    /**
     * Generates a unique ID for a post.
     *
     * @return the unique ID for a post
     */
    private UUID generateUniqueId() {
        UUID id;
        do {
            id = UUID.randomUUID();
        } while (postIds.contains(id));
        postIds.add(id);
        return id;
    }

    /**
     * Adds a post to the posts list and generates a unique ID for it.
     *
     * @param post the post to be added
     */
    public void addPost(Post post) {
        post.setId(generateUniqueId());
        posts.add(post);
    }

    /**
     * Returns a post by its ID.
     *
     * @param id the ID of the post
     * @return the post with the specified ID, or null if not found
     */
    public Post getPostById(UUID id) {
        for (Post post : posts) {
            if (post.getId().equals(id)) {
                return post;
            }
        }
        return null;
    }

    /**
     * Removes a post from the posts list.
     *
     * @param post the post to be removed
     */
    public void removePost(Post post) {
        posts.remove(post);
    }

    /**
     * Searches for posts based on the given search text.
     * Filters posts by text content or author display name and ranks results by relevance.
     *
     * @param searchText the search text
     * @return the list of matching posts, or null if no results found
     */
    public List<Post> searchPosts(String searchText) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            List<Post> results = posts.stream()
                    .filter(post -> post.getText().toLowerCase().contains(searchText.toLowerCase()) ||
                            post.getAuthor().getDisplayName().toLowerCase().contains(searchText.toLowerCase()))
                    .collect(Collectors.toList());

            // Rank posts based on the relevance
            results.sort(Comparator.comparingInt((Post post) -> {
                int rank = 0;
                if (post.getText().toLowerCase().contains(searchText.toLowerCase())) rank += 3;
                if (post.getAuthor().getDisplayName().toLowerCase().contains(searchText.toLowerCase())) rank += 2;
                return rank;
            }).reversed());

            return results.isEmpty() ? null : results; // Return null if no results found
        }
        return null;
    }



}
