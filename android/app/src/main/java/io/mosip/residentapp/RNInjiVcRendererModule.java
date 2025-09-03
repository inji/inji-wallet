package io.mosip.residentapp;

import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableNativeArray;

import java.util.List;

import io.mosip.vercred.vcverifier.CredentialsVerifier;
import io.mosip.vercred.vcverifier.constants.CredentialFormat;
import io.mosip.vercred.vcverifier.data.VerificationResult;
import io.mosip.injivcrenderer.InjiVcRenderer;

public class RNInjiVcRendererModule extends ReactContextBaseJavaModule {
    private static final String MODULE_NAME = "InjiVcRenderer";

    private final InjiVcRenderer injiVcRenderer;

    public RNInjiVcRendererModule(@Nullable ReactApplicationContext reactContext) {
        super(reactContext);
        injiVcRenderer = new InjiVcRenderer();
    }

    @Override
    public String getName() {
        return MODULE_NAME;
    }

    @ReactMethod
    public void renderSvg(String vcJsonString, Promise promise) {
        try {
            List<String> results = injiVcRenderer.renderSvg(vcJsonString);
            WritableArray resultArray = new WritableNativeArray();
            for (String svg : results) {
                resultArray.pushString(svg);
            }

            promise.resolve(resultArray);
        } catch (Exception e) {
            promise.reject("INJI_VC_RENDER_ERROR", e);
        }
    }
}
