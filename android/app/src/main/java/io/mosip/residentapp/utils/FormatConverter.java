package io.mosip.residentapp.utils;

import java.util.List;
import java.util.ArrayList;
import com.facebook.react.bridge.ReadableArray;

public class FormatConverter {

     public static List<String> convertReadableArrayToList(ReadableArray readableArray) {
        List<String> list = new ArrayList<>();

        for (int i = 0; i < readableArray.size(); i++) {
            list.add(readableArray.getString(i));
        }

        return list;
    }
}
