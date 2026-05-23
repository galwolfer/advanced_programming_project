package com.example.myapplication.util;

import android.content.Context;
import android.content.res.Resources;
import android.util.Log;
import com.example.myapplication.R;
import com.example.myapplication.entitie.Post;
import org.json.JSONException;
import org.json.JSONObject;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

public class Util {
    private static final String TAG = "Util";

    public static JSONObject parseJsonFromResRaw(Resources res, int rawId) throws IOException, JSONException {
        InputStream inputStream = res.openRawResource(rawId);
        Scanner scanner = new Scanner(inputStream, "UTF-8").useDelimiter("\\A");
        String jsonString = scanner.hasNext() ? scanner.next() : "";
        inputStream.close();

        // Log the raw JSON string for debugging
        Log.d(TAG, "Raw JSON from resource: " + jsonString);

        // parse the JSON string to JSONObject
        JSONObject jsonObject = new JSONObject(jsonString);

        // Get the image name from the JSON
        String imageName = jsonObject.optString("image", "");

        return jsonObject;
    }

    public static List<Post> sampleVideoList(Context context) {
        List<Post> postList = new ArrayList<>();
        Resources res = context.getResources();
        List<Integer> jsonIds = new ArrayList<>();
        jsonIds.add(R.raw.post1);
        jsonIds.add(R.raw.post2);
        jsonIds.add(R.raw.post3);
        jsonIds.add(R.raw.post4);
        jsonIds.add(R.raw.post5);
        jsonIds.add(R.raw.post6);
        jsonIds.add(R.raw.post7);
        jsonIds.add(R.raw.post8);
        jsonIds.add(R.raw.post9);
        jsonIds.add(R.raw.post10);

        for (int id : jsonIds) {
            try {
                JSONObject jsonObject = parseJsonFromResRaw(res, id);
                Post post = new Post(jsonObject, context);
                postList.add(post);
            } catch (IOException e) {
                Log.e(TAG, "Error reading JSON resource: " + id, e);
            } catch (JSONException e) {
                Log.e(TAG, "Error parsing JSON from resource: " + id, e);
            }
        }

        return postList;
    }
}
