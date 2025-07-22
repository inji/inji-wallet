package inji.utils;

import inji.api.ConfigManager;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.*;

import static inji.api.AdminTestUtil.fetchVersion;

public class FetchErrorMessages {

    public static final Map<String, String> errorMap = new LinkedHashMap<>();
    public static final Map<String, String> otpMap = new LinkedHashMap<>();

    public static void fetchAndPrintErrors() {

        String url = ConfigManager.getEsignetErrorsUrl();

        if (url == null || url.trim().isEmpty()) {
            url = buildTheUrlWithCorrectVersion();
        }

        if (url == null) {
            System.err.println("Could not determine a valid URL for error messages.");
            return;
        }

        try {
            String jsonContent = downloadJson(url);
            System.out.println(jsonContent);
            JSONObject jsonObject = new JSONObject(jsonContent);

            errorMap.clear();
            otpMap.clear();

            if (jsonObject.has("errors")) {
                JSONObject errorsObject = jsonObject.getJSONObject("errors");
                extractErrorsToMap(errorsObject, "", errorMap);

                System.out.println("Extracted Error Messages:");
                errorMap.forEach((key, value) -> System.out.println(key + " = " + value));

                if (errorsObject.has("otp")) {
                    JSONObject otpObject = errorsObject.getJSONObject("otp");
                    extractErrorsToMap(otpObject, "", otpMap);

                    System.out.println("Extracted OTP Messages:");
                    otpMap.forEach((key, value) -> System.out.println(key + " = " + value));
                } else {
                    System.err.println("'otp' section not found inside 'errors'.");
                }

            } else {
                System.err.println("'errors' section not found in JSON.");
            }

        } catch (Exception e) {
            System.err.println("Failed to fetch or parse the JSON: " + e.getMessage());
        }
    }

    public static String buildTheUrlWithCorrectVersion() {
        String version = fetchVersion();
        if (version == null || version.isEmpty()) {
            System.err.println("Version is null or empty");
            return null;
        }

        String baseRawUrl = "https://raw.githubusercontent.com/mosip/esignet/";
        String filePath = "/oidc-ui/public/locales/en.json";

        String versionWithX = version.replaceAll("\\.\\d+$", ".x");

        String[] candidateUrls = {
                baseRawUrl + "V" + version + filePath,
                baseRawUrl + "release-" + versionWithX + filePath
        };

        for (String candidateUrl : candidateUrls) {
            if (urlExists(candidateUrl)) {
                return candidateUrl;
            }
        }

        System.err.println("None of the candidate URLs exist.");
        return null;
    }

    private static boolean urlExists(String urlString) {
        try {
            HttpURLConnection connection = (HttpURLConnection) new URL(urlString).openConnection();
            connection.setRequestMethod("HEAD");
            return connection.getResponseCode() == 200;
        } catch (Exception e) {
            System.err.println("Error checking URL: " + urlString + " | " + e.getMessage());
            return false;
        }
    }

    private static String downloadJson(String urlString) throws Exception {
        StringBuilder result = new StringBuilder();
        HttpURLConnection conn = (HttpURLConnection) new URL(urlString).openConnection();
        conn.setRequestMethod("GET");

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                result.append(line);
            }
        }

        return result.toString();
    }

    private static void extractErrorsToMap(JSONObject obj, String path, Map<String, String> map) {
        Iterator<String> keys = obj.keys();
        while (keys.hasNext()) {
            String key = keys.next();
            Object value = obj.get(key);
            String currentPath = path.isEmpty() ? key : path + "." + key;

            if (value instanceof JSONObject) {
                extractErrorsToMap((JSONObject) value, currentPath, map);
            } else if (value instanceof JSONArray) {
                JSONArray arr = (JSONArray) value;
                for (int i = 0; i < arr.length(); i++) {
                    Object arrItem = arr.get(i);
                    if (arrItem instanceof JSONObject) {
                        extractErrorsToMap((JSONObject) arrItem, currentPath + "[" + i + "]", map);
                    } else {
                        map.put(currentPath + "[" + i + "]", arrItem.toString());
                    }
                }
            } else {
                map.put(currentPath, value.toString());
            }
        }
    }
}