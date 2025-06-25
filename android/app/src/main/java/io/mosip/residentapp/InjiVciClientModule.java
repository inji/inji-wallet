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
import com.google.gson.Gson;
import java.util.Objects;
import io.mosip.residentapp.VCIClientCallbackBridge;
import io.mosip.residentapp.VCIClientBridge;

import io.mosip.vciclient.VCIClient;
import io.mosip.vciclient.constants.CredentialFormat;
import io.mosip.vciclient.credentialOffer.CredentialOffer;
import io.mosip.vciclient.credentialOffer.CredentialOfferService;
import io.mosip.vciclient.credentialResponse.CredentialResponse;
import io.mosip.vciclient.proof.jwt.JWTProof;
import io.mosip.vciclient.proof.Proof;
import io.mosip.vciclient.issuerMetadata.IssuerMetadata;
import io.mosip.vciclient.clientMetadata.ClientMetadata;

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
    public void requestCredentialFromTrustedIssuer(String resolvedIssuerMetaJson, String clientMetadataJson, Promise promise) {
        new Thread(() -> {
            try {
                IssuerMetadata issuerMetaData = new Gson().fromJson(
                        resolvedIssuerMetaJson, IssuerMetadata.class);
                ClientMetadata clientMetadata= new Gson().fromJson(
                    clientMetadataJson, ClientMetadata.class);

                CredentialResponse response = VCIClientBridge.requestCredentialFromTrustedIssuerSync(vciClient, issuerMetaData,clientMetadata);

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
