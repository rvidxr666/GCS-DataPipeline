package com.maksi;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import org.json.JSONArray;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;

public class toJSON {

    public static String writeToJson(ArrayList<HashMap<String, Object>> data) throws IOException {
        String jsonObject = new JSONArray(data).toString();
        return jsonObject;
    }

}
