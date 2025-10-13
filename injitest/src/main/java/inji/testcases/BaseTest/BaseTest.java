package inji.testcases.BaseTest;

import com.aventstack.extentreports.ExtentTest;
import com.aventstack.extentreports.Status;
import com.browserstack.local.Local;
import inji.annotations.NeedsMockUIN;
import inji.annotations.NeedsSunbirdPolicy;
import inji.annotations.NeedsUIN;
import inji.annotations.NeedsVID;
import inji.constants.PlatformType;
import inji.driver.DriverManager;
import inji.models.Policy;
import inji.models.Uin;
import inji.models.Vid;
import inji.utils.BrowserStackLocalManager;
import inji.utils.ExtentReportManager;
import inji.utils.InjiWalletConfigManager;
import inji.utils.testdatamanager.MockUINManager;
import inji.utils.testdatamanager.PolicyManager;
import inji.utils.testdatamanager.UINManager;
import inji.utils.testdatamanager.VIDManager;
import io.appium.java_client.AppiumDriver;
import io.mosip.testrig.apirig.testrunner.BaseTestCase;
import io.mosip.testrig.apirig.utils.S3Adapter;
import org.json.JSONObject;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.testng.ITestResult;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.AfterSuite;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.BeforeSuite;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.lang.reflect.Method;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

public abstract class BaseTest {

    protected Local bsLocal;

    private static final ThreadLocal<Uin> threadUin = new ThreadLocal<>();
    private static final ThreadLocal<Vid> threadVid = new ThreadLocal<>();
    private static final ThreadLocal<Uin> threadMockUin = new ThreadLocal<>();
    private static final ThreadLocal<Policy> threadPolicy = new ThreadLocal<>();
    private static final Logger LOGGER = LoggerFactory.getLogger(BaseTest.class);

    protected abstract PlatformType getPlatformType();

    protected AppiumDriver getDriver() {
        return DriverManager.getDriver();
    }

    @BeforeSuite(alwaysRun = true)
    public void beforeSuite() {
        ExtentReportManager.initReport();
        BrowserStackLocalManager.startLocal();
    }

    @BeforeMethod(alwaysRun = true)
    public void setup(Method method) throws MalformedURLException, InterruptedException {

        //Reporting
        String className = method.getDeclaringClass().getSimpleName();
        String methodName = method.getName();
        ExtentTest test = ExtentReportManager.createTest(className + " :: " + methodName);
        ExtentReportManager.setTest(test);

        //Getting test data
        if (method.isAnnotationPresent(NeedsUIN.class)) {
            Uin uinDetails = UINManager.acquireUIN();
            threadUin.set(uinDetails);
        }
        if (method.isAnnotationPresent(NeedsSunbirdPolicy.class)) {
            Policy policy = PolicyManager.acquirePolicy();
            threadPolicy.set(policy);
        }
        if (method.isAnnotationPresent(NeedsVID.class)) {
            Vid vidDetails = VIDManager.acquireVID();
            threadVid.set(vidDetails);
        }
        if (method.isAnnotationPresent(NeedsMockUIN.class)) {
            Uin mockUinDetails = MockUINManager.acquireUIN();
            threadMockUin.set(mockUinDetails);
        }

        if (getPlatformType() == PlatformType.ANDROID) {
            DriverManager.getAndroidDriver();
        } else if (getPlatformType() == PlatformType.IOS) {
            DriverManager.getIosDriver();
        } else {
            throw new IllegalArgumentException("Unsupported platform");
        }
    }

    @AfterMethod(alwaysRun = true)
    public void teardown(ITestResult result) {
        Method method = result.getMethod().getConstructorOrMethod().getMethod();
        ExtentTest test = ExtentReportManager.getTest();

        if (result.getStatus() == ITestResult.FAILURE) {
            test.log(Status.FAIL, "Test Failed: " + result.getThrowable());
            ExtentReportManager.incrementFailed();
        } else if (result.getStatus() == ITestResult.SKIP) {
            test.log(Status.SKIP, "Test Skipped: " + result.getThrowable());
            ExtentReportManager.incrementSkipped();
        } else {
            test.log(Status.PASS, "Test Passed");
            ExtentReportManager.incrementPassed();
        }

        if (method.isAnnotationPresent(NeedsUIN.class)) {
            Uin uin = threadUin.get();
            if (uin != null) {
                UINManager.releaseUIN(uin);
                threadUin.remove();
            }
        }

        if (method.isAnnotationPresent(NeedsSunbirdPolicy.class)) {
            Policy policy = threadPolicy.get();
            if (policy != null) {
                PolicyManager.releasePolicy(policy);
                threadPolicy.remove();
            }
        }

        if (method.isAnnotationPresent(NeedsVID.class)) {
            Vid vid = threadVid.get();
            if (vid != null) {
                VIDManager.releaseVID(vid);
                threadVid.remove();
            }
        }

        if (method.isAnnotationPresent(NeedsMockUIN.class)) {
            Uin mockUin = threadMockUin.get();
            if (mockUin != null) {
                MockUINManager.releaseUIN(mockUin);
                threadMockUin.remove();
            }
        }

        try {
            AppiumDriver driver = getDriver();

            String sessionId = ((RemoteWebDriver) driver).getSessionId().toString();
            String jsonUrl = "https://app-automate.browserstack.com/sessions/" + sessionId + ".json";

            // Call BrowserStack session API
            String username = InjiWalletConfigManager.getproperty("browserstack_username");
            String accessKey = InjiWalletConfigManager.getproperty("browserstack_accesskey");
            String auth = username + ":" + accessKey;
            String basicAuth = "Basic " + Base64.getEncoder().encodeToString(auth.getBytes());

            URL url = new URL(jsonUrl);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Authorization", basicAuth);

            BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            String inputLine;
            StringBuilder response = new StringBuilder();
            while ((inputLine = in.readLine()) != null) {
                response.append(inputLine);
            }
            in.close();

            JSONObject jsonResponse = new JSONObject(response.toString());
//            String buildHashedId = jsonResponse.getJSONObject("automation_session").getString("build_hashed_id");
            String publicUrl = jsonResponse.getJSONObject("automation_session").getString("public_url");
            String videoUrl = jsonResponse.getJSONObject("automation_session").getString("video_url");

//            String dashboardUrl = "https://app-automate.browserstack.com/dashboard/v2/builds/" + buildHashedId + "/sessions/" + sessionId;
            ExtentReportManager.getTest().log(Status.INFO,
                    "<a href='" + publicUrl + "' target='_blank'>View on BrowserStack</a>");
            ExtentReportManager.getTest().log(Status.INFO,
                    "<a href='" + videoUrl + "' target='_blank'>Click here to view only Video</a>");

        } catch (Exception e) {
            ExtentReportManager.getTest().log(Status.WARNING, "Failed to fetch BrowserStack build/session info: " + e.getMessage());
        }


        ExtentReportManager.removeTest();
        DriverManager.quitDriver();
    }

    @AfterSuite(alwaysRun = true)
    public void afterSuite() {
        ExtentReportManager.flushReport();
        BrowserStackLocalManager.stopLocal();

        // Generate final report file name
        String timestamp = new SimpleDateFormat("yyyy-MM-dd-HH-mm").format(new Date());
        String envName = ExtentReportManager.getEnvName(BaseTestCase.ApplnURI);
        int total = ExtentReportManager.getTotalCount();
        int passed = ExtentReportManager.getPassedCount();
        int failed = ExtentReportManager.getFailedCount();
        int skipped = ExtentReportManager.getSkippedCount();

        String newFileName = String.format("InjiMobileUi-%s-%s-T-%d_P-%d_S-%d_F-%d.html",
                envName, timestamp, total, passed, skipped, failed);

        File originalReport = new File("test-output/ExtentReport.html");
        File renamedReport = new File("test-output/" + newFileName);

        if (originalReport.renameTo(renamedReport)) {
            LOGGER.info("Report renamed to: {}", renamedReport.getName());
        } else {
            LOGGER.error("Failed to rename the report.");
        }

        // Upload to S3
        if ("yes".equalsIgnoreCase(InjiWalletConfigManager.getPushReportsToS3())) {
            try {
                S3Adapter s3Adapter = new S3Adapter();
                boolean success = s3Adapter.putObject(
                        InjiWalletConfigManager.getS3Account(),  // bucket
                        "",                                     // folder
                        null,                                   // metadata
                        null,                                   // headers
                        newFileName,                            // s3 object name
                        renamedReport                           // file
                );
                LOGGER.info("Uploaded to S3: {}", success);
            } catch (Exception e) {
                LOGGER.error("S3 upload failed: {}", e.getMessage(), e);
            }
        }
    }

    // Getters for tests

    public Uin getUinDetails() {
        return threadUin.get();
    }

    public String getUIN() {
        return getUinDetails() != null ? getUinDetails().getUin() : null;
    }

    public String getPhone() {
        return getUinDetails() != null ? getUinDetails().getPhone() : null;
    }

    public String getEmail() {
        return getUinDetails() != null ? getUinDetails().getEmail() : null;
    }

    public Policy getPolicy() {
        return threadPolicy.get();
    }

    public String getPolicyNumber() {
        return getPolicy() != null ? getPolicy().getPolicyNumber() : null;
    }

    public String getPolicyName() {
        return getPolicy() != null ? getPolicy().getName() : null;
    }

    public String getPolicyDob() {
        return getPolicy() != null ? getPolicy().getDob() : null;
    }

    public Vid getVidDetails() {
        return threadVid.get();
    }

    public String getVID() {
        return getVidDetails() != null ? getVidDetails().getVid() : null;
    }

    public String getVidPhone() {
        return getVidDetails() != null ? getVidDetails().getPhone() : null;
    }

    public String getVidEmail() {
        return getVidDetails() != null ? getVidDetails().getEmail() : null;
    }

    public Uin getMockUinDetails() {
        return threadMockUin.get();
    }

    public String getMockUIN() {
        return getMockUinDetails() != null ? getMockUinDetails().getUin() : null;
    }

    public String getMockUINPhone() {
        return getMockUinDetails() != null ? getMockUinDetails().getPhone() : null;
    }

    public String getMockUINEmail() {
        return getMockUinDetails() != null ? getMockUinDetails().getEmail() : null;
    }
}