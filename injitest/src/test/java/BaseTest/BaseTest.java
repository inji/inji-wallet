package BaseTest;


import inji.api.AdminTestUtil;
import inji.api.BaseTestCase;
import inji.utils.FetchErrorMessages;
import io.appium.java_client.AppiumDriver;
import org.testng.annotations.AfterSuite;
import org.testng.annotations.BeforeSuite;
import org.testng.asserts.SoftAssert;

public class BaseTest {
    protected AppiumDriver driver;
    protected SoftAssert softAssert = new SoftAssert();
    @BeforeSuite(alwaysRun = true)
    public void beforeSuite() {
          BaseTestCase.intiateUINGenration();
        try {
            Thread.sleep(9000);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
    }

    @AfterSuite(alwaysRun = true)
    public void afterSuite() {
        AdminTestUtil.deleteInsurance();
    }

}