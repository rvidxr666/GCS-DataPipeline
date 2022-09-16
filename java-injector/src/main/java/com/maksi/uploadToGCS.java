package com.maksi;


import com.google.auth.Credentials;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.Blob;
import com.google.cloud.storage.Bucket;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

public class uploadToGCS {
    public static void sendFile(String projectID, String bucketName, String filename, String data) throws IOException {
        Storage storage = StorageOptions.newBuilder().setProjectId(projectID).build().getService();
        Bucket bucket = storage.get(bucketName);
        Blob blob = bucket.create("data/" + filename, data.getBytes(StandardCharsets.UTF_8),
                                                                    "application/json");
    }
}
