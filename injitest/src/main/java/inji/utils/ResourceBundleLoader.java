package inji.utils;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.mosip.testrig.apirig.utils.RestClient;
import io.restassured.response.Response;
import org.apache.log4j.Logger;
import org.json.JSONObject;

import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

public class ResourceBundleLoader {

    private static final Map<String, String> resourceBundleMap = new HashMap<>();
    private static final Logger logger = Logger.getLogger(ResourceBundleLoader.class);
    private static volatile boolean loaded = false;

    public static String get(String key) {
        if (!loaded) {
            synchronized (ResourceBundleLoader.class) {
                if (!loaded) {
                    loadResourceBundleJson();
                    loaded = true;
                }
            }
        }
        return resourceBundleMap.getOrDefault(key, "!!MISSING_KEY: " + key + "!!");
    }

    private static void loadResourceBundleJson() {
        try {
            String url = convertToRawGitHubUrl(InjiWalletConfigManager.getproperty("eSignet_resource_bundle_url"));

            String jsonContent = downloadJson(url);
            Map<String, Object> nestedMap = new ObjectMapper().readValue(jsonContent, new TypeReference<>() {
            });
            flatten(nestedMap, "", resourceBundleMap);

        } catch (Exception e) {
            logger.error("Error loading resource bundle JSON", e);
        }
    }

    public static String convertToRawGitHubUrl(String url) {
        return url
                .replace("https://github.com/", "https://raw.githubusercontent.com/")
                .replace("/blob/", "/");
    }

    private static String downloadJson(String url) throws IOException {
        URI uri = URI.create(url); // preferred over new URL(String)
        try (InputStream in = uri.toURL().openStream()) {
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    // Flatten nested JSON
    @SuppressWarnings("unchecked")
    private static void flatten(Map<String, Object> source, String prefix, Map<String, String> target) {
        for (Map.Entry<String, Object> entry : source.entrySet()) {
            String key = prefix.isEmpty() ? entry.getKey() : prefix + "." + entry.getKey();
            Object value = entry.getValue();
            if (value instanceof Map) {
                flatten((Map<String, Object>) value, key, target);
            } else {
                target.put(key, value.toString());
            }
        }
    }
}