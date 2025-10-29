package io.mosip.residentapp;

import androidx.annotation.NonNull;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import io.mosip.tuvali.verifier.Verifier;
import io.mosip.tuvali.wallet.Wallet;

public class InjiPackage implements ReactPackage {
    @NonNull
    @Override
    public List<NativeModule> createNativeModules(@NonNull ReactApplicationContext reactApplicationContext) {
        List<NativeModule> modules = new ArrayList<>();

        modules.add(new InjiVciClientModule(reactApplicationContext));
        modules.add(new RNPixelpassModule(reactApplicationContext));
        modules.add(new RNSecureKeystoreModule(reactApplicationContext));
        modules.add(new RNVersionModule());
        modules.add(new RNWalletModule(new RNEventEmitter(reactApplicationContext), new Wallet(reactApplicationContext), reactApplicationContext));
        modules.add(new RNVerifierModule(new RNEventEmitter(reactApplicationContext), new Verifier(reactApplicationContext), reactApplicationContext));
        modules.add(new RNDeepLinkIntentModule(reactApplicationContext));
        modules.add(new InjiOpenID4VPModule(reactApplicationContext));
        modules.add(new RNVCVerifierModule(reactApplicationContext));
        modules.add(new RNInjiVcRendererModule(reactApplicationContext));
        return modules;
    }

    @NonNull
    @Override
    public List<ViewManager> createViewManagers(@NonNull ReactApplicationContext reactApplicationContext) {
        return Collections.emptyList();
    }
}
