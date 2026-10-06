package inji.pages;

import inji.constants.PlatformType;
import io.appium.java_client.AppiumDriver;
import io.appium.java_client.pagefactory.AndroidFindBy;
import io.appium.java_client.pagefactory.iOSXCUITFindBy;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.WebElement;


public class RetrieveIdPage extends BasePage {
    @AndroidFindBy(accessibility = "retrieveIdHeader")
    @iOSXCUITFindBy(accessibility = "retrieveIdHeader")
    private WebElement retrieveIdText;

    @AndroidFindBy(uiAutomator = "new UiSelector().textContains(\"Allow\")")
    private WebElement allowButton;

    @AndroidFindBy(xpath = "//android.widget.EditText[@resource-id=\"Otp_mosip-vid\"]")
    @iOSXCUITFindBy(accessibility = "idInputModalIndividualId")
    private WebElement enterIdTextBox;

    @AndroidFindBy(accessibility = "generateVc")
    @iOSXCUITFindBy(accessibility = "generateVc")
    private WebElement generateCardButton;

    @iOSXCUITFindBy(className = "XCUIElementTypePickerWheel")
    private WebElement vidDropDownValueIos;

    @AndroidFindBy(xpath = "//*[contains(@text,'VID')]")
    private WebElement vidDropDownValueAndroid;

    @AndroidFindBy(className = "android.widget.Spinner")
    private WebElement spinnerButton;

    @AndroidFindBy(accessibility = "getItNow")
    @iOSXCUITFindBy(accessibility = "getItNow")
    private WebElement getItNowText;

    @AndroidFindBy(xpath = "//*[contains(@text,'UIN invalid')]")
    private WebElement invalidUin;

    @AndroidFindBy(xpath = "//*[contains(@text,'Please enter valid UIN')]")
    @iOSXCUITFindBy(accessibility = "Please enter valid UIN")
    private WebElement inputFormatErrorMessageUin;

    @AndroidFindBy(xpath = "//*[contains(@text,'Please enter valid VID')]")
    @iOSXCUITFindBy(accessibility = "Please enter valid VID")
    private WebElement inputFormatErrorMessageVid;

    @AndroidFindBy(xpath = "//*[contains(@text,'Please enter valid AID')]")
    @iOSXCUITFindBy(accessibility = "idInputModalIndividualId")
    private WebElement inputFormatErrorMessageAid;

    @AndroidFindBy(xpath = "//*[contains(@text,'AID is not ready yet')]")
    @iOSXCUITFindBy(accessibility = "AID is not ready yet")
    private WebElement aidIsNotReadyYetMessage;

    @AndroidFindBy(xpath = "//*[contains(@text,'Select ID type and enter the MOSIP provided UIN or VID you')]")
    @iOSXCUITFindBy(accessibility = "Select ID type and enter the MOSIP provided UIN or VID you wish to download. In the next step, you will be asked to enter OTP.")
    private WebElement downloadIdGuideMessage;

    @AndroidFindBy(accessibility = "IdInputToolTipInfo")
    private WebElement infoIcon;

    public RetrieveIdPage(AppiumDriver driver) {
        super(driver);
    }

    public boolean isRetrieveIdPageLoaded() {
        return isElementVisible(retrieveIdText, "Verify 'Retrieve ID' page is loaded");
    }

    public boolean isInfoIconDisplayed() {
        return isElementVisible(infoIcon, "Verify info icon is displayed on 'Retrieve ID' page");
    }

    public void clickInfoIcon() {
        click(infoIcon, "Click on info icon");
    }

    public String getRetrieveIdPageHeader() {
        return getText(retrieveIdText, "Get text of 'Retrieve ID' page header");
    }

    public RetrieveIdPage setEnterIdTextBox(String uinOrVid) {
        click(generateCardButton, "Click on 'Generate Card' button before entering ID");
        enterText(enterIdTextBox, uinOrVid, "Enter UIN or VID");
        return this;
    }

    public RetrieveIdPage acceptPermissionPopupBluetooth() {
        click(allowButton, "Click on Bluetooth permission allow button");
        return this;
    }

    public OtpVerificationPage clickOnGenerateCardButton() {
        click(generateCardButton, "Click on 'Generate Card' button");
        return new OtpVerificationPage(driver);
    }

    public GenerateUinOrVidPage clickOnGetItNowText() {
        click(getItNowText, "Click on 'Get it now' text link");
        return new GenerateUinOrVidPage(driver);
    }

    public String verifyGetItTextDisplayed() {
        return getText(getItNowText, "Get text of 'Get it now' link");
    }

    public boolean verifyDownloadIdPageGuideMessage() {
        return isElementVisible(downloadIdGuideMessage, "Verify guide message for downloading ID is visible");
    }

    public boolean isInvalidUinMassageLoaded() {
        return isElementVisible(invalidUin, "Verify 'Invalid UIN' error message is displayed");
    }

    public boolean isAidIsNotReadyYetErrorDisplayed() {
        return isElementVisible(aidIsNotReadyYetMessage, "Verify 'AID is not ready yet' error is displayed");
    }

    public RetrieveIdPage clickOnVid(PlatformType os) {
        final int maxRetries = 3;

        if (os == PlatformType.ANDROID) {
            click(spinnerButton, "Click on ID type dropdown");
            for (int i = 0; i < maxRetries; i++) {
                try {
                    click(vidDropDownValueAndroid, "Select VID from dropdown (Android)");
                    break;
                } catch (StaleElementReferenceException e) {
                    if (i == maxRetries - 1) {
                        throw new RuntimeException("Failed to click on VID dropdown after retries", e);
                    }
                }
            }
        } else if (os == PlatformType.IOS) {
            try {
                enterText(vidDropDownValueIos, "VID", "Enter VID into dropdown (iOS)");
            } catch (StaleElementReferenceException e) {
                throw new RuntimeException("Failed to enter VID on iOS due to stale element", e);
            }
        }

        return this;
    }

    public boolean isIncorrectInputFormatErrorUinMessageDisplayed() {
        return isElementVisible(inputFormatErrorMessageUin, "Verify incorrect input format error for UIN is displayed");
    }

    public boolean isIncorrectInputFormatErrorVidMessageDisplayed() {
        return isElementVisible(inputFormatErrorMessageVid, "Verify incorrect input format error for VID is displayed");
    }

    public boolean isIncorrectInputFormatErrorAidMessageDisplayed() {
        return isElementVisible(inputFormatErrorMessageAid, "Verify incorrect input format error for AID is displayed");
    }
}