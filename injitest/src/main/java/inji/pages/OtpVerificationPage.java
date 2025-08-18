package inji.pages;

import inji.constants.PlatformType;
import io.appium.java_client.AppiumDriver;
import io.appium.java_client.pagefactory.AndroidFindBy;
import io.appium.java_client.pagefactory.iOSXCUITFindBy;
import org.openqa.selenium.WebElement;

public class OtpVerificationPage extends BasePage {

    @AndroidFindBy(accessibility = "otpVerificationHeader")
    @iOSXCUITFindBy(accessibility = "otpVerificationHeader")
    private WebElement otpVerificationText;

    @AndroidFindBy(accessibility = "otpVerificationDescription")
    @iOSXCUITFindBy(accessibility = "otpVerificationDescription")
    private WebElement otpVerificationDescription;

    @AndroidFindBy(accessibility = "otpVerificationError")
    @iOSXCUITFindBy(accessibility = "otpVerificationError")
    private WebElement invalidOtpMessage;

    @AndroidFindBy(accessibility = "walletBindingErrorTitle")
    @iOSXCUITFindBy(accessibility = "walletBindingErrorTitle")
    private WebElement invalidOtpMessageInVcActivation;

    @AndroidFindBy(xpath = "//*[@text=\"Cancel\"]")
    @iOSXCUITFindBy(accessibility = "cancel")
    private WebElement cancelButton;

    @AndroidFindBy(accessibility = "close")
    @iOSXCUITFindBy(accessibility = "close")
    private WebElement crossIcon;

    @AndroidFindBy(accessibility = "cancel")
    @iOSXCUITFindBy(accessibility = "cancel")
    private WebElement cancelPopupButton;

    @AndroidFindBy(accessibility = "otpVerificationTimer")
    @iOSXCUITFindBy(accessibility = "otpVerificationTimer")
    private WebElement otpVerificationTimer;

    @AndroidFindBy(accessibility = "confirmationPopupHeader")
    @iOSXCUITFindBy(accessibility = "confirmationPopupHeader")
    private WebElement confirmationPopupHeader;

    @AndroidFindBy(uiAutomator = "new UiSelector().textContains(\"VID not available in database\")")
    @iOSXCUITFindBy(iOSClassChain = "**/XCUIElementTypeStaticText[`label == \"VID not available in database\"`]")
    private WebElement vidNotAvailableMessage;

    @AndroidFindBy(xpath = "//*[@resource-id=\"resendCodeView\"]")
    //Not using accessibility id as parent component has correct element property
    @iOSXCUITFindBy(accessibility = "resendCode")
    private WebElement resendCodeButton;

    @AndroidFindBy(accessibility = "resendCode")
    private WebElement resendCode;

    @AndroidFindBy(accessibility = "wait")
    @iOSXCUITFindBy(accessibility = "wait")
    private WebElement waitPopupButton;

    @AndroidFindBy(xpath = "//android.widget.TextView[@resource-id=\"error-banner-message\"]")
    @iOSXCUITFindBy(accessibility = "Please enter valid OTP.")
    private WebElement invalidOtpMessageForeSignet;

    @AndroidFindBy(xpath = "//android.widget.Button[@text=\"Get OTP\"]")
    @iOSXCUITFindBy(accessibility = "Get OTP")
    private WebElement getOtpButton;

    public OtpVerificationPage(AppiumDriver driver) {
        super(driver);
    }

    public boolean isOtpVerificationPageLoaded() {
        return isElementVisible(otpVerificationText, "Verify OTP Verification page is loaded");
    }

    public HomePage enterOtp(String otp, PlatformType os) {
        SetPasscode setPasscode = new SetPasscode(driver);
        setPasscode.enterPasscode(otp, os);
        return new HomePage(driver);
    }

    public HomePage enterOtpForeSignet(String otp, PlatformType os) {
        SetPasscode setPasscode = new SetPasscode(driver);
        setPasscode.enterPasscodeForEsignet(otp, os);
        return new HomePage(driver);
    }

    public HomePage enterOtpFor(String otp, PlatformType os) {
        SetPasscode setPasscode = new SetPasscode(driver);
        setPasscode.enterPasscodeotp(otp, os);
        return new HomePage(driver);
    }

    public boolean invalidOtpMessageDisplayed() {
        return isElementVisible(invalidOtpMessage, "Verify invalid OTP message is displayed");
    }

    public String getInvalidOtpMessageForEsignet() {
        return getText(invalidOtpMessageForeSignet, "Getting the invalid OTP message for ESignet Login");
    }

    public boolean somethingWetWrongInVcActivationDisplayed() {
        return isElementVisible(invalidOtpMessageInVcActivation, "Verify VC activation error message is displayed");
    }

    public boolean isCancelButtonDisplayed() {
        return isElementVisible(cancelButton, "Verify Cancel button is displayed");
    }

    public MoreOptionsPage clickOnCancelButton() {
        click(cancelButton, "Click on Cancel button");
        return new MoreOptionsPage(driver);
    }

    public void clickOnCrossIcon() {
        click(crossIcon, "Click on Cross icon");
    }

    public void clickOnCancelPopupButton() {
        click(cancelPopupButton, "Click on Cancel in confirmation popup");
    }

    public boolean vidNotAvailableDisplayed() {
        return isElementVisible(vidNotAvailableMessage, "Verify VID not available message is displayed");
    }

    public boolean verifyResendCodeButtonDisplayedEnabled() {
        return isElementEnabled(resendCodeButton, "Verify Resend Code button is displayed and enabled");
    }

    public void clickOnResendButton() {
        click(resendCode, "Click on Resend Code button");
    }

    public boolean confirmPopupHeaderDisplayed() {
        return isElementVisible(confirmationPopupHeader, "Verify confirmation popup header is displayed");
    }

    public void WaitingTimeForVerificationTimerComplete() {
        waitUntilElementIsInvisible(otpVerificationTimer, 186, "Wait for OTP verification timer to disappear");
    }

    public boolean verifyOtpVerificationTimerDisplayedAfterClickOnResend() {
        return isElementVisible(otpVerificationTimer, "Verify OTP verification timer is displayed after clicking Resend");
    }

    public boolean verifyOtpVerificationDescriptionDisplayed() {
        return isElementVisible(otpVerificationDescription, "Verify OTP verification description is displayed");
    }

    public void clickOnGetOtpButton() {
        click(getOtpButton, "Click on get OTP");
    }
}