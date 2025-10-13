package inji.utils;

import org.openqa.selenium.remote.DesiredCapabilities;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

public class BrowserStackCapabilitiesLoader {

    private static final String buildIdentifier = "#" + new SimpleDateFormat("dd-MMM-HH:mm").format(new Date());

    public static DesiredCapabilities getCommonCapabilities() {
        String platform = InjiWalletConfigManager.getproperty("browserstack_platformName");
        String deviceName = InjiWalletConfigManager.getproperty("browserstack_deviceName");
        String platformVersion = InjiWalletConfigManager.getproperty("browserstack_platformVersion");
        String appId = InjiWalletConfigManager.getproperty("browserstack_appId");
        String buildName = InjiWalletConfigManager.getproperty("browserstack_buildName");

        // Initialize desired capabilities (W3C format)
        DesiredCapabilities capabilities = new DesiredCapabilities();

        // BrowserStack-specific options go inside this map
        Map<String, Object> bStackOptions = new HashMap<>();
        bStackOptions.put("projectName", "InjiTests");
        bStackOptions.put("buildName", buildName + " " + buildIdentifier);
        bStackOptions.put("debug", true);  // for visual logs
        bStackOptions.put("networkLogs", true); // network logs
        bStackOptions.put("interactiveDebugging", true); // optional
        bStackOptions.put("local", true); // set to true only if testing local resources
        bStackOptions.put("localIdentifier", BrowserStackLocalManager.getLocalIdentifier());// set localIdentifier for browserstack local

        // passing credentials here instead of setting via -D
        bStackOptions.put("userName", InjiWalletConfigManager.getproperty("browserstack_username"));
        bStackOptions.put("accessKey", InjiWalletConfigManager.getproperty("browserstack_accesskey"));

        // Set the common Appium capabilities
        capabilities.setCapability("platformName", platform);
        capabilities.setCapability("appium:deviceName", deviceName);
        capabilities.setCapability("appium:platformVersion", platformVersion);
        capabilities.setCapability("appium:app", appId);

        // Set the automationName based on platform
        if ("android".equalsIgnoreCase(platform)) {
            capabilities.setCapability("appium:automationName", "UiAutomator2");
        } else if ("ios".equalsIgnoreCase(platform)) {
            capabilities.setCapability("appium:automationName", "XCUITest");
        } else {
            throw new IllegalArgumentException("Unsupported platform: " + platform);
        }

        // Attach the bstack options as a namespaced capability
        capabilities.setCapability("bstack:options", bStackOptions);

        return capabilities;
    }
}