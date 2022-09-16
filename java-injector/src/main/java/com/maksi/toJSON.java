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

    public static String writeToJson(ArrayList<HashMap<String, Object>> data, String path) throws IOException {
//        File jsonFile = new File(path);
//        Boolean status = jsonFile.createNewFile();
//        FileWriter fileWriter = new FileWriter(path);
//        fileWriter.write(new JSONArray(data).toString());
        String jsonObject = new JSONArray(data).toString();
//        fileWriter.flush();
        return jsonObject;
    }

}
