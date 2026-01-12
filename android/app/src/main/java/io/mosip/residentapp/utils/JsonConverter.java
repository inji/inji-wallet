package io.mosip.residentapp.utils;

import com.google.gson.FieldNamingPolicy;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

public final class JsonConverter {

    private static final JsonConverter INSTANCE = new JsonConverter();

    private final Gson gson;

    private JsonConverter() {
        this.gson = new GsonBuilder()
                .setFieldNamingPolicy(FieldNamingPolicy.LOWER_CASE_WITH_UNDERSCORES)
                .disableHtmlEscaping()
                .create();
    }

    public static JsonConverter getInstance() {
        return INSTANCE;
    }

    public static String toJson(Object src) {
        return INSTANCE.gson.toJson(src);
    }

    public <T> T fromJson(String json, Class<T> clazz) {
        return gson.fromJson(json, clazz);
    }

    public Gson getGson() {
        return gson;
    }
}
