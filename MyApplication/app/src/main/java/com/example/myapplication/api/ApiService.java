package com.example.myapplication.api;

import java.util.Map;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.DELETE;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.POST;
import retrofit2.http.Path;
import retrofit2.http.Query;

/**
 * Retrofit service interface for the WeTube Express API.
 * Auth headers are passed manually via @Header("Authorization") since
 * ApiClient does not inject tokens automatically.
 */
public interface ApiService {

    // ─── Auth ────────────────────────────────────────────────────────

    @POST("auth/signin")
    Call<ApiModels.AuthResponse> signIn(@Body ApiModels.SignInRequest request);

    @POST("auth/signup")
    Call<ApiModels.AuthResponse> signUp(@Body ApiModels.SignUpRequest request);

    @GET("auth/me")
    Call<ApiModels.UserWrapper> getMe(@Header("Authorization") String authHeader);

    // ─── Videos ──────────────────────────────────────────────────────

    @GET("videos")
    Call<ApiModels.VideoListResponse> getVideos(
            @Query("search") String search,
            @Query("category") String category,
            @Query("sort") String sort,
            @Query("page") Integer page,
            @Query("limit") Integer limit
    );

    @GET("videos/{id}")
    Call<ApiModels.VideoDetailResponse> getVideoDetails(@Path("id") String id);

    @POST("videos")
    Call<Map<String, Object>> createVideo(
            @Header("Authorization") String authHeader,
            @Body ApiModels.CreateVideoRequest request
    );

    @POST("videos/{id}/view")
    Call<Map<String, Object>> incrementViews(@Path("id") String id);

    @POST("videos/{id}/like")
    Call<ApiModels.LikeResponse> toggleLike(
            @Header("Authorization") String authHeader,
            @Path("id") String id
    );

    @POST("videos/{id}/comments")
    Call<ApiModels.CreateCommentResponse> addComment(
            @Header("Authorization") String authHeader,
            @Path("id") String id,
            @Body ApiModels.AddCommentRequest request
    );

    @DELETE("videos/{id}/comments/{commentId}")
    Call<Map<String, String>> deleteComment(
            @Header("Authorization") String authHeader,
            @Path("id") String id,
            @Path("commentId") String commentId
    );

    @DELETE("videos/{id}")
    Call<Map<String, String>> deleteVideo(
            @Header("Authorization") String authHeader,
            @Path("id") String id
    );

    // ─── Users ───────────────────────────────────────────────────────

    @GET("users/{id}")
    Call<ApiModels.UserWrapper> getUser(
            @Header("Authorization") String authHeader,
            @Path("id") String userId
    );

    @GET("users/{id}/videos")
    Call<ApiModels.VideoListResponse> getUserVideos(
            @Header("Authorization") String authHeader,
            @Path("id") String userId
    );
}
