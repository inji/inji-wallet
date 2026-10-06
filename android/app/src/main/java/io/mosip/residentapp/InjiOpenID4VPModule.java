package io.mosip.residentapp;

import static io.mosip.residentapp.utils.OpenId4VPUtils.parseUnsignedVPTokens;
import static io.mosip.residentapp.utils.OpenId4VPUtils.parseVPTokenSigningResults;
import static io.mosip.residentapp.utils.OpenId4VPUtils.parseWalletConfig;

import android.annotation.SuppressLint;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.util.Base64;
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

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.List;
import java.util.Map;

import io.mosip.openID4VP.OpenID4VP;
import io.mosip.openID4VP.authorizationRequest.AuthorizationDcqlRequest;
import io.mosip.openID4VP.authorizationRequest.AuthorizationRequest;
import io.mosip.openID4VP.authorizationRequest.WalletConfig;
import io.mosip.openID4VP.authorizationResponse.unsignedVPToken.UnsignedVPToken;
import io.mosip.openID4VP.authorizationResponse.vpTokenSigningResult.VPTokenSigningResult;
import io.mosip.openID4VP.dcql.evaluator.MatchingCredentialsResult;
import io.mosip.openID4VP.dcql.query.DCQLQuery;
import io.mosip.openID4VP.exceptions.OpenID4VPExceptions;
import io.mosip.openID4VP.helper.DCQLHelper;
import io.mosip.openID4VP.verifier.VerifierResponse;
import io.mosip.openID4VP.wallet.Credential;
import io.mosip.residentapp.utils.OpenId4VPUtils;


public class InjiOpenID4VPModule extends ReactContextBaseJavaModule {
    private static final String TAG = "InjiOpenID4VPModule";
    private static final String MODULE_NAME = "InjiOpenID4VP";

    private OpenID4VP openID4VP;
    private Gson gson;
    private Gson gsonCamelCase;

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
    public void initSdk(String appId, ReadableMap walletConfigMap) {
        Log.d(TAG, "Initializing InjiOpenID4VPModule with " + appId);

        try {
          WalletConfig walletConfig = parseWalletConfig(walletConfigMap);
          openID4VP = new OpenID4VP(appId, walletConfig);
        } catch (Exception exception) {
          Log.e(TAG,"Error occurred during initialization of the OpenID4VP - " + exception);
        }
        gson = new GsonBuilder()
                .setFieldNamingPolicy(FieldNamingPolicy.LOWER_CASE_WITH_UNDERSCORES)
                .disableHtmlEscaping()
                .create();
        gsonCamelCase = new GsonBuilder()
                .disableHtmlEscaping()
                .create();
    }

    @ReactMethod
    public void authenticateVerifier(String urlEncodedAuthorizationRequest,
            Promise promise) {
        try {
            AuthorizationRequest authRequest = openID4VP.authenticateVerifier(
                    urlEncodedAuthorizationRequest);

            String authRequestJson = gson.toJson(authRequest);
            promise.resolve(authRequestJson);
        } catch (Exception e) {
            rejectWithOpenID4VPExceptions(e, promise);
        }
    }

    @ReactMethod
    public void constructUnsignedVPToken(ReadableMap selectedVCs, Promise promise) {
      try {
        Map<String, List<Credential>> selectedCredentials = OpenId4VPUtils.parseSelectedVCs(selectedVCs);
        List<UnsignedVPToken> vpTokens = openID4VP.constructUnsignedVPToken(selectedCredentials);

        promise.resolve(parseUnsignedVPTokens(vpTokens));
      } catch (Exception e) {
        rejectWithOpenID4VPExceptions(e, promise);
      }
    }

  @ReactMethod
    public void getMatchingCredentials(ReadableMap vpRequest, ReadableArray availableWalletCredentials,
                                       Promise promise) {
      try {
        List<Credential> credentials = OpenId4VPUtils.parseCredentials(availableWalletCredentials);

        // Use the already-parsed DCQLQuery from authenticateVerifier to avoid
        // round-trip serialization issues (Gson serializes ClaimValue wrappers as objects)
        DCQLQuery dcqlQuery;
        if (openID4VP.getAuthorizationRequest() instanceof AuthorizationDcqlRequest) {
            dcqlQuery = ((AuthorizationDcqlRequest) openID4VP.getAuthorizationRequest()).getDcqlQuery();
        } else {
            ReadableMap dcqlQueryMap = vpRequest.getMap("dcql_query");
            dcqlQuery = OpenId4VPUtils.parseDcqlQuery(dcqlQueryMap);
        }

        if (dcqlQuery == null) {
          throw new IllegalStateException("dcqlQuery must not be null");
        }
        MatchingCredentialsResult result = new DCQLHelper().getMatchingCredentials(credentials, dcqlQuery);
        promise.resolve(gsonCamelCase.toJson(result));
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
        Log.e("OpenID4VPBridge", "Exception occurred. Details: "+ e.getMessage() +" | Cause: "+e.getCause());

        if (e instanceof OpenID4VPExceptions exception) {
            WritableMap errorMap = Arguments.createMap();
            errorMap.putString("errorCode", exception.getErrorCode());
            errorMap.putString("message", exception.getMessage());
            errorMap.putString("verifierResponse", gson.toJson(exception.getVerifierResponse()));
            errorMap.putString("cause", exception.getCause() != null ? exception.getCause().getMessage() : "Source is the cause");

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

    @ReactMethod
    public void openRedirectUriInBrowser(String redirectUri, Promise promise) {
        try {
            Intent viewIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(redirectUri));
            Intent chooser = Intent.createChooser(viewIntent, null);
            chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

            getReactApplicationContext().startActivity(chooser);
            promise.resolve(true);
        } catch (ActivityNotFoundException e) {
            Log.e(TAG, "No application available to open the redirect_uri - " + e.getMessage());
            promise.resolve(false);
        } catch (Exception e) {
            Log.e(TAG, "Failed to open the redirect_uri - " + e.getMessage());
            promise.resolve(false);
        }
    }
}
