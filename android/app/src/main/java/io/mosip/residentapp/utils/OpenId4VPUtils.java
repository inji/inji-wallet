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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.google.gson.Gson;

import io.mosip.openID4VP.authorizationRequest.dcqlQuery.DCQLQuery;
import io.mosip.openID4VP.authorizationRequest.dcqlQuery.DCQLQuerySerializer;
import io.mosip.openID4VP.authorizationResponse.vpTokenSigningResult.VPTokenSigningResult;
import io.mosip.openID4VP.common.OpenID4VPErrorCodes;
import io.mosip.openID4VP.wallet.Credential;

import io.mosip.openID4VP.exceptions.OpenID4VPExceptions;
import io.mosip.openID4VP.constants.FormatType;
import kotlinx.serialization.json.Json;

import static io.mosip.openID4VP.common.OpenID4VPErrorCodes.ACCESS_DENIED;
import static io.mosip.openID4VP.common.OpenID4VPErrorCodes.INVALID_TRANSACTION_DATA;

public class OpenId4VPUtils {
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

  public static DCQLQuery parseDcqlQuery(ReadableMap dcqlQueryMap) {
    if (dcqlQueryMap == null) {
      return null;
    }

    String dcqlQueryJson = new Gson().toJson(dcqlQueryMap.toHashMap());
    return Json.Default.decodeFromString(DCQLQuerySerializer.INSTANCE, dcqlQueryJson);
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

  public static Map<String, List<Credential>> parseSelectedVCs(ReadableMap credentialsMap) {
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
        return new OpenID4VPExceptions.GenericFailure(OpenID4VPErrorCodes.SERVER_ERROR, message, moduleName);
    }
  }
}
