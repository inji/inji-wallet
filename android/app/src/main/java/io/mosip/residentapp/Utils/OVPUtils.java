package io.mosip.residentapp.Utils;

import static io.mosip.openID4VP.constants.FormatType.DC_SD_JWT;
import static io.mosip.openID4VP.constants.FormatType.LDP_VC;
import static io.mosip.openID4VP.constants.FormatType.MSO_MDOC;
import static io.mosip.openID4VP.constants.FormatType.VC_SD_JWT;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;

import java.util.ArrayList;
import java.util.Collections;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import io.mosip.openID4VP.constants.FormatType;

public class OVPUtils {
  public static Map<String, Map<FormatType, List<Object>>> parseSelectedVCs(ReadableMap selectedVCs) {
    if (selectedVCs == null) {
      return Collections.emptyMap();
    }
    Map<String, Map<FormatType, List<Object>>> selectedVCsMap = new HashMap<>();
    ReadableMapKeySetIterator iterator = selectedVCs.keySetIterator();
    while (iterator.hasNextKey()) {
      String inputDescriptorId = iterator.nextKey();
      ReadableMap formatMap = selectedVCs.getMap(inputDescriptorId);
      if (formatMap == null) {
        continue;
      }
      Map<FormatType, List<Object>> formatTypeCredentialsMap = new EnumMap<>(FormatType.class);
      ReadableMapKeySetIterator formatIterator = formatMap.keySetIterator();

      while (formatIterator.hasNextKey()) {
        String formatStr = formatIterator.nextKey();
        ReadableArray vcsArray = formatMap.getArray(formatStr);
        if (vcsArray == null) {
          continue;
        }
        FormatType formatType = getFormatType(formatStr);
        if (formatType != null) {
          List<Object> vcsList = convertReadableArrayToListOfCredential(formatType, vcsArray);
          formatTypeCredentialsMap.put(formatType, vcsList);
        }
      }

      if (!formatTypeCredentialsMap.isEmpty()) {
        selectedVCsMap.put(inputDescriptorId, formatTypeCredentialsMap);
      }
    }
    return selectedVCsMap;
  }

  private static List<Object> convertReadableArrayToListOfCredential(FormatType formatType, ReadableArray credentialList) {
    switch (formatType) {
      case LDP_VC: {
        List<Object> ldpVcList = new ArrayList<>();
        for (int i = 0; i < credentialList.size(); i++) {
          ReadableMap credentialMap = credentialList.getMap(i);
          ldpVcList.add(credentialMap.toHashMap());
        }
        return ldpVcList;
      }
      case MSO_MDOC: {
        List<Object> mdocVcList = new ArrayList<>();
        for (int i = 0; i < credentialList.size(); i++) {
          String credential = credentialList.getString(i);
          mdocVcList.add(credential);
        }
        return mdocVcList;

      }
      case VC_SD_JWT: {
        List<Object> vcSdJwtList = new ArrayList<>();
        for (int i = 0; i < credentialList.size(); i++) {
          String credential = credentialList.getString(i);
          vcSdJwtList.add(credential);
        }
        return vcSdJwtList;
      }
      case DC_SD_JWT: {
        List<Object> dcSdJwtList = new ArrayList<>();
        for (int i = 0; i < credentialList.size(); i++) {
          String credential = credentialList.getString(i);
          dcSdJwtList.add(credential);
        }
        return dcSdJwtList;
      }
      default:
        return null;
    }
  }

  private static FormatType getFormatType(String formatStr) {
    if (LDP_VC.getValue().equals(formatStr)) {
      return LDP_VC;
    } else if (MSO_MDOC.getValue().equals(formatStr)) {
      return MSO_MDOC;
    } else if (VC_SD_JWT.getValue().equals(formatStr)) {
      return VC_SD_JWT;
    } else if (DC_SD_JWT.getValue().equals(formatStr)) {
      return DC_SD_JWT;
    }
    throw new UnsupportedOperationException("Credential format '" + formatStr + "' is not supported");
  }
}
