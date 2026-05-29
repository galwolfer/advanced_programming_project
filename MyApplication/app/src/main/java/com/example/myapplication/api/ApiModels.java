package com.example.myapplication.api;

import com.google.gson.annotations.SerializedName;

import java.util.List;

/**
 * Container for all API request/response POJOs used with Retrofit/Gson.
 * The server returns `id` (not `_id`) for all MongoDB documents.
 */
public class ApiModels {

    // ═══════════════════════════════════════════════════════════════════
    //  REQUEST BODIES
    // ═══════════════════════════════════════════════════════════════════

    public static class SignInRequest {
        public String username;
        public String password;

        public SignInRequest(String username, String password) {
            this.username = username;
            this.password = password;
        }
    }

    public static class SignUpRequest {
        public String username;
        public String email;
        public String password;
        public String displayName;

        public SignUpRequest(String username, String email, String password, String displayName) {
            this.username = username;
            this.email = email;
            this.password = password;
            this.displayName = displayName;
        }
    }

    public static class CreateVideoRequest {
        public String title;
        public String description;
        public String videoUrl;
        public String thumbnailUrl;

        public CreateVideoRequest(String title, String description,
                                  String videoUrl, String thumbnailUrl) {
            this.title = title;
            this.description = description;
            this.videoUrl = videoUrl;
            this.thumbnailUrl = thumbnailUrl;
        }
    }

    public static class AddCommentRequest {
        public String text;

        public AddCommentRequest(String text) {
            this.text = text;
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    //  RESPONSE MODELS
    // ═══════════════════════════════════════════════════════════════════

    public static class AuthResponse {
        public String token;
        public UserResponse user;
    }

    /** The server wraps user objects in { user: {...} }. */
    public static class UserWrapper {
        public UserResponse user;
    }

    public static class UserResponse {
        @SerializedName("id")
        public String id;
        public String username;
        public String email;
        public String displayName;
        public String profilePictureUrl;
        public String description;
        public String bannerUrl;
        public int subscribersCount;
    }

    public static class VideoListResponse {
        public List<VideoResponse> videos;
        public List<String> categories;
        public int totalPages;
        public int currentPage;
        public int totalVideos;
    }

    public static class VideoDetailResponse {
        public VideoResponse video;
        public List<CommentResponse> comments;
    }

    public static class VideoResponse {
        @SerializedName("id")
        public String id;
        public String title;
        public String description;
        public String videoUrl;
        public String thumbnailUrl;
        public String uploaderName;
        public String uploaderId;
        public String category;
        public String createdAt;
        public int views;
        public int likesCount;
        public int commentsCount;
        public boolean likedByCurrentUser;
    }

    public static class CommentResponse {
        @SerializedName("id")
        public String id;
        public String text;
        public String authorId;
        public String authorName;
        public String authorAvatarUrl;
        public String createdAt;
    }

    public static class LikeResponse {
        public boolean likedByCurrentUser;
        public int likesCount;
    }

    /** Wraps { comment: { ... }, commentsCount: N } from POST comment response. */
    public static class CreateCommentResponse {
        public CommentResponse comment;
        public int commentsCount;
    }
}
