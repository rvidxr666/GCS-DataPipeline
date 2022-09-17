package com.maksi;

import com.gargoylesoftware.htmlunit.ScriptResult;
import com.gargoylesoftware.htmlunit.WebClient;
import com.gargoylesoftware.htmlunit.html.HtmlPage;
import org.json.JSONArray;
import org.jsoup.HttpStatusException;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;

public class Main {
    public static void main(String[] args) throws IOException {
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

