package inji.utils;

import com.aventstack.extentreports.ExtentReports;
import com.aventstack.extentreports.ExtentTest;
import com.aventstack.extentreports.reporter.ExtentSparkReporter;
import com.aventstack.extentreports.reporter.configuration.Theme;
import io.mosip.testrig.apirig.testrunner.BaseTestCase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.Date;

public class ExtentReportManager {
    private static ExtentReports extent;
    private static String gitBranch;
    private static String gitCommitId;
    private static final Logger LOGGER = LoggerFactory.getLogger(ExtentReportManager.class);
    private static final ThreadLocal<ExtentTest> testThread = new ThreadLocal<>();
    private static final String currentDate = new SimpleDateFormat("yyyy-MM-dd").format(new Date());
    private static boolean systemInfoAdded = false;

    private static int passedCount = 0;
    private static int failedCount = 0;
    private static int skippedCount = 0;

    public static synchronized void initReport() {
        getGitDetails();
        String reportName = "Test Execution Report";
        reportName += " ---- Inji Mobile UI Test ---- Report Date: " + currentDate + " ---- Tested Environment: "
                + getEnvName(BaseTestCase.ApplnURI);
        if (gitBranch != null && gitCommitId != null) {
            reportName += " ---- Branch Name: " + gitBranch + " & Commit ID: " + gitCommitId;
        }

        ExtentSparkReporter spark = new ExtentSparkReporter("test-output/ExtentReport.html");
        spark.config().setTheme(Theme.DARK);
        spark.config().setDocumentTitle("Automation Report");
        spark.config().setReportName(reportName);

        extent = new ExtentReports();
        extent.attachReporter(spark);
        addSystemInfo();
    }

    public static synchronized void flushReport() {
        if (extent != null) {
            extent.flush();
        }
    }

    public static synchronized ExtentTest createTest(String testName) {
        ExtentTest test = extent.createTest(testName);
        testThread.set(test);
        return test;
    }

    public static ExtentTest getTest() {
        return testThread.get();
    }

    public static synchronized void setTest(ExtentTest test) {
        testThread.set(test);
    }

    public static void removeTest() {
        testThread.remove();
    }

    private static void addSystemInfo() {
        if (extent != null && !systemInfoAdded) {
            LOGGER.info("Adding Git info to report: Branch = {}, Commit ID = {}", gitBranch, gitCommitId);
            extent.setSystemInfo("Git Branch", gitBranch);
            extent.setSystemInfo("Git Commit ID", gitCommitId);
            extent.setSystemInfo("Device Name", InjiWalletConfigManager.getproperty("browserstack_deviceName"));
            extent.setSystemInfo("Platform Name", InjiWalletConfigManager.getproperty("browserstack_platformName"));
            extent.setSystemInfo("platform version", InjiWalletConfigManager.getproperty("browserstack_platformVersion"));
            systemInfoAdded = true;
        }
    }

    private static String runCommand(String... command) throws IOException {
        Process process = new ProcessBuilder(command).redirectErrorStream(true).start();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            return reader.readLine().trim();
        }
    }

    private static void getGitDetails() {
        try {
            gitBranch = runCommand("git", "rev-parse", "--abbrev-ref", "HEAD");
            gitCommitId = runCommand("git", "rev-parse", "--short", "HEAD");
        } catch (IOException e) {
            LOGGER.error("Failed to get Git details dynamically: {}", e.getMessage());
        }
    }

    public static String getEnvName(String url) {
        if (url == null || url.isEmpty()) return "unknown";

        try {
            URL parsedUrl = new URL(url);
            String host = parsedUrl.getHost(); // e.g., api-internal.qa-inji1.mosip.net

            // Remove known prefix if present
            host = host.replaceFirst("^api-internal\\.", "");

            // Remove suffix
            host = host.replaceFirst("\\.mosip\\.net$", "");

            return host;

        } catch (MalformedURLException e) {
            LOGGER.error("Error getting env name: {}", e.getMessage());
            e.printStackTrace();
            return "unknown";
        }
    }

    public static synchronized void incrementPassed() {
        passedCount++;
    }

    public static synchronized void incrementFailed() {
        failedCount++;
    }

    public static synchronized void incrementSkipped() {
        skippedCount++;
    }

    public static int getPassedCount() {
        return passedCount;
    }

    public static int getFailedCount() {
        return failedCount;
    }

    public static int getSkippedCount() {
        return skippedCount;
    }

    public static int getTotalCount() {
        return passedCount + failedCount + skippedCount;
    }

}