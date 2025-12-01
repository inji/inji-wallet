package io.mosip.residentapp;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableMap;

import java.util.List;

import io.mosip.residentapp.Utils.FormatConverter;
import io.mosip.vercred.vcverifier.CredentialsVerifier;
import io.mosip.vercred.vcverifier.constants.CredentialFormat;
import io.mosip.vercred.vcverifier.data.CredentialVerificationSummary;
import io.mosip.vercred.vcverifier.data.VerificationResult;
import io.mosip.vercred.vcverifier.exception.StatusCheckException;

public class RNVCVerifierModule extends ReactContextBaseJavaModule {
    
    private final CredentialsVerifier credentialsVerifier;
    public RNVCVerifierModule(ReactApplicationContext reactContext) {
        super(reactContext);
        credentialsVerifier = new CredentialsVerifier();
    }

    @Override
    public String getName() {
        return "VCVerifierModule";
    }

    @ReactMethod
    public void verifyCredentials(String vc, String format, Promise promise) {

        VerificationResult result = credentialsVerifier.verify(vc, CredentialFormat.Companion.fromValue(format));
        WritableMap response = Arguments.createMap();
        response.putBoolean("verificationStatus", result.getVerificationStatus());
        response.putString("verificationMessage", result.getVerificationMessage());
        response.putString("verificationErrorCode", result.getVerificationErrorCode());

        promise.resolve(response);
    }

    @ReactMethod
public void getVerificationSummary(String vc, String format, ReadableArray statusPurposes, Promise promise) {
    try {
        // Convert ReadableArray to List<String>
        List<String> statusPurposeList = FormatConverter.convertReadableArrayToList(statusPurposes);
        CredentialVerificationSummary summary = credentialsVerifier.verifyAndGetCredentialStatus(
            vc,
            CredentialFormat.Companion.fromValue(format),
            statusPurposeList
        );

        WritableMap resultMap = Arguments.createMap();

        VerificationResult verificationResult = summary.getVerificationResult();
        resultMap.putBoolean("verificationStatus", verificationResult.getVerificationStatus());
        resultMap.putString("verificationMessage", verificationResult.getVerificationMessage());
        resultMap.putString("verificationErrorCode", verificationResult.getVerificationErrorCode());

        WritableMap statusMap = Arguments.createMap();
        summary.getCredentialStatus().forEach((purpose, statusResult) -> {
            WritableMap statusEntryMap = Arguments.createMap();
            statusEntryMap.putBoolean("isValid", statusResult.isValid());
            StatusCheckException error = statusResult.getError();
            if (error != null) {
                WritableMap errorMap = Arguments.createMap();
                errorMap.putString("message", error.getMessage());
                errorMap.putString("code", error.getErrorCode().name());
                statusEntryMap.putMap("error", errorMap);
            } else {
                statusEntryMap.putNull("error");
            }

            statusMap.putMap(purpose, statusEntryMap);
        });

        resultMap.putMap("credentialStatus", statusMap);
        promise.resolve(resultMap);
    } catch (Exception e) {
        promise.reject("VERIFY_AND_GET_STATUS_ERROR", e.getMessage(), e);
    }
}
}