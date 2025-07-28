package io.mosip.residentapp;

import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.google.gson.Gson;

import java.util.Map;

import io.mosip.vciclient.VCIClient;
import io.mosip.vciclient.authorizationCodeFlow.clientMetadata.ClientMetadata;
import io.mosip.vciclient.credential.response.CredentialResponse;
import io.mosip.vciclient.token.TokenResponse;

public class InjiVciClientModule extends ReactContextBaseJavaModule {
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
        Log.d("InjiVciClientModule", "Initializing InjiVciClientModule with " + appId);
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
    public void sendTxCodeFromJS(String txCode) {
        VCIClientCallbackBridge.completeTxCode(txCode);
    }

    @ReactMethod
    public void sendIssuerTrustResponseFromJS(Boolean trusted) {
        VCIClientCallbackBridge.completeIssuerTrustResponse(trusted);
    }

    @ReactMethod
    public void sendTokenResponseFromJS(String tokenResponseJson) {
        TokenResponse tokenResponse = new Gson().fromJson(tokenResponseJson, TokenResponse.class);
        VCIClientCallbackBridge.completeTokenResponse(tokenResponse);
    }

    @ReactMethod
    public void getIssuerMetadata(String credentialIssuer, Promise promise) {
        new Thread(() -> {
            try {
                Map<String, Object> issuerMetadata = vciClient.getIssuerMetadata(credentialIssuer);
                reactContext.runOnUiQueueThread(() -> {
                    String json = new Gson().toJson(issuerMetadata, Map.class);
                    promise.resolve(json);
                });
            } catch (Exception e) {
                reactContext.runOnUiQueueThread(() -> {
                    promise.reject("GET_ISSUER_METADATA_FAILED", e.getMessage(), e);
                });
            }
        }).start();
    }

    @ReactMethod
    public void requestCredentialByOffer(String credentialOffer,String clientMetadataJson, Promise promise) {
        new Thread(() -> {
            try {
                ClientMetadata clientMetadata= new Gson().fromJson(
                    clientMetadataJson, ClientMetadata.class);
                CredentialResponse response = VCIClientBridge.requestCredentialByOfferSync(vciClient, credentialOffer,clientMetadata);
                reactContext.runOnUiQueueThread(() -> {
                    promise.resolve(response != null ? response.toJsonString() : null);
                });
            } catch (Exception e) {
                reactContext.runOnUiQueueThread(() -> {
                    promise.reject("OFFER_FLOW_FAILED", e.getMessage(), e);
                });
            }
        }).start();
    }

    @ReactMethod
    public void requestCredentialFromTrustedIssuer(String credentialIssuer, String credentialConfigurationId, String clientMetadataJson, Promise promise) {
        new Thread(() -> {
            try {
                ClientMetadata clientMetadata= new Gson().fromJson(
                    clientMetadataJson, ClientMetadata.class);

                CredentialResponse response = VCIClientBridge.requestCredentialFromTrustedIssuerSync(vciClient, credentialIssuer, credentialConfigurationId,clientMetadata);

                reactContext.runOnUiQueueThread(() -> {
                    promise.resolve(response != null ? response.toJsonString() : null);
                });
            } catch (Exception e) {
                reactContext.runOnUiQueueThread(() -> {
                    promise.reject("TRUSTED_ISSUER_FAILED", e.getMessage(), e);
                });
            }
        }).start();
    }
}
