package inji.pages;

import inji.constants.PlatformType;
import io.appium.java_client.AppiumDriver;
import io.appium.java_client.pagefactory.AndroidFindBy;
import io.appium.java_client.pagefactory.iOSXCUITFindBy;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import java.util.List;

public class HistoryPage extends BasePage {
    @AndroidFindBy(xpath = "//*[contains(@text,'History')]")
    @iOSXCUITFindBy(iOSClassChain = "**/XCUIElementTypeOther[`name == \"History\"`][5]")
    private WebElement historyHeader;

    @AndroidFindBy(accessibility = "noHistory")
    @iOSXCUITFindBy(accessibility = "noHistory")
    private WebElement noHistoryAvailable;

    @AndroidFindBy(className = "android.widget.TextView")
    @iOSXCUITFindBy(className = "android.widget.TextView")
    private WebElement activityLogHeader;

    @iOSXCUITFindBy(accessibility = "Mobile Driving License is downloaded.")
    private WebElement mdlHistoryMessage;

    public HistoryPage(AppiumDriver driver) {
        super(driver);
    }

    public String getUinInActivityLogHeader() {
        return getText(activityLogHeader);
    }

    public boolean isHistoryPageLoaded() {
        return isElementVisible(historyHeader, "Checking if History page header is displayed");
    }

    private boolean verifyHistoryIos(String vcNumber) {
        By locator = By.xpath("//*[contains(@name,'National ID is downloaded.')]");
        return isElementVisible(locator, "Verifying downloaded National ID history record on iOS");
    }

    private boolean verifyHistoryAndroid(String vcNumber) {
        By locator = By.xpath("//*[contains(@text,'National ID is downloaded.')]");
        return isElementVisible(locator, "Verifying downloaded National ID history record on Android");
    }

    private boolean verifyHistoryAndroidforInsuranceCard(String vcNumber) {
        By locator = By.xpath("//*[contains(@text,'Health Insurance is downloaded.')]");
        return isElementVisible(locator, "Verifying downloaded Health Insurance record on Android");
    }

    private boolean verifyHistoryAndroidformdl() {
        By locator = By.xpath("//*[contains(@text,'Mobile Driving License is downloaded.')]");
        return isElementVisible(locator, "Verifying downloaded mDL history record on Android");
    }

    private boolean verifyHistoryAndroidforMock() {
        By locator = By.xpath("//*[@name=\"Mock Verifiable Credential is downloaded.\"]");
        return isElementVisible(locator, "Verifying downloaded Mock VC history record on Android");
    }

    private boolean verifyHistoryIosMock() {
        By locator = By.xpath("//*[@name=\"Mock Verifiable Credential is downloaded.\"]");
        return isElementVisible(locator, "Verifying downloaded Mock VC history record on iOS");
    }

    private boolean verifyHistoryIosmdl() {
        By locator = By.xpath("//XCUIElementTypeStaticText[@name=\"Mobile Driving License is downloaded.\"]");
        return isElementVisible(locator, "Verifying downloaded mDL history record on iOS");
    }

    private boolean verifyHistoryIosInsuranceCard(String vcNumber) {
        By locator = By.xpath("//*[@name=\"Health Insurance is downloaded.\"]");
        return isElementVisible(locator, "Verifying downloaded Health Insurance record on iOS");
    }

    private boolean verifyActivityHeaderAndroid(String vcNumber) {
        return verifyHistoryAndroid(vcNumber);
    }

    private boolean verifyDeleteHistoryAndroid(String vcNumber) {
        By locator = By.xpath("//*[contains(@text,'MOSIP National ID is removed from wallet.')]");
        return isElementVisible(locator, "Verifying deleted MOSIP National ID history on Android");
    }

    private boolean verifyDeletedHistoryIos(String vcNumber) {
        By locator = By.xpath("//*[contains(@name,'MOSIP National ID is removed from wallet.')]");
        return isElementVisible(locator, "Verifying deleted MOSIP National ID history on iOS");
    }

    private boolean verifyDeleteHistoryAndroidInsuranceCard(String vcNumber) {
        By locator = By.xpath("//*[contains(@text,'Health Insurance is removed from wallet.')]");
        return isElementVisible(locator, "Verifying deleted Health Insurance record on Android");
    }

    private boolean verifyDeletedHistoryIosInsuranceCard(String vcNumber) {
        By locator = By.xpath("//*[contains(@name,'Health Insurance is removed from wallet.')]");
        return isElementVisible(locator, "Verifying deleted Health Insurance record on iOS");
    }

    private int verifyNumberOfRecordsInHistoryAndroid(String vcNumber) throws InterruptedException {
        By locator = By.xpath("//*[contains(@text,'is downloaded.')]");
        List<WebElement> elements = driver.findElements(locator);
        return elements.size();
    }

    private int verifyNumberOfRecordsInHistoryIos(String vcNumber) {
        By locator = By.xpath("//XCUIElementTypeStaticText[@name=\"National ID is downloaded.\"]");
        List<WebElement> elements = driver.findElements(locator);
        return elements.size();
    }

    public boolean verifyHistory(String vcNumber, PlatformType os) {
        return switch (os) {
            case ANDROID -> verifyHistoryAndroid(vcNumber);
            case IOS -> verifyHistoryIos(vcNumber);
        };
    }

    public boolean verifyHistory(PlatformType os) {
        return switch (os) {
            case ANDROID -> verifyHistoryAndroidformdl();
            case IOS -> verifyHistoryIosmdl();
        };
    }

    public boolean verifyHistoryForMock(PlatformType os) {
        return switch (os) {
            case ANDROID -> verifyHistoryAndroidforMock();
            case IOS -> verifyHistoryIosMock();
        };
    }

    public boolean verifyHistoryForInsuranceCard(String vcNumber, PlatformType os) {
        return switch (os) {
            case ANDROID -> verifyHistoryAndroidforInsuranceCard(vcNumber);
            case IOS -> verifyHistoryIosInsuranceCard(vcNumber);
        };
    }

    public boolean verifyActivityLogHeader(String vcNumber, PlatformType os) {
        return switch (os) {
            case ANDROID -> verifyActivityHeaderAndroid(vcNumber);
            default -> false;
        };
    }

    public int getNumberOfRecordsInHistory(String vcNumber, PlatformType os) throws InterruptedException {
        return switch (os) {
            case ANDROID -> verifyNumberOfRecordsInHistoryAndroid(vcNumber);
            case IOS -> verifyNumberOfRecordsInHistoryIos(vcNumber);
            default -> 0;
        };
    }

    public boolean noHistoryAvailable() {
        return isElementVisible(noHistoryAvailable, "Verifying 'No History Available' message");
    }

    public boolean verifyDeleteHistory(String vcNumber, PlatformType os) {
        return switch (os) {
            case ANDROID -> verifyDeleteHistoryAndroid(vcNumber);
            case IOS -> verifyDeletedHistoryIos(vcNumber);
        };
    }

    public boolean verifyDeleteHistoryInsuranceCard(String vcNumber, PlatformType os) {
        return switch (os) {
            case ANDROID -> verifyDeleteHistoryAndroidInsuranceCard(vcNumber);
            case IOS -> verifyDeletedHistoryIosInsuranceCard(vcNumber);
        };
    }

    public boolean verifyActivationFailedRecordInHistory(String vcNumber, PlatformType os) {
        return switch (os) {
            case ANDROID -> verifyActivationFailedRecordAndroid(vcNumber);
            case IOS -> verifyActivationFailedRecordIos(vcNumber);
        };
    }

    private boolean verifyActivationFailedRecordIos(String vcNumber) {
        By locator = By.xpath("//*[contains(@name,'National ID has failed.')]");
        return isElementVisible(locator, "Verifying failed activation record of National ID on iOS");
    }

    private boolean verifyActivationFailedRecordAndroid(String vcNumber) {
        By locator = By.xpath("//*[contains(@text,'National ID has failed.')]");
        return isElementVisible(locator, "Verifying failed activation record of National ID on Android");
    }

    public boolean verifyActivationSuccessfulRecordInHistory(String vcNumber, PlatformType os) {
        return switch (os) {
            case ANDROID -> verifyActivationSuccessfulRecordAndroid(vcNumber);
            case IOS -> verifyActivationSuccessfulRecordIos(vcNumber);
        };
    }

    private boolean verifyActivationSuccessfulRecordIos(String vcNumber) {
        By locator = By.xpath("//*[contains(@name,'Activation of MOSIP National ID is successful.')]");
        return isElementVisible(locator, "Verifying successful activation of National ID on iOS");
    }

    private boolean verifyActivationSuccessfulRecordAndroid(String vcNumber) {
        By locator = By.xpath("//*[contains(@text,'Activation of MOSIP National ID is successful.')]");
        return isElementVisible(locator, "Verifying successful activation of National ID on Android");
    }
}