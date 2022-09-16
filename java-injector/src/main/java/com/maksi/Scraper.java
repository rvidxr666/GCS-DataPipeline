package com.maksi;

import org.jsoup.HttpStatusException;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

import java.io.IOException;
import java.math.BigInteger;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;

public class Scraper {
    String url;
    int pagesCount;
    ArrayList<HashMap<String, Object>> finalList;

    public Scraper(){
        this.url = "https://coinmarketcap.com";
        this.pagesCount = 5;
        this.finalList = new ArrayList<>();
    }

    public Scraper(String url, int pagesCount){
        this.url = url;
        this.pagesCount = pagesCount;
        this.finalList = new ArrayList<>();
    }

    public ArrayList<HashMap<String, Object>> Parsing() throws IOException {
        String url = this.url;
        int count = 1;
        HashMap<String, HashMap<String, Object>> finalMap = new HashMap<>();
        while (count <= this.pagesCount) {

            Document document = Jsoup.connect(url).get();
            Elements elems = document.select("a[href^=\"/currencies\"]");

            for (Element elem : elems) {
                String link = elem.attr("href");
                if (link.matches("/currencies/([^/]*?)/$")) {
                    try{
                        extractData(this.url + link);
                    } catch (HttpStatusException e) {
                        continue;
                    }
                }
            }

            count += 1;
            url = this.url + "/" + "?page=" + count;
            System.out.println(this.finalList.size());
        }

        return this.finalList;
    }


    private void Scroll() {
        System.setProperty("webdriver.chrome.driver", "C:\\chromedriver.exe");
        WebDriver driver=new ChromeDriver();
    }

    private void extractData(String url) throws IOException {
        HashMap<String, Object> coinData = new HashMap<>();
        Document document = Jsoup.connect(url).get();
        String name = document.select("h2[class=\"sc-1q9q90x-0 jCInrl h1\"]").get(0).ownText();

        coinData.put("Name", name);
        coinData.put("Tag", document.select("small[class=\"nameSymbol\"]").get(0).ownText());

        String priceRaw = document.select("div[class=\"sc-16r8icm-0 kjciSH priceTitle\"] div").get(0).text();
        Object priceCleaned = this.priceProcessing(priceRaw);

        coinData.put("Price", priceCleaned);
        coinData.put("Type", document.select("div[class=\"namePill\"]").get(0).ownText());

        try {
            coinData.put("Network", document.select("span[class=\"mainChainTitle\"]").get(0).ownText());
        } catch(Exception e) {
            coinData.put("Network", "Own");
        }

        Element marketCap = document
                .select("div[class=\"statsBlock\"] div[class=\"statsValue\"]")
                .get(0);

        Element volume = document
                .select("div[class=\"statsBlock\"] div[class=\"statsValue\"]")
                .get(2);

        System.out.println(name);
        coinData.put("MarketCap", volumeProcessing(marketCap.ownText()));
        coinData.put("Volume", volumeProcessing(volume.ownText()));
        coinData.put("Time", this.getCurrentDate());
        this.finalList.add(coinData);
    }

    private String getCurrentDate() {
        LocalDateTime dateTime = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss");
        return dateTime.format(formatter);
    }

    private BigInteger volumeProcessing(String amount) {
        amount = amount.replace(",", "")
                .replace("$", "")
                .replace("%", "");

        if (!amount.matches("[0-9]+")) {
            return null;
        }

        return new BigInteger(amount);
    }


    private Object priceProcessing(String price) {
        price = price.replace(",", "")
                .replace("$", "")
                .replace("%", "");

        Object parsedPrice = null;
        try {
            parsedPrice = Double.parseDouble(price);
        } catch (NumberFormatException e) {
            parsedPrice = null;
        }

        return parsedPrice;
    }

}
