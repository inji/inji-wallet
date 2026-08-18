package io.mosip.residentapp;

import static io.mosip.residentapp.utils.OpenId4VPUtils.parseUnsignedVPTokens;
import static io.mosip.residentapp.utils.OpenId4VPUtils.parseVPTokenSigningResults;
import static io.mosip.residentapp.utils.OpenId4VPUtils.parseWalletConfig;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.net.Uri;
import android.os.Build;
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
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.google.gson.FieldNamingPolicy;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

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
    private static final Set<String> BROWSER_SCHEMES = new HashSet<>(Arrays.asList("http", "https"));
    private static final int MAX_PORT = 65535;

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
    public void getAvailableBrowsers(Promise promise) {
        try {
            WritableArray browsers = Arguments.createArray();
            for (InstalledBrowser browser : availableBrowsers()) {
                WritableMap browserMap = Arguments.createMap();
                browserMap.putString("id", browser.packageName);
                browserMap.putString("displayName", browser.displayName);
                browserMap.putBoolean("isDefault", browser.isDefault);
                browsers.pushMap(browserMap);
            }
            promise.resolve(browsers);
        } catch (Exception e) {
            Log.e(TAG, "Unable to list the browsers installed on the device - " + e.getMessage());
            promise.resolve(Arguments.createArray());
        }
    }

    @ReactMethod
    public void redirectToVerifier(String redirectUri, @Nullable String browserId, Promise promise) {
        try {
            String sanitizedRedirectUri = sanitizeRedirectUri(redirectUri);
            if (sanitizedRedirectUri == null) {
                Log.e(TAG, "Verifier returned a redirect_uri that is not an absolute navigable URI. Redirection is skipped.");
                promise.resolve(false);
                return;
            }

            boolean browserNavigable = isBrowserNavigableRedirectUri(sanitizedRedirectUri);
            InstalledBrowser selectedBrowser = null;
            if (browserNavigable && browserId != null && !browserId.isEmpty()) {
                for (InstalledBrowser browser : availableBrowsers()) {
                    if (browser.packageName.equals(browserId)) {
                        selectedBrowser = browser;
                        break;
                    }
                }
            }

            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(sanitizedRedirectUri));
            if (browserNavigable) {
                intent.addCategory(Intent.CATEGORY_BROWSABLE);
            }
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            if (selectedBrowser != null) {
                intent.setClassName(selectedBrowser.packageName, selectedBrowser.activityName);
            }

            getReactApplicationContext().startActivity(intent);
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Unable to redirect to the redirect_uri returned by the Verifier - " + e.getMessage());
            promise.resolve(false);
        }
    }

    private static final class InstalledBrowser {
        final String packageName;
        final String activityName;
        final String displayName;
        final boolean isDefault;

        InstalledBrowser(String packageName, String activityName, String displayName, boolean isDefault) {
            this.packageName = packageName;
            this.activityName = activityName;
            this.displayName = displayName;
            this.isDefault = isDefault;
        }
    }

    private List<InstalledBrowser> availableBrowsers() {
        PackageManager packageManager = getReactApplicationContext().getPackageManager();
        if (packageManager == null) {
            return Collections.emptyList();
        }

        Intent probeIntent = new Intent()
                .setAction(Intent.ACTION_VIEW)
                .addCategory(Intent.CATEGORY_BROWSABLE)
                .setData(Uri.fromParts("http", "", null));

        String defaultBrowserPackage = null;
        try {
            ResolveInfo defaultBrowser = Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU
                    ? packageManager.resolveActivity(probeIntent, PackageManager.ResolveInfoFlags.of(PackageManager.MATCH_DEFAULT_ONLY))
                    : packageManager.resolveActivity(probeIntent, PackageManager.MATCH_DEFAULT_ONLY);
            if (defaultBrowser != null && defaultBrowser.activityInfo != null) {
                defaultBrowserPackage = defaultBrowser.activityInfo.packageName;
            }
        } catch (Exception e) {
            Log.e(TAG, "Unable to resolve the default browser - " + e.getMessage());
        }

        List<ResolveInfo> resolveInfos;
        try {
            resolveInfos = Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU
                    ? packageManager.queryIntentActivities(probeIntent, PackageManager.ResolveInfoFlags.of(PackageManager.MATCH_ALL))
                    : packageManager.queryIntentActivities(probeIntent, PackageManager.MATCH_ALL);
        } catch (Exception e) {
            Log.e(TAG, "Unable to query the browsers installed on the device - " + e.getMessage());
            return Collections.emptyList();
        }

        Map<String, InstalledBrowser> browsersByPackage = new LinkedHashMap<>();
        for (ResolveInfo resolveInfo : resolveInfos) {
            if (resolveInfo.activityInfo == null) {
                continue;
            }
            String packageName = resolveInfo.activityInfo.packageName;
            if (browsersByPackage.containsKey(packageName)) {
                continue;
            }

            String displayName = packageName;
            try {
                CharSequence label = resolveInfo.loadLabel(packageManager);
                if (label != null && label.toString().trim().length() > 0) {
                    displayName = label.toString();
                }
            } catch (Exception e) {
                Log.e(TAG, "Unable to read the label of " + packageName + " - " + e.getMessage());
            }

            browsersByPackage.put(packageName, new InstalledBrowser(
                    packageName,
                    resolveInfo.activityInfo.name,
                    displayName,
                    packageName.equals(defaultBrowserPackage)));
        }

        List<InstalledBrowser> browsers = new ArrayList<>(browsersByPackage.values());
        Collections.sort(browsers, new Comparator<InstalledBrowser>() {
            @Override
            public int compare(InstalledBrowser first, InstalledBrowser second) {
                if (first.isDefault != second.isDefault) {
                    return first.isDefault ? -1 : 1;
                }
                return first.displayName.toLowerCase(Locale.ROOT)
                        .compareTo(second.displayName.toLowerCase(Locale.ROOT));
            }
        });
        return browsers;
    }

    @Nullable
    private static String sanitizeRedirectUri(@Nullable String redirectUri) {
        if (redirectUri == null) {
            return null;
        }
        String value = redirectUri.trim();
        if (value.isEmpty()) {
            return null;
        }

        URI uri;
        try {
            uri = new URI(value);
        } catch (URISyntaxException e) {
            return null;
        }

        String scheme = uri.getScheme() == null ? null : uri.getScheme().toLowerCase(Locale.ROOT);
        if (!uri.isAbsolute() || scheme == null || scheme.isEmpty()) {
            return null;
        }
        if (BROWSER_SCHEMES.contains(scheme) && !hasNavigableHost(uri)) {
            return null;
        }
        return value;
    }

    private static boolean hasNavigableHost(URI uri) {
        String authority = uri.getRawAuthority();
        if (authority == null) {
            return false;
        }
        int userInfoSeparator = authority.lastIndexOf('@');
        String hostAndPort = userInfoSeparator >= 0 ? authority.substring(userInfoSeparator + 1) : authority;

        int portSeparator;
        if (hostAndPort.startsWith("[")) {
            int closingBracket = hostAndPort.indexOf(']');
            if (closingBracket < 0) {
                return false;
            }
            portSeparator = hostAndPort.indexOf(':', closingBracket + 1);
        } else {
            portSeparator = hostAndPort.lastIndexOf(':');
        }

        if (portSeparator < 0) {
            return !hostAndPort.trim().isEmpty();
        }

        String hostPart = hostAndPort.substring(0, portSeparator);
        int port;
        try {
            port = Integer.parseInt(hostAndPort.substring(portSeparator + 1));
        } catch (NumberFormatException e) {
            return false;
        }
        return !hostPart.trim().isEmpty() && port >= 0 && port <= MAX_PORT;
    }

    private static boolean isBrowserNavigableRedirectUri(String sanitizedRedirectUri) {
        try {
            String scheme = new URI(sanitizedRedirectUri).getScheme();
            return scheme != null && BROWSER_SCHEMES.contains(scheme.toLowerCase(Locale.ROOT));
        } catch (URISyntaxException e) {
            return false;
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
}
