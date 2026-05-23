package com.example.myapplication.entitie;

/**
 * Represents a comment on a post.
 */
public class Comment {
    private String text; // Text content of the comment
    private User author; // Author of the comment

    /**
     * Constructor to initialize a comment with text and author.
     *
     * @param text   The text content of the comment.
     * @param author The author of the comment.
     */
    public Comment(String text, User author) {
        this.text = text;
        this.author = author;
    }

    /**
     * Retrieves the text content of the comment.
     *
     * @return The text content of the comment.
     */
    public String getText() {
        return text;
    }

    /**
     * Sets the text content of the comment.
     *
     * @param text The new text content of the comment.
     */
    public void setText(String text) {
        this.text = text;
    }

    /**
     * Retrieves the author of the comment.
     *
     * @return The author of the comment.
     */
    public User getAuthor() {
        return author;
    }

    /**
     * Sets the author of the comment.
     *
     * @param author The new author of the comment.
     */
    public void setAuthor(User author) {
        this.author = author;
    }
}
