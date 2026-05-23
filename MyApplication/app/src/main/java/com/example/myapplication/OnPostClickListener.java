package com.example.myapplication;

import com.example.myapplication.entitie.Post;

/**
 * Interface definition for a callback to be invoked when a post is clicked.
 */
public interface OnPostClickListener {

    /**
     * Called when a post item is clicked.
     *
     * @param post The Post object associated with the clicked item
     */
    void onPostClick(Post post);
}
