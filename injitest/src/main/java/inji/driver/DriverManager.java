package inji.driver;

import inji.utils.BrowserStackCapabilitiesLoader;
import inji.utils.CapabilitiesReader;
import inji.utils.InjiWalletConfigManager;
import io.appium.java_client.AppiumDriver;
import io.appium.java_client.android.AndroidDriver;
import io.appium.java_client.ios.IOSDriver;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.net.URL;

public class DriverManager {
    private static final ThreadLocal<AppiumDriver> appiumDriver = new ThreadLocal<>();
    private static DesiredCapabilities desiredCapabilities;

    public static AppiumDriver getAndroidDriver() {
        try {
            if (Boolean.parseBoolean(InjiWalletConfigManager.getproperty("browserstack_run"))) {
                desiredCapabilities = BrowserStackCapabilitiesLoader.getCommonCapabilities();
                appiumDriver.set(new AndroidDriver(new URL("https://hub-cloud.browserstack.com/wd/hub"), desiredCapabilities));
            } else {
                desiredCapabilities = CapabilitiesReader.getDesiredCapabilities("androidDevice", "src/main/resources/DesiredCapabilities.json");
                appiumDriver.set(new AndroidDriver(new URL("http://127.0.0.1:4723/wd/hub"), desiredCapabilities));
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to start Android Driver", e);
        }
        return appiumDriver.get();
    }

    public static AppiumDriver getIosDriver() {
        try {
            if (Boolean.parseBoolean(InjiWalletConfigManager.getproperty("browserstack_run"))) {
                desiredCapabilities = BrowserStackCapabilitiesLoader.getCommonCapabilities();
                appiumDriver.set(new IOSDriver(new URL("https://hub-cloud.browserstack.com/wd/hub"), desiredCapabilities));
            } else {
                desiredCapabilities = CapabilitiesReader.getDesiredCapabilities("iosDevice", "src/main/resources/DesiredCapabilities.json");
                appiumDriver.set(new IOSDriver(new URL("http://127.0.0.1:4723/wd/hub"), desiredCapabilities));
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to start iOS Driver", e);
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
            appiumDriver.get().quit();
            appiumDriver.remove();
        }
    }
}