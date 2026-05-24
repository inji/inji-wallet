package io.mosip.residentapp.utils;

import static io.mosip.openID4VP.constants.FormatType.DC_SD_JWT;
import static io.mosip.openID4VP.constants.FormatType.LDP_VC;
import static io.mosip.openID4VP.constants.FormatType.MSO_MDOC;
import static io.mosip.openID4VP.constants.FormatType.VC_SD_JWT;

import android.util.Base64;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;

import java.util.ArrayList;
import java.util.Collections;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import io.mosip.openID4VP.authorizationResponse.vpTokenSigningResult.VPTokenSigningResult;
import io.mosip.openID4VP.wallet.Credential;

import io.mosip.openID4VP.exceptions.OpenID4VPExceptions;
import io.mosip.openID4VP.constants.FormatType;

import static io.mosip.openID4VP.common.OpenID4VPErrorCodes.ACCESS_DENIED;
import static io.mosip.openID4VP.common.OpenID4VPErrorCodes.INVALID_TRANSACTION_DATA;

public class OpenId4VPUtils {
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

  public static Map<String, List<Credential>> parseSelectedVCsForPEX(ReadableMap selectedVCs) {
    Map<String, Map<FormatType, List<Object>>> grouped = parseSelectedVCs(selectedVCs);
    Map<String, List<Credential>> result = new HashMap<>();
    for (Map.Entry<String, Map<FormatType, List<Object>>> descriptorEntry : grouped.entrySet()) {
      List<Credential> credentials = new ArrayList<>();
      for (Map.Entry<FormatType, List<Object>> formatEntry : descriptorEntry.getValue().entrySet()) {
        FormatType formatType = formatEntry.getKey();
        for (Object credentialData : formatEntry.getValue()) {
          credentials.add(new Credential(formatType, credentialData, ""));
        }
      }
      if (!credentials.isEmpty()) {
        result.put(descriptorEntry.getKey(), credentials);
      }
    }
    return result;
  }

  public static List<VPTokenSigningResult> parseVPTokenSigningResults(
      ReadableArray vpTokenSigningResults) {

    if (vpTokenSigningResults == null) {
      return Collections.emptyList();
    }

    List<VPTokenSigningResult> formattedVpTokenSigningResults = new ArrayList<>();

    for (int i = 0; i < vpTokenSigningResults.size(); i++) {

      ReadableMap vpTokenSigningResultMap = vpTokenSigningResults.getMap(i);

      if (vpTokenSigningResultMap == null
          || !vpTokenSigningResultMap.hasKey("signedData")
          || vpTokenSigningResultMap.isNull("signedData")) {
        continue;
      }

      String signedData = vpTokenSigningResultMap.getString("signedData");
      byte[] signedDataBytes = Base64.decode(signedData, Base64.URL_SAFE | Base64.NO_WRAP | Base64.NO_PADDING);

      formattedVpTokenSigningResults.add(
          new VPTokenSigningResult(signedDataBytes));
    }

    return formattedVpTokenSigningResults;
  }

  private static List<Object> convertReadableArrayToListOfCredential(FormatType formatType,
      ReadableArray credentialList) {
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

  public static List<Credential> parseCredentials(ReadableArray credentialsArray) {
    if (credentialsArray == null) {
      return Collections.emptyList();
    }

    List<Credential> credentials = new ArrayList<>();
    for (int i = 0; i < credentialsArray.size(); i++) {
      ReadableMap credentialMap = credentialsArray.getMap(i);
      if (credentialMap == null) continue;

      String formatStr = credentialMap.getString("format");
      String credentialId = credentialMap.getString("credentialId");
      FormatType formatType = getFormatType(formatStr);

      Object credentialData = getCredentialData(formatType, credentialMap);
      credentials.add(new Credential(formatType, credentialData, credentialId));
    }
    return credentials;
  }

  public static Map<String, List<Credential>> parseSelectedVCsDCQL(ReadableMap credentialsMap) {
    if (credentialsMap == null) {
      return Collections.emptyMap();
    }

    Map<String, List<Credential>> result = new HashMap<>();
    ReadableMapKeySetIterator iterator = credentialsMap.keySetIterator();

    while (iterator.hasNextKey()) {
      String credentialQueryId = iterator.nextKey();
      ReadableArray credentialsArray = credentialsMap.getArray(credentialQueryId);
      if (credentialsArray == null) continue;

      List<Credential> credentials = new ArrayList<>();
      for (int i = 0; i < credentialsArray.size(); i++) {
        ReadableMap credentialMap = credentialsArray.getMap(i);
        if (credentialMap == null) continue;

        String formatStr = credentialMap.getString("format");
        String credentialId = credentialMap.getString("credentialId");
        FormatType formatType = getFormatType(formatStr);

        Object credentialData = getCredentialData(formatType, credentialMap);
        credentials.add(new Credential(formatType, credentialData, credentialId));
      }

      if (!credentials.isEmpty()) {
        result.put(credentialQueryId, credentials);
      }
    }
    return result;
  }

  private static Object getCredentialData(FormatType formatType, ReadableMap credentialMap) {
    switch (formatType) {
      case LDP_VC:
        ReadableMap dataMap = credentialMap.getMap("credential");
        return dataMap != null ? dataMap.toHashMap() : null;
      case MSO_MDOC:
      case VC_SD_JWT:
      case DC_SD_JWT:
        return credentialMap.getString("credential");
      default:
        return null;
    }
  }

  public static OpenID4VPExceptions convertToOpenID4VPException(
      String errorCode,
      String message,
      String moduleName) {
    switch (errorCode) {
      case ACCESS_DENIED:
        return new OpenID4VPExceptions.AccessDenied(message, moduleName);

      case INVALID_TRANSACTION_DATA:
        return new OpenID4VPExceptions.InvalidTransactionData(message, moduleName);

      default:
        return new OpenID4VPExceptions.GenericFailure(message, moduleName);
    }
  }
}
