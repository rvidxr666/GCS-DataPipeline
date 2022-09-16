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
////        WebClient webClient = new WebClient();
////        HtmlPage page = webClient.getPage("https://coinmarketcap.com");
////        ScriptResult result = page.executeJavaScript("window.scrollTo(0, document.body.scrollHeight);");
////        System.out.println(result);
//        ChromeOptions opt = new ChromeOptions();
//        opt.addArguments("headless");
//        System.setProperty("webdriver.chrome.driver", "C:\\chromedriver.exe");
//        WebDriver driver=new ChromeDriver();
//        driver.get("https://coinmarketcap.com");
//        JavascriptExecutor jse = (JavascriptExecutor)driver;
//        jse.executeScript("window.scrollBy(0, 10000);");
//        System.out.println(jse.toString());
//        String pageSource = driver.getPageSource();
//        Document document = Jsoup.parse(pageSource);
//        Elements elems = document.select("a[class=\"cmc-link\"]");
//
//        int count = 0;
//        for (Element elem : elems) {
//            String link = elem.attr("href");
//            if (link.matches("/currencies/([^/]*?)/$")) {
//                count += 1;
//                System.out.println(link);
//            }
//
////            System.out.println(link);
//        }
//
//        System.out.println(count);

        Scraper scraper = new Scraper();
        ArrayList<HashMap<String, Object>> collectedData = scraper.Parsing();
        System.out.println(collectedData.size());
        String path = makePath();
        String jsonData = toJSON.writeToJson(collectedData, path);
        writeLocal(jsonData, path);
//        uploadToGCS.sendFile("marine-catfish-310009", "landing-bucket-zoomcamp",
//                                makeFileName(), jsonData);
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

