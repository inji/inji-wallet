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
import java.util.Objects;
import java.util.function.Function;

import com.google.gson.Gson;

import io.mosip.openID4VP.authorizationRequest.LdpVpFormatSupported;
import io.mosip.openID4VP.authorizationRequest.MsoMdocVpFormatSupported;
import io.mosip.openID4VP.authorizationRequest.SdJwtVpFormatSupported;
import io.mosip.openID4VP.authorizationRequest.VPFormatSupported;
import io.mosip.openID4VP.authorizationRequest.Verifier;
import io.mosip.openID4VP.authorizationRequest.WalletConfig;
import io.mosip.openID4VP.authorizationRequest.WalletConfigDefaultsKt;
import io.mosip.openID4VP.authorizationResponse.vpTokenSigningResult.VPTokenSigningResult;
import io.mosip.openID4VP.common.OpenID4VPErrorCodes;
import io.mosip.openID4VP.constants.ClientIdPrefix;
import io.mosip.openID4VP.constants.EncryptionAlgorithm;
import io.mosip.openID4VP.constants.EncryptionMethod;
import io.mosip.openID4VP.constants.ProofType;
import io.mosip.openID4VP.constants.RequestUriMethod;
import io.mosip.openID4VP.constants.ResponseType;
import io.mosip.openID4VP.constants.SignatureAlgorithm;
import io.mosip.openID4VP.constants.SpecVersion;
import io.mosip.openID4VP.constants.VPFormatType;
import io.mosip.openID4VP.dcql.query.DCQLQuery;
import io.mosip.openID4VP.dcql.query.DCQLQuerySerializer;
import io.mosip.openID4VP.wallet.Credential;

import io.mosip.openID4VP.exceptions.OpenID4VPExceptions;
import io.mosip.openID4VP.constants.FormatType;
import kotlinx.serialization.json.Json;

import static io.mosip.openID4VP.common.OpenID4VPErrorCodes.ACCESS_DENIED;
import static io.mosip.openID4VP.common.OpenID4VPErrorCodes.INVALID_TRANSACTION_DATA;

public class OpenId4VPUtils {
  public static WalletConfig parseWalletConfig(ReadableMap walletConfigMap) {
    Map<VPFormatType, VPFormatSupported> vpFormatsSupportedMap = parseVpFormatsSupported(walletConfigMap);

    List<ClientIdPrefix> clientIdPrefixesSupported = convertReadableArrayToEnumList(
      walletConfigMap, "client_id_prefixes_supported", ClientIdPrefix.Companion::fromValue);

    List<SignatureAlgorithm> requestObjectSigningAlg = convertReadableArrayToEnumList(
      walletConfigMap, "request_object_signing_alg_values_supported",
      SignatureAlgorithm.Companion::fromValue);

    List<EncryptionAlgorithm> encryptionAlg = convertReadableArrayToEnumList(
      walletConfigMap, "authorization_encryption_alg_values_supported",
      EncryptionAlgorithm.Companion::fromValue);

    List<EncryptionMethod> encryptionEnc = convertReadableArrayToEnumList(
      walletConfigMap, "authorization_encryption_enc_values_supported",
      EncryptionMethod.Companion::fromValue);

    List<ResponseType> responseTypes = convertReadableArrayToEnumList(
      walletConfigMap, "response_types_supported", ResponseType.Companion::fromValue);

    Boolean presentationDefinitionUriSupported = walletConfigMap.hasKey("presentation_definition_uri_supported")
      ? walletConfigMap.getBoolean("presentation_definition_uri_supported")
      : true;

    boolean validatePreRegiseredVerifier = walletConfigMap.hasKey("validate_pre_registered_verifier") ? walletConfigMap.getBoolean("validate_pre_registered_verifier") : true;

    List<RequestUriMethod> supportedRequestUriMethods = parseSupportedRequestUriMethods(walletConfigMap);

    List<Verifier> trustedVerifiers = parseTrustedVerifiers(walletConfigMap);

    return new WalletConfig(
      vpFormatsSupportedMap.isEmpty() ? WalletConfigDefaultsKt.getDefaultVpFormatsSupported() : vpFormatsSupportedMap,
      clientIdPrefixesSupported != null ? clientIdPrefixesSupported : WalletConfigDefaultsKt.getDefaultClientIdPrefixesSupported(),
      requestObjectSigningAlg,
      encryptionAlg,
      encryptionEnc,
      responseTypes != null ? responseTypes : WalletConfigDefaultsKt.getDefaultResponseTypeSupported(),
      presentationDefinitionUriSupported,
      supportedRequestUriMethods,
      trustedVerifiers,
      validatePreRegiseredVerifier
    );
  }


  private static List<RequestUriMethod> parseSupportedRequestUriMethods(ReadableMap walletConfigMap) {
    if (!walletConfigMap.hasKey("request_uri_methods_supported")) {
      return List.of(RequestUriMethod.GET, RequestUriMethod.POST);
    }
    ReadableArray methodsArray = walletConfigMap.getArray("request_uri_methods_supported");
    List<RequestUriMethod> methods = new ArrayList<>();
    for (int i = 0; i < Objects.requireNonNull(methodsArray).size(); i++) {
      RequestUriMethod method = RequestUriMethod.Companion.fromValue(methodsArray.getString(i));
      if (method != null) {
        methods.add(method);
      }
    }
    return methods;
  }

  private static List<Verifier> parseTrustedVerifiers(ReadableMap walletConfigMap) {
    if (!walletConfigMap.hasKey("trusted_verifiers")) {
      return new ArrayList<>();
    }
    ReadableArray verifiersArray = walletConfigMap.getArray("trusted_verifiers");
    if (verifiersArray == null) {
      return new ArrayList<>();
    }
    return parseVerifiers(verifiersArray);
  }

  private static Map<VPFormatType, VPFormatSupported> parseVpFormatsSupported(ReadableMap walletMetadata) {
    Map<VPFormatType, VPFormatSupported> vpFormatsSupportedMap = new HashMap<>();
    if (walletMetadata.hasKey("vp_formats_supported")) {
      ReadableMap vpFormatsMap = walletMetadata.getMap("vp_formats_supported");
      if (vpFormatsMap != null) {
        addVpFormatSupported(vpFormatsMap, "ldp_vc", vpFormatsSupportedMap);
        addVpFormatSupported(vpFormatsMap, "mso_mdoc", vpFormatsSupportedMap);
        addVpFormatSupported(vpFormatsMap, "vc+sd-jwt", vpFormatsSupportedMap);
        addVpFormatSupported(vpFormatsMap, "dc+sd-jwt", vpFormatsSupportedMap);
      }
    }
    return vpFormatsSupportedMap;
  }

  private static <T> List<T> convertReadableArrayToEnumList(ReadableMap readableMap, String key,
                                                            Function<String, T> converter) {
    if (!readableMap.hasKey(key))
      return null;
    ReadableArray readableArray = readableMap.getArray(key);
    List<T> list = new ArrayList<>();
    for (int i = 0; i < Objects.requireNonNull(readableArray).size(); i++) {
      list.add(converter.apply(readableArray.getString(i)));
    }
    return list;
  }

  private static void addVpFormatSupported(ReadableMap vpFormatsMap, String key,
                                           Map<VPFormatType, VPFormatSupported> vpFormatsSupportedMap) {
    if (!vpFormatsMap.hasKey(key)) {
      return;
    }

    ReadableMap formatMap = vpFormatsMap.getMap(key);
    VPFormatType formatType = VPFormatType.Companion.fromValue(key);
    if (formatMap == null || formatType == null) {
      return;
    }

    switch (formatType) {
      case LDP_VC:
      case LDP_VP:
        vpFormatsSupportedMap.put(formatType, new LdpVpFormatSupported(
          convertReadableArrayToEnumList(formatMap, "proof_type_values", ProofType.Companion::fromValue),
          convertReadableArrayToStringList(formatMap, "cryptosuite_values")));
        break;
      case MSO_MDOC:
        vpFormatsSupportedMap.put(formatType, new MsoMdocVpFormatSupported(
          convertReadableArrayToIntegerList(formatMap, "issuerauth_alg_values"),
          convertReadableArrayToIntegerList(formatMap, "deviceauth_alg_values")));
        break;
      case VC_SD_JWT:
      case DC_SD_JWT:
        vpFormatsSupportedMap.put(formatType, new SdJwtVpFormatSupported(
          convertReadableArrayToStringList(formatMap, "sd-jwt_alg_values"),
          convertReadableArrayToStringList(formatMap, "kb-jwt_alg_values")));
        break;
    }
  }

  private static List<String> convertReadableArrayToStringList(ReadableMap readableMap, String key) {
    if (!readableMap.hasKey(key) || readableMap.isNull(key)) {
      return null;
    }
    return FormatConverter.convertReadableArrayToList(readableMap.getArray(key));
  }

  private static List<Integer> convertReadableArrayToIntegerList(ReadableMap readableMap, String key) {
    if (!readableMap.hasKey(key) || readableMap.isNull(key)) {
      return null;
    }
    ReadableArray readableArray = readableMap.getArray(key);
    List<Integer> list = new ArrayList<>();
    for (int i = 0; i < Objects.requireNonNull(readableArray).size(); i++) {
      list.add(readableArray.getInt(i));
    }
    return list;
  }

  private static List<Verifier> parseVerifiers(ReadableArray verifiersArray) {
    List<Verifier> verifiers = new ArrayList<>();

    for (int i = 0; i < verifiersArray.size(); i++) {
      ReadableMap verifierMap = verifiersArray.getMap(i);

      String clientId = getStringOrDefault(verifierMap, "client_id", null);

      List<String> responseUris = Collections.emptyList();
      if (verifierMap.hasKey("response_uris") && !verifierMap.isNull("response_uris")) {
        responseUris = FormatConverter.convertReadableArrayToList(verifierMap.getArray("response_uris"));
      }

      String jwksUri = getStringOrDefault(verifierMap, "jwks_uri", null);
      boolean allowUnsignedRequest = getBooleanOrDefault(verifierMap, "allow_unsigned_request", false);
      String specVersion = getStringOrDefault(verifierMap, "spec_version", "v1");

      verifiers.add(new Verifier(
        clientId,
        responseUris,
        jwksUri,
        allowUnsignedRequest,
        parseSpecVersion(specVersion)
      ));
    }

    return verifiers;
  }

  private static String getStringOrDefault(ReadableMap map, String key, String defaultValue) {
    return map.hasKey(key) && !map.isNull(key) ? map.getString(key) : defaultValue;
  }

  private static boolean getBooleanOrDefault(ReadableMap map, String key, boolean defaultValue) {
    return map.hasKey(key) && !map.isNull(key) ? map.getBoolean(key) : defaultValue;
  }

  private static SpecVersion parseSpecVersion(String specVersion) {
    return "draft23".equals(specVersion) ? SpecVersion.DRAFT_23 : SpecVersion.V1;
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
