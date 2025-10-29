package inji.utils;

import inji.driver.DriverManager;
import io.appium.java_client.AppiumDriver;
import org.apache.log4j.Logger;
import org.json.JSONObject;
import org.openqa.selenium.JavascriptExecutor;
import org.testng.ITestListener;
import org.testng.ITestResult;


public class BrowserStackStatusListener implements ITestListener {
    private static final Logger logger = Logger.getLogger(BrowserStackStatusListener.class);

    @Override
    public void onTestStart(ITestResult result) {
        String sessionName = result.getTestClass().getRealClass().getSimpleName() + "." + result.getMethod().getMethodName();
        markSessionName(sessionName);
    }

    @Override
    public void onTestSuccess(ITestResult result) {
        markStatus("passed", "Test passed: " + result.getName());
    }

    @Override
    public void onTestFailure(ITestResult result) {
        markStatus("failed", "Test failed: " + result.getName());
    }

    private void markStatus(String status, String reason) {
        if (!Boolean.parseBoolean(InjiWalletConfigManager.getproperty("browserstack_run"))) return;

        AppiumDriver driver = DriverManager.getDriver();
        if (driver instanceof JavascriptExecutor jse) {
            JSONObject executorObject = new JSONObject();
            JSONObject argumentsObject = new JSONObject();
            argumentsObject.put("status", status);
            argumentsObject.put("reason", reason);
            executorObject.put("action", "setSessionStatus");
            executorObject.put("arguments", argumentsObject);
            jse.executeScript(String.format("browserstack_executor: %s", executorObject));
        }
    }

    private void markSessionName(String testName) {
        if (!Boolean.parseBoolean(InjiWalletConfigManager.getproperty("browserstack_run"))) return;

        AppiumDriver driver = DriverManager.getDriver();
        if (driver instanceof JavascriptExecutor jse) {
            try {
                JSONObject executorObject = new JSONObject();
                JSONObject argumentsObject = new JSONObject();
                argumentsObject.put("name", testName);
                executorObject.put("action", "setSessionName");
                executorObject.put("arguments", argumentsObject);
                jse.executeScript(String.format("browserstack_executor: %s", executorObject));
            } catch (Exception e) {
                logger.error("Failed to set BrowserStack session name: " + e.getMessage());
            }
        }
    }
}
