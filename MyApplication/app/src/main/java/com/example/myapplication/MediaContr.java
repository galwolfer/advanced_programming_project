package com.example.myapplication;

import android.content.Context;
import android.view.View;
import android.widget.MediaController;

/**
 * Custom MediaController class for controlling video playback.
 * Extends Android's MediaController and sets an anchor view for positioning.
 */
public class MediaContr extends MediaController {

    /**
     * Constructor to initialize the MediaController with a context and anchor view.
     *
     * @param context The context from which the MediaController is created
     * @param anchor  The view to which the MediaController will be anchored
     */
    public MediaContr(Context context, View anchor) {
        super(context);
        super.setAnchorView(anchor); // Set the anchor view for the MediaController
    }

    /**
     * Override setAnchorView method to prevent default behavior.
     *
     * @param view The view to set as the anchor (not used in this override)
     */
    @Override
    public void setAnchorView(View view) {
        // Prevent setting anchor view through this method to enforce use of constructor
        // This method is overridden but not implemented to avoid unintended behavior
    }
}
