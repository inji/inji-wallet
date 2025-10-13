package inji.utils;

import com.browserstack.local.Local;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

public class BrowserStackLocalManager {
    private static Local bsLocal;
    protected static String localIdentifier;
    private static boolean started = false;
    private static final Logger LOGGER = LoggerFactory.getLogger(BrowserStackLocalManager.class);

    public static synchronized void startLocal() {
        if (!started) {
            try {
                bsLocal = new Local();
                localIdentifier = "injiwallet-" + System.currentTimeMillis();
                Map<String, String> options = new HashMap<>();
                options.put("key", InjiWalletConfigManager.getproperty("browserstack_accesskey"));
                options.put("forcelocal", "true");

                options.put("localIdentifier", localIdentifier);

                bsLocal.start(options);

                if (!bsLocal.isRunning()) {
                    throw new RuntimeException("BrowserStack Local tunnel did not start!");
                }

                started = true;
                LOGGER.info("BrowserStack Local started successfully.");
            } catch (Exception e) {
                throw new RuntimeException("Failed to start BrowserStack Local", e);
            }
        }
    }

    public static synchronized void stopLocal() {
        if (started && bsLocal != null && bsLocal.isRunning()) {
            try {
                bsLocal.stop();
                started = false;
                LOGGER.info("BrowserStack Local stopped.");
            } catch (Exception e) {
                throw new RuntimeException("Failed to stop BrowserStack Local", e);
            }
        }
    }

    public static String getLocalIdentifier() {
        return localIdentifier;
    }
}
