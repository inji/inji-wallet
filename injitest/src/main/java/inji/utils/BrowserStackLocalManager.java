package inji.utils;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.browserstack.local.Local;

import inji.exceptions.BrowserStackLocalException;
import inji.pages.BasePage;

public class BrowserStackLocalManager {
	private static Local bsLocal;
  protected static volatile String localIdentifier;
	private static boolean started = false;
	private static final Logger LOGGER = LoggerFactory.getLogger(BrowserStackLocalManager.class);
	private static final int MAX_RETRIES = 30;
	private static final int SLEEP_DURATION_MS = 1000;
	private static final String BROWSERSTACK_KEY = "browserstack_accesskey";

  private BrowserStackLocalManager() {
    // Prevent instantiation
  }

	public static synchronized void startLocal() {
		if (!started) {
			try {
				bsLocal = new Local();
				localIdentifier = "injiwallet-" + System.currentTimeMillis();
				Map<String, String> options = new HashMap<>();
        options.put("key", InjiWalletConfigManager.getproperty(BROWSERSTACK_KEY));
				options.put("forcelocal", "true");
				options.put("localIdentifier", localIdentifier);

				bsLocal.start(options);

        int retries = 0;
        while (!bsLocal.isRunning() && retries < MAX_RETRIES) {
          BasePage.sleep(SLEEP_DURATION_MS); // Sleep for a short duration before checking again
          retries++;
        }

        if (retries >= MAX_RETRIES && !bsLocal.isRunning()) {
          throw new BrowserStackLocalException(
              "BrowserStack Local failed to start after "
                  + MAX_RETRIES
                  + " retries. Identifier: "
                  + localIdentifier);
        }

				started = true;
        LOGGER.info("BrowserStack Local started successfully with identifier: {}", localIdentifier);
			} catch (Exception e) {
        throw new BrowserStackLocalException(
            "Failed to start BrowserStack Local with identifier " + localIdentifier, e);
			}
		}
	}

	public static synchronized void stopLocal() {
		if (started && bsLocal != null) {
			try {
				if (bsLocal.isRunning()) {
					bsLocal.stop();
				}
				started = false;
        LOGGER.info("BrowserStack Local stopped for identifier: {}", localIdentifier);
			} catch (Exception e) {
        throw new BrowserStackLocalException(
            "Failed to stop BrowserStack Local with identifier " + localIdentifier, e);
			}
		}
	}

	public static String getLocalIdentifier() {
		return localIdentifier;
	}
}
