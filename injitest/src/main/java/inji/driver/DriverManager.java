package inji.driver;

import java.net.URL;
import java.util.function.Supplier;

import org.openqa.selenium.MutableCapabilities;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import inji.exceptions.DriverInitializationException;
import inji.utils.BrowserStackCapabilitiesLoader;
import inji.utils.CapabilitiesReader;
import inji.utils.InjiWalletConfigManager;
import io.appium.java_client.AppiumDriver;
import io.appium.java_client.android.AndroidDriver;
import io.appium.java_client.ios.IOSDriver;

public class DriverManager {
  private static final Logger LOGGER = LoggerFactory.getLogger(DriverManager.class);
  private static final ThreadLocal<AppiumDriver> appiumDriver = new ThreadLocal<>();
  private static final String BROWSERSTACK_URL = "https://hub-cloud.browserstack.com/wd/hub";

  private DriverManager() {
    // Prevent instantiation
  }

  public static AppiumDriver getAndroidDriver() {
    try {
      if (Boolean.parseBoolean(InjiWalletConfigManager.getproperty("browserstack_run"))) {
        MutableCapabilities desiredCapabilities =
            BrowserStackCapabilitiesLoader.getCommonCapabilities();
        URL bsUrl = new URL(BROWSERSTACK_URL);
        appiumDriver.set(
            createDriverWithRetry(() -> new AndroidDriver(bsUrl, desiredCapabilities)));
      } else {
        MutableCapabilities desiredCapabilities =
            CapabilitiesReader.getDesiredCapabilities(
                "androidDevice", "src/main/resources/DesiredCapabilities.json");
        appiumDriver.set(
            new AndroidDriver(new URL("http://127.0.0.1:4723/wd/hub"), desiredCapabilities));
      }
    } catch (Exception e) {
      throw new DriverInitializationException("Failed to initialize Android driver session", e);
    }
    return appiumDriver.get();
  }

  public static AppiumDriver getIosDriver() {
    try {
      if (Boolean.parseBoolean(InjiWalletConfigManager.getproperty("browserstack_run"))) {
        MutableCapabilities desiredCapabilities =
            BrowserStackCapabilitiesLoader.getCommonCapabilities();
        URL bsUrl = new URL(BROWSERSTACK_URL);
        appiumDriver.set(createDriverWithRetry(() -> new IOSDriver(bsUrl, desiredCapabilities)));
      } else {
        MutableCapabilities desiredCapabilities =
            CapabilitiesReader.getDesiredCapabilities(
                "iosDevice", "src/main/resources/DesiredCapabilities.json");
        appiumDriver.set(
            new IOSDriver(new URL("http://127.0.0.1:4723/wd/hub"), desiredCapabilities));
      }
    } catch (Exception e) {
      throw new DriverInitializationException("Failed to initialize iOS driver session", e);
    }
    return appiumDriver.get();
  }

  public static void setDriver(AppiumDriver driverInstance) {
    appiumDriver.set(driverInstance);
  }

  public static AppiumDriver getDriver() {
    return appiumDriver.get();
  }

  public static void quitDriver() {
    if (appiumDriver.get() != null) {
      try {
        appiumDriver.get().quit();
      } finally {
        appiumDriver.remove();
      }
    }
  }

  private static AppiumDriver createDriverWithRetry(Supplier<AppiumDriver> supplier) {
    int maxRetries = 3;
    int waitTime = 2000;
    Exception lastFailure = null;

    for (int attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return supplier.get();

      } catch (Exception e) {
        lastFailure = e;

        if (!shouldRetry(e, attempt, maxRetries)) {
          throw new DriverInitializationException(
              "Driver creation failed (non-retryable error)", e);
        }

        try {
          Thread.sleep(waitTime);
        } catch (InterruptedException ie) {
          Thread.currentThread().interrupt();
          throw new DriverInitializationException("Interrupted while retrying driver creation", ie);
        }
        waitTime *= 2;
        LOGGER.warn(
            "Retrying driver creation (attempt {}/{}). Reason: {}",
            attempt,
            maxRetries,
            e.getMessage());
      }
    }

    throw new DriverInitializationException(
        "Driver creation failed after "
            + maxRetries
            + " attempts. Possible causes: BrowserStack Local not ready or session limit exceeded",
        lastFailure);
  }

  private static boolean shouldRetry(Exception e, int attempt, int maxRetries) {
    String msg = e.getMessage();

    if (isTunnelError(msg) || isQueueError(msg)) {
      return attempt < maxRetries;
    }

    return false;
  }

  private static boolean isTunnelError(String msg) {
    return msg != null && msg.contains("local testing through BrowserStack is not connected");
  }

  private static boolean isQueueError(String msg) {
    return msg != null && msg.contains("BROWSERSTACK_QUEUE_SIZE_EXCEEDED");
  }
}
