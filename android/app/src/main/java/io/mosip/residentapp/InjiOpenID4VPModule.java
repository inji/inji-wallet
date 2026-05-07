package io.mosip.residentapp;

import static io.mosip.residentapp.utils.OpenId4VPUtils.parseSelectedVCs;
import static io.mosip.residentapp.utils.OpenId4VPUtils.parseVPTokenSigningResults;

import android.annotation.SuppressLint;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.google.gson.FieldNamingPolicy;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;

import io.mosip.openID4VP.OpenID4VP;
import io.mosip.openID4VP.authorizationRequest.AuthorizationRequest;
import io.mosip.openID4VP.authorizationRequest.LdpVcFormatSupported;
import io.mosip.openID4VP.authorizationRequest.MsoMdocVcFormatSupported;
import io.mosip.openID4VP.authorizationRequest.SdJwtVcFormatSupported;
import io.mosip.openID4VP.authorizationRequest.VPFormatSupported;
import io.mosip.openID4VP.authorizationRequest.Verifier;
import io.mosip.openID4VP.authorizationRequest.WalletMetadata;
import io.mosip.openID4VP.verifier.VerifierResponse;
import io.mosip.openID4VP.authorizationResponse.unsignedVPToken.UnsignedVPToken;
import io.mosip.openID4VP.authorizationResponse.vpTokenSigningResult.VPTokenSigningResult;
import io.mosip.openID4VP.constants.ClientIdPrefix;
import io.mosip.openID4VP.constants.ContentEncryptionAlgorithm;
import io.mosip.openID4VP.constants.FormatType;
import io.mosip.openID4VP.constants.KeyManagementAlgorithm;
import io.mosip.openID4VP.constants.ProofType;
import io.mosip.openID4VP.constants.RequestSigningAlgorithm;
import io.mosip.openID4VP.constants.ResponseType;
import io.mosip.openID4VP.constants.VPFormatType;
import io.mosip.openID4VP.exceptions.OpenID4VPExceptions;
import io.mosip.residentapp.utils.FormatConverter;
import io.mosip.residentapp.utils.*;


public class InjiOpenID4VPModule extends ReactContextBaseJavaModule {
    private static final String TAG = "InjiOpenID4VPModule";
    private static final String MODULE_NAME = "InjiOpenID4VP";

    private OpenID4VP openID4VP;
    private Gson gson;

    InjiOpenID4VPModule(@Nullable ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return MODULE_NAME;
    }

    @SuppressLint("LogNotTimber")
    @ReactMethod
    public void initSdk(String appId, ReadableMap walletMetadata) {
        Log.d(TAG, "Initializing InjiOpenID4VPModule with " + appId);

        WalletMetadata metadata = parseWalletMetadata(walletMetadata);

        openID4VP = new OpenID4VP(appId, metadata);
        gson = new GsonBuilder()
                .setFieldNamingPolicy(FieldNamingPolicy.LOWER_CASE_WITH_UNDERSCORES)
                .disableHtmlEscaping()
                .create();
    }

    @ReactMethod
    public void authenticateVerifier(String urlEncodedAuthorizationRequest,
            ReadableArray trustedVerifiers,
            Boolean shouldValidateClient,
            Promise promise) {
        try {
            List<Verifier> verifierList = parseVerifiers(trustedVerifiers);

            AuthorizationRequest authRequest = openID4VP.authenticateVerifier(
                    urlEncodedAuthorizationRequest,
                    verifierList,
                    shouldValidateClient);

            String authRequestJson = gson.toJson(authRequest, AuthorizationRequest.class);
            promise.resolve(authRequestJson);
        } catch (Exception e) {
            rejectWithOpenID4VPExceptions(e, promise);
        }
    }

    @ReactMethod
    public void constructUnsignedVPToken(ReadableMap selectedVCs, String holderId, String signatureSuite,
            Promise promise) {
        try {
            Map<String, Map<FormatType, List<Object>>> selectedVCsMap = parseSelectedVCs(selectedVCs);
            List<UnsignedVPToken> vpTokens = openID4VP.constructUnsignedVPToken(selectedVCsMap, holderId,
                    signatureSuite);
            promise.resolve(gson.toJson(vpTokens));
        } catch (Exception e) {
            rejectWithOpenID4VPExceptions(e, promise);
        }
    }

    @ReactMethod
    public void shareVerifiablePresentation(ReadableArray vpTokenSigningResults, Promise promise) {
        try {
            List<VPTokenSigningResult> parsedSigningResults = parseVPTokenSigningResults(vpTokenSigningResults);
            VerifierResponse verifierResponse = openID4VP.sendVPResponseToVerifier(parsedSigningResults);
            String verifierResponseJson = gson.toJson(verifierResponse, VerifierResponse.class);

            promise.resolve(verifierResponseJson);
        } catch (Exception e) {
            rejectWithOpenID4VPExceptions(e, promise);
        }
    }

    @ReactMethod
    private void rejectWithOpenID4VPExceptions(Exception e, Promise promise) {
        if (e instanceof OpenID4VPExceptions exception) {
            WritableMap errorMap = Arguments.createMap();
            errorMap.putString("errorCode", exception.getErrorCode());
            errorMap.putString("message", exception.getMessage());
            errorMap.putString("verifierResponse", gson.toJson(exception.getVerifierResponse()));

            promise.reject(exception.getErrorCode(), exception.getMessage(), exception, errorMap);
        } else {
            promise.reject("ERR_UNKNOWN", e.getMessage(), e);
        }
    }

    @ReactMethod
    public void sendErrorToVerifier(String errorMessage, String errorCode, Promise promise) {
        try {
            OpenID4VPExceptions exception = OpenId4VPUtils.convertToOpenID4VPException(
                    errorCode,
                    errorMessage,
                    MODULE_NAME);

            VerifierResponse verifierResponse = openID4VP.sendErrorInfoToVerifier(exception);

            promise.resolve(gson.toJson(verifierResponse, VerifierResponse.class));

        } catch (Exception exception) {
            rejectWithOpenID4VPExceptions(exception, promise);
        }
    }

    private WalletMetadata parseWalletMetadata(ReadableMap walletMetadata) {
        Map<VPFormatType, VPFormatSupported> vpFormatsSupportedMap = parseVpFormatsSupported(walletMetadata);

        return new WalletMetadata(
                vpFormatsSupportedMap,
                convertReadableArrayToEnumList(walletMetadata, "client_id_prefixes_supported",
                        ClientIdPrefix.Companion::fromValue),
                convertReadableArrayToEnumList(walletMetadata, "request_object_signing_alg_values_supported",
                        RequestSigningAlgorithm.Companion::fromValue),
                convertReadableArrayToEnumList(walletMetadata, "authorization_encryption_alg_values_supported",
                        KeyManagementAlgorithm.Companion::fromValue),
                convertReadableArrayToEnumList(walletMetadata, "authorization_encryption_enc_values_supported",
                        ContentEncryptionAlgorithm.Companion::fromValue),
                convertReadableArrayToEnumList(walletMetadata, "response_types_supported",
                        ResponseType.Companion::fromValue));
    }

    private Map<VPFormatType, VPFormatSupported> parseVpFormatsSupported(ReadableMap walletMetadata) {
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

    private <T> List<T> convertReadableArrayToEnumList(ReadableMap readableMap, String key,
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

    private void addVpFormatSupported(ReadableMap vpFormatsMap, String key,
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
                vpFormatsSupportedMap.put(formatType, new LdpVcFormatSupported(
                        convertReadableArrayToEnumList(formatMap, "proof_type_values", ProofType.Companion::fromValue),
                        convertReadableArrayToStringList(formatMap, "cryptosuite_values")));
                break;
            case MSO_MDOC:
                vpFormatsSupportedMap.put(formatType, new MsoMdocVcFormatSupported(
                        convertReadableArrayToIntegerList(formatMap, "issuerauth_alg_values"),
                        convertReadableArrayToIntegerList(formatMap, "deviceauth_alg_values")));
                break;
            case VC_SD_JWT:
            case DC_SD_JWT:
                vpFormatsSupportedMap.put(formatType, new SdJwtVcFormatSupported(
                        convertReadableArrayToStringList(formatMap, "sd-jwt_alg_values"),
                        convertReadableArrayToStringList(formatMap, "kb-jwt_alg_values")));
                break;
        }
    }

    private List<String> convertReadableArrayToStringList(ReadableMap readableMap, String key) {
        if (!readableMap.hasKey(key) || readableMap.isNull(key)) {
            return null;
        }
        return FormatConverter.convertReadableArrayToList(readableMap.getArray(key));
    }

    private List<Integer> convertReadableArrayToIntegerList(ReadableMap readableMap, String key) {
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

    private List<Verifier> parseVerifiers(ReadableArray verifiersArray) {
        List<Verifier> verifiers = new ArrayList();

        for (int i = 0; i < verifiersArray.size(); i++) {
            ReadableMap verifierMap = verifiersArray.getMap(i);
            String clientId = verifierMap.getString("client_id");
            ReadableArray responseUris = verifierMap.getArray("response_uris");
            List<String> responseUriList = FormatConverter.convertReadableArrayToList(responseUris);
            String jwksUri = null;
            if (verifierMap.hasKey("jwks_uri") && !verifierMap.isNull("jwks_uri")) {
                try {
                    jwksUri = verifierMap.getString("jwks_uri");
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
            if (verifierMap.hasKey("allow_unsigned_request")) {
                boolean allowUnsignedRequest = verifierMap.getBoolean("allow_unsigned_request");
                verifiers.add(new Verifier(clientId, responseUriList, jwksUri, allowUnsignedRequest));
                continue;
            }

            verifiers.add(new Verifier(clientId, responseUriList, jwksUri));
        }

        return verifiers;
    }

}
