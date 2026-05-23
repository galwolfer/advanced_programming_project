package com.example.myapplication.adapters;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import android.widget.TextView;
import android.widget.VideoView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.myapplication.OnPostClickListener;
import com.example.myapplication.R;
import com.example.myapplication.entitie.Post;

import java.util.List;

/**
 * Adapter for displaying a list of posts in a RecyclerView.
 */
public class PostListAdapter extends RecyclerView.Adapter<PostListAdapter.PostViewHolder> {
    private final LayoutInflater mInflater;
    private List<Post> mPosts;
    private final OnPostClickListener onPostClickListener;

    /**
     * Constructor for the PostListAdapter.
     *
     * @param context            The context of the activity or fragment.
     * @param posts              The list of posts to display.
     * @param onPostClickListener Listener for handling clicks on posts.
     */
    public PostListAdapter(Context context, List<Post> posts, OnPostClickListener onPostClickListener) {
        this.mInflater = LayoutInflater.from(context);
        this.mPosts = posts;
        this.onPostClickListener = onPostClickListener;
    }

    /**
     * ViewHolder class for holding views of each post item in the RecyclerView.
     */
    public static class PostViewHolder extends RecyclerView.ViewHolder {
        private final TextView tvContent;
        private final TextView tvAuthor;
        private final TextView tvTimeStamp;
        private final ImageView ivPicture;
        private final ImageView ivAuthorPicture;
        private final VideoView videoView;
        private final RelativeLayout postLayout;

        /**
         * Constructor for the PostViewHolder.
         *
         * @param itemView The view representing a single item in the RecyclerView.
         */
        public PostViewHolder(View itemView) {
            super(itemView);
            tvContent = itemView.findViewById(R.id.tvContent);
            tvAuthor = itemView.findViewById(R.id.tvAuthor);
            tvTimeStamp = itemView.findViewById(R.id.tvTimeStamp);
            ivPicture = itemView.findViewById(R.id.ivPicture);
            videoView = itemView.findViewById(R.id.videoView);
            ivAuthorPicture = itemView.findViewById(R.id.ivAuthorPicture);
            postLayout = itemView.findViewById(R.id.videoLayout);
        }

        /**
         * Binds data from a Post object to the views in the ViewHolder.
         *
         * @param post     The Post object containing the data to bind.
         * @param listener Listener for handling clicks on posts.
         */
        public void bind(Post post, OnPostClickListener listener) {
            tvAuthor.setText(post.getAuthor().getDisplayName());
            tvContent.setText(post.getText());
            tvTimeStamp.setText(post.getTimeStamp());

            // Set the video path and image bitmap
            videoView.setVideoPath(post.getVideoString());
            ivPicture.setImageBitmap(post.getImageBit());

            // Set the author's profile picture
            if (post.getAuthor().getProfilePicture() != null) {
                ivAuthorPicture.setImageURI(post.getAuthor().getProfilePicture());
            } else {
                ivAuthorPicture.setImageResource(R.drawable.default_profile_pic);
            }

            // Handle click events on the itemView
            itemView.setOnClickListener(v -> listener.onPostClick(post));
        }
    }

    @NonNull
    @Override
    public PostViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View itemView = mInflater.inflate(R.layout.post_layout, parent, false);
        return new PostViewHolder(itemView);
    }

    @Override
    public void onBindViewHolder(@NonNull PostViewHolder holder, int position) {
        if (mPosts != null) {
            Post currentPost = mPosts.get(position);
            holder.bind(currentPost, onPostClickListener);
        }
    }

    @Override
    public int getItemCount() {
        return mPosts == null ? 0 : mPosts.size();
    }

    /**
     * Updates the list of posts in the adapter and notifies the RecyclerView of the change.
     *
     * @param posts The updated list of posts.
     */
    public void setPosts(List<Post> posts) {
        this.mPosts = posts;
        notifyDataSetChanged();
    }

    /**
     * Updates the list of posts in the adapter and notifies the RecyclerView of the change.
     *
     * @param updatedPosts The updated list of posts.
     */
    public void updatePosts(List<Post> updatedPosts) {
        this.mPosts = updatedPosts;
        notifyDataSetChanged();
    }
}
