package inji.pages;

import com.aventstack.extentreports.Status;
import inji.utils.ExtentReportManager;
import io.appium.java_client.AppiumDriver;
import io.appium.java_client.pagefactory.AndroidFindBy;
import io.appium.java_client.pagefactory.iOSXCUITFindBy;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class AboutInjiPage extends BasePage {
    @AndroidFindBy(accessibility = "aboutInji")
    @iOSXCUITFindBy(accessibility = "aboutInji")
    private WebElement aboutInjiHeader;

    @AndroidFindBy(accessibility = "CopyText")
    @iOSXCUITFindBy(accessibility = "CopyText")
    private WebElement copy;

    @AndroidFindBy(accessibility = "CopiedText")
    @iOSXCUITFindBy(accessibility = "CopiedText")
    private WebElement copied;

    @AndroidFindBy(accessibility = "arrowLeft")
    @iOSXCUITFindBy(accessibility = "arrowLeft")
    private WebElement backButton;

    @AndroidFindBy(accessibility = "clickHere")
    @iOSXCUITFindBy(accessibility = "clickHere")
    public WebElement clickHereButton;


    @AndroidFindBy(xpath = "(//android.widget.TextView)[5]")
    @iOSXCUITFindBy(xpath = "(//XCUIElementTypeStaticText)[4]")
    public WebElement appID;

    @AndroidFindBy(xpath = "(//android.widget.TextView)[13]")
    @iOSXCUITFindBy(xpath = "(//XCUIElementTypeStaticText)[12]")
    public WebElement tuvaliVesion;

    public AboutInjiPage(AppiumDriver driver) {
        super(driver);
    }

    public boolean isAppIdVisible() {
        String appId = getText(appID, "Fetch App ID text");
        return appId.length() == 15;
    }

    public boolean isTuvaliVesionVisible() {
        String tuvaliVersion = getText(tuvaliVesion, "Fetch Tuvali version text");
        return tuvaliVersion.contains("0.5.0");
    }

    public boolean isAboutInjiHeaderDisplayed() {
        return isElementVisible(aboutInjiHeader, "Check if 'About Inji' header is visible");
    }

    public String getAboutInjiHeader() {
        return getText(aboutInjiHeader, "Get 'About Inji' header text");
    }

    public boolean isAppIdCopiedTextDisplayed() {
        return isElementVisible(copied, "Check if 'App ID Copied' text is visible");
    }

    public boolean isCopyTextDisplayed() {
        return isElementVisible(copy, "Check if 'Copy' text is visible");
    }

    public boolean isMosipUrlDisplayedInChrome() {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        try {
            ExtentReportManager.getTest().log(Status.INFO, "Verifying whether the URL reached the browser");
            return wait.until(driver -> driver.getPageSource().toLowerCase().contains("inji"));
        } catch (Exception e) {
            return false;
        }
    }

    public void clickOnCopyText() {
        click(copy, "Click on 'Copy' text/button");
    }

    public void clickOnBackButton() {
        click(copy, "Click on 'Back' button");
    }

    public void clickOnClickHereButton() {
        click(clickHereButton, "Click on 'Click Here' button");
    }

}
