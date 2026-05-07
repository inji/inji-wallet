package io.mosip.residentapp;

import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.google.gson.Gson;

import java.util.List;
import java.util.Map;

import io.mosip.openID4VP.authorizationResponse.vpTokenSigningResult.VPTokenSigningResultV2;
import io.mosip.residentapp.utils.OpenId4VPUtils;
import io.mosip.vciclient.VCIClient;
import io.mosip.vciclient.authorizationCodeFlow.clientMetadata.ClientMetadata;
import io.mosip.vciclient.token.TokenResponse;
import io.mosip.vciclient.exception.VCIClientException;
import io.mosip.openID4VP.exceptions.OpenID4VPExceptions;

public class InjiVciClientModule extends ReactContextBaseJavaModule {

    private static final String TAG = "InjiVciClientModule";
    private static final Gson GSON = new Gson();
    private VCIClient vciClient;
    private final ReactApplicationContext reactContext;

    public InjiVciClientModule(@Nullable ReactApplicationContext reactContext) {
        super(reactContext);

        this.reactContext = reactContext;
        VCIClientBridge.reactContext = this.reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return "InjiVciClient";
    }

    @ReactMethod
    public void init(String appId) {
        Log.d(TAG, "Initializing InjiVciClientModule with " + appId);
        vciClient = new VCIClient(appId);
    }

    @ReactMethod
    public void sendProofFromJS(String jwt) {
        VCIClientCallbackBridge.completeProof(jwt);
    }

    @ReactMethod
    public void sendAuthCodeFromJS(String authCode) {
        VCIClientCallbackBridge.completeAuthCode(authCode);
    }

    @ReactMethod
    public void sendSelectedCredentialsForVPSharingFromJS(ReadableMap selectedVCs) {
        VCIClientCallbackBridge.completePresentationRequest(OpenId4VPUtils.parseSelectedVCs(selectedVCs));
    }

    @ReactMethod
    public void sendVPTokenSigningResultFromJS(ReadableArray vpTokenSigningResults) {
        List<VPTokenSigningResultV2> formattedVPTokenSigningResults = OpenId4VPUtils
                .parseVPTokenSigningResultV2(vpTokenSigningResults);
        VCIClientCallbackBridge.completeSignDataForVP(formattedVPTokenSigningResults);
    }

    @ReactMethod
    public void sendTxCodeFromJS(String txCode) {
        VCIClientCallbackBridge.completeTxCode(txCode);
    }

    @ReactMethod
    public void sendIssuerTrustResponseFromJS(Boolean trusted) {
        VCIClientCallbackBridge.completeIssuerTrustResponse(trusted);
    }

    @ReactMethod
    public void sendTokenResponseFromJS(String tokenResponseJson) {
        TokenResponse tokenResponse = GSON.fromJson(tokenResponseJson, TokenResponse.class);
        VCIClientCallbackBridge.completeTokenResponse(tokenResponse);
    }

    @ReactMethod
    public void getIssuerMetadata(String credentialIssuer, Promise promise) {
        new Thread(() -> {
            try {
                Map<String, Object> issuerMetadata = VCIClientBridge.getIssuerMetadataSync(vciClient, credentialIssuer);
                reactContext.runOnUiQueueThread(() -> {
                    String json = GSON.toJson(issuerMetadata, Map.class);
                    promise.resolve(json);
                });
            } catch (Exception e) {
                reactContext.runOnUiQueueThread(() -> rejectVCIException(promise, e));
            }
        }).start();
    }

    @ReactMethod
    public void requestCredentialByOffer(
            String credentialOffer,
            String clientMetadataJson,
            String signatureSuite,
            Promise promise) {
        new Thread(() -> {
            try {
                ClientMetadata clientMetadata = GSON.fromJson(clientMetadataJson, ClientMetadata.class);

                String response = VCIClientBridge.requestCredentialByOfferSync(
                        vciClient,
                        credentialOffer,
                        clientMetadata,
                        signatureSuite);

                reactContext
                        .runOnUiQueueThread(() -> promise.resolve(response));
            } catch (Exception e) {
                reactContext.runOnUiQueueThread(() -> rejectVCIException(promise, e));
            }
        }).start();
    }

    @ReactMethod
    public void requestCredentialFromTrustedIssuer(String credentialIssuer, String credentialConfigurationId,
            String clientMetadataJson, String signatureSuite, Promise promise) {
        new Thread(() -> {
            try {
                ClientMetadata clientMetadata = GSON.fromJson(
                        clientMetadataJson, ClientMetadata.class);

                String response = VCIClientBridge.requestCredentialFromTrustedIssuerSync(
                        vciClient,
                        credentialIssuer,
                        credentialConfigurationId,
                        clientMetadata,
                        signatureSuite);

                reactContext.runOnUiQueueThread(() -> {
                    promise.resolve(response);
                });
            } catch (Exception e) {
                reactContext.runOnUiQueueThread(() -> rejectVCIException(promise, e));
            }
        }).start();

    }

    @ReactMethod
    public void abortPresentationFlowFromJS(String code, String message) {
        Log.d(TAG, "abortPresentationFlowFromJS called with code=" + code);

        OpenID4VPExceptions exception = OpenId4VPUtils.convertToOpenID4VPException(
                code,
                message,
                getName());

        VCIClientCallbackBridge.abortPresentationFlow(exception);
    }

    private void rejectVCIException(Promise promise, Exception e) {

        if (e instanceof VCIClientException) {
    
            VCIClientException ex = (VCIClientException) e;
    
            WritableMap userInfo = Arguments.createMap();
    
            if (ex.getSourceErrorCode() != null) {
                userInfo.putString("sourceErrorCode", ex.getSourceErrorCode());
            }
    
            if (ex.getServerErrorCode() != null) {
                userInfo.putString("serverErrorCode", ex.getServerErrorCode());
            }
    
            if (ex.getServerErrorDescription() != null) {
                userInfo.putString("serverErrorDescription", ex.getServerErrorDescription());
            }
    
            promise.reject(
                    ex.getCode() != null ? ex.getCode() : "VCI_CLIENT_ERROR",
                    ex.getMessage(),
                    userInfo
            );
    
        } else {
    
            promise.reject(
                    "UNKNOWN_ERROR",
                    e.getMessage() != null ? e.getMessage() : "Unknown error occurred",
                    e
            );
        }
    }
}
