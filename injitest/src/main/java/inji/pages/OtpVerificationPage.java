package inji.pages;

import inji.constants.Target;
import io.appium.java_client.AppiumDriver;
import io.appium.java_client.HidesKeyboard;
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
    @iOSXCUITFindBy(accessibility = "OTP is invalid")
    private WebElement invalidOtpMessageforEsignet;

    public OtpVerificationPage(AppiumDriver driver) {
        super(driver);
    }

    public boolean isOtpVerificationPageLoaded() {
        return this.isElementDisplayed(otpVerificationText);
    }

    public HomePage enterOtp(String otp, Target os) {
        SetPasscode setPasscode = new SetPasscode(driver);
        setPasscode.enterPasscode(otp, os);
        return new HomePage(driver);
    }

    public HomePage enterOtpForEsignet(String otp, Target os) {
        SetPasscode setPasscode = new SetPasscode(driver);
        setPasscode.enterPasscodeForEsignet(otp, os);
        return new HomePage(driver);
    }

    public boolean invalidOtpMessageDisplayed() {
        return this.isElementDisplayed(invalidOtpMessage);
    }

    public String invalidOtpMessageForEsignetDisplayed() {
        return getTextFromLocator(invalidOtpMessageforEsignet);
    }

    public boolean somethingWetWrongInVcActivationDisplayed() {
        return this.isElementDisplayed(invalidOtpMessageInVcActivation);
    }

    public boolean isCancelButtonDisplayed() {
        return this.isElementDisplayed(cancelButton);
    }

    public MoreOptionsPage clickOnCancelButton() {
        clickOnElement(cancelButton);
        return new MoreOptionsPage(driver);
    }

    public void clickOnCrossIcon() {
        clickOnElement(crossIcon);
    }

    public void clickOnCancelPopupButton() {
        clickOnElement(cancelPopupButton);
    }

    public boolean vidNotAvailableDisplayed() {
        return this.isElementDisplayed(vidNotAvailableMessage);
    }

    public boolean verifyResendCodeButtonDisplayedEnabled() {
        return this.isElementEnabled(resendCodeButton,30);
    }

    public void clickOnResendButton() {
        if(isElementEnabled(resendCodeButton,30)) {
//            ((HidesKeyboard) driver).hideKeyboard();
            clickOnElement(resendCode);
        }
    }

    public boolean confirmPopupHeaderDisplayed() {
        return this.isElementDisplayed(confirmationPopupHeader);
    }

    public void WatingTimeForVerificationTimerComplete() {
        this.WaitTillElementVisible(otpVerificationTimer, 186);
    }

    public boolean verifyOtpVerificationTimerDisplayedAfterClickOnResend() {
        return this.isElementDisplayed(otpVerificationTimer);
    }

    public boolean verifyotpVerificationDescriptionDisplayed() {
        return this.isElementDisplayed(otpVerificationDescription);
    }
}