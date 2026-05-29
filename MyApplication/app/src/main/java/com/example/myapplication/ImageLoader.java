package com.example.myapplication;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * Simple utility for downloading Bitmap images from URLs synchronously.
 * Designed to be called from background threads (not the UI thread).
 */
public class ImageLoader {

    /**
     * Downloads a Bitmap from the given URL.
     *
     * @param urlString The URL of the image to download.
     * @return The downloaded Bitmap, or null if the download failed.
     */
    public static Bitmap loadBitmap(String urlString) {
        if (urlString == null || urlString.isEmpty()) return null;

        HttpURLConnection connection = null;
        try {
            URL url = new URL(urlString);
            connection = (HttpURLConnection) url.openConnection();
            connection.setConnectTimeout(5000);
            connection.setReadTimeout(5000);
            connection.setDoInput(true);
            connection.connect();

            int responseCode = connection.getResponseCode();
            if (responseCode != 200) return null;

            InputStream input = connection.getInputStream();
            return BitmapFactory.decodeStream(input);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        } finally {
            if (connection != null) {
                connection.disconnect();
            }
        }
    }

    /**
     * Downloads a Bitmap from a URL and returns it.
     * Convenience wrapper that returns the result from a background thread.
     * Usage: runOnUiThread(() -> imageView.setImageBitmap(result));
     */
    public static Bitmap loadBitmapFromUrl(final String urlString) {
        return loadBitmap(urlString);
    }
}
