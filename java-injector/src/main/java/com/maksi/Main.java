package com.maksi;

import org.json.JSONArray;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;

public class Main {
    public static void main(String[] args) throws IOException, InterruptedException {

        Scraper scraper = new Scraper();
        ArrayList<HashMap<String, Object>> collectedData = scraper.Parsing();
        System.out.println(collectedData.size());
//        String path = makePath();
        String fileName = makeFileName();
        String jsonData = toJSON.writeToJson(collectedData);
        uploadToGCS.sendFile("marine-catfish-310009", "landing-bucket-zoomcamp", fileName, jsonData);
//        writeLocal(jsonData, path);
    }

    public static void writeLocal(String jsonData, String path) throws IOException {
        File jsonFile = new File(path);
        Boolean status = jsonFile.createNewFile();
        FileWriter fileWriter = new FileWriter(path);
        fileWriter.write(new JSONArray(jsonData).toString());
        fileWriter.flush();
    }

    public static String makeFileName() {
        String fileName = ("crypto_data_" + Main.getCurrentDate() + ".json")
                .replace(" ", "_")
                .replace(":", "-");

        return fileName;
    }

    public static String makePath() throws IOException {
        String fileName = makeFileName();
        String folderPath = "C:\\Random Projects\\gcp-pipeline\\data-landing\\";
        return folderPath + fileName;
    }

    public static String getCurrentDate() {
        LocalDateTime dateTime = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss");
        return dateTime.format(formatter);
    }
}

