package com.example.myapplication;

import com.example.myapplication.entitie.User;

import java.util.ArrayList;

/**
 * UsersManager is a singleton class that manages user data,
 * including signed up users and the currently signed-in user.
 */
public class UsersManager {
    private static UsersManager instance; // Singleton instance
    private ArrayList<User> signedUpUsers; // List of signed-up users
    private User signedInUser; // Currently signed-in user

    /**
     * Private constructor to prevent instantiation from other classes.
     * Initializes the list of signed-up users and sets the signed-in user to null.
     */
    private UsersManager() {
        signedUpUsers = new ArrayList<>();
        signedInUser = null;
    }

    /**
     * Returns the singleton instance of UsersManager.
     * Creates the instance if it does not already exist.
     *
     * @return the singleton instance of UsersManager
     */
    public static synchronized UsersManager getInstance() {
        if (instance == null) {
            instance = new UsersManager();
        }
        return instance;
    }

    /**
     * Adds a user to the list of signed-up users.
     *
     * @param user the user to be added
     */
    public void addUser(User user) {
        signedUpUsers.add(user);
    }

    /**
     * Checks if a user with the given username already exists in the signed-up users list.
     *
     * @param username the username to check
     * @return true if a user with the username exists, false otherwise
     */
    public boolean userExists(String username) {
        for (User user : signedUpUsers) {
            if (user.getUserName().equals(username)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Sets the list of signed-up users.
     *
     * @param signedUpUsers the list of signed-up users
     */
    public void setSignedUpUsers(ArrayList<User> signedUpUsers) {
        this.signedUpUsers = signedUpUsers;
    }

    /**
     * Returns the list of signed-up users.
     *
     * @return the list of signed-up users
     */
    public ArrayList<User> getSignedUpUsers() {
        return signedUpUsers;
    }

    /**
     * Sets the currently signed-in user.
     *
     * @param signedInUser the user to be set as signed-in
     */
    public void setSignedInUser(User signedInUser) {
        this.signedInUser = signedInUser;
    }

    /**
     * Returns the currently signed-in user.
     *
     * @return the currently signed-in user
     */
    public User getSignedInUser() {
        return signedInUser;
    }

    /**
     * Signs out the currently signed-in user by setting signedInUser to null.
     */
    public void signOut() {
        signedInUser = null;
    }
}
