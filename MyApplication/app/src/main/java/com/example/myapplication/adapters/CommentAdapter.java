package com.example.myapplication.adapters;

import android.net.Uri;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.myapplication.R;
import com.example.myapplication.entitie.Comment;

import java.util.List;

/**
 * Adapter for displaying comments in a RecyclerView.
 */
public class CommentAdapter extends RecyclerView.Adapter<CommentAdapter.CommentViewHolder> {
    private List<Comment> comments;

    /**
     * Interface for handling comment deletion events.
     */
    public interface OnCommentDeleteListener {
        void onCommentDelete(Comment comment);
    }
    private OnCommentDeleteListener onCommentDeleteListener;

    /**
     * Constructor for the CommentAdapter.
     *
     * @param comments                The list of comments to display.
     * @param onCommentDeleteListener Listener for handling comment deletion events.
     */
    public CommentAdapter(List<Comment> comments, OnCommentDeleteListener onCommentDeleteListener) {
        this.comments = comments;
        this.onCommentDeleteListener = onCommentDeleteListener;
    }

    /**
     * Updates the dataset with new comments and notifies the RecyclerView.
     *
     * @param comments The updated list of comments.
     */
    public void updateData(List<Comment> comments) {
        this.comments = comments;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public CommentViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        // Inflate the comment_item layout to create a new ViewHolder
        View itemView = LayoutInflater.from(parent.getContext()).inflate(R.layout.comment_item, parent, false);
        return new CommentViewHolder(itemView);
    }

    @Override
    public void onBindViewHolder(@NonNull CommentViewHolder holder, int position) {
        // Bind data to the ViewHolder
        Comment comment = comments.get(position);
        holder.bind(comment, onCommentDeleteListener);
    }

    @Override
    public int getItemCount() {
        return comments.size();
    }

    /**
     * ViewHolder class for holding views of each comment item in the RecyclerView.
     */
    class CommentViewHolder extends RecyclerView.ViewHolder {
        private final TextView tvComment;
        private final TextView tvDisplayName;
        private final ImageButton btnDeleteComment;
        private final ImageView ivProfileComment;

        /**
         * Constructor for the CommentViewHolder.
         *
         * @param itemView The view representing a single item in the RecyclerView.
         */
        public CommentViewHolder(View itemView) {
            super(itemView);
            tvComment = itemView.findViewById(R.id.tvComment);
            tvDisplayName = itemView.findViewById(R.id.tvDisplayName);
            btnDeleteComment = itemView.findViewById(R.id.btnDeleteComment);
            ivProfileComment = itemView.findViewById(R.id.ivProfileComment);
        }

        /**
         * Binds data from a Comment object to the views in the ViewHolder.
         *
         * @param comment                The Comment object containing the data to bind.
         * @param onCommentDeleteListener Listener for handling comment deletion events.
         */
        void bind(Comment comment, OnCommentDeleteListener onCommentDeleteListener) {
            // Set display name of the commenter
            tvDisplayName.setText(comment.getAuthor().getDisplayName());

            // Set profile picture of the commenter
            Uri profilePicUri = comment.getAuthor().getProfilePicture();
            if (profilePicUri != null) {
                ivProfileComment.setImageURI(profilePicUri);
            } else {
                ivProfileComment.setImageResource(R.drawable.default_profile_pic);
            }

            // Set comment text
            tvComment.setText(comment.getText());

            // Handle delete button click event
            btnDeleteComment.setOnClickListener(v -> {
                if (onCommentDeleteListener != null) {
                    onCommentDeleteListener.onCommentDelete(comment);
                }
            });
        }
    }
}
