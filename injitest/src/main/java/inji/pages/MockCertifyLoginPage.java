package inji.pages;

import io.appium.java_client.AppiumDriver;
import io.appium.java_client.HidesKeyboard;
import io.appium.java_client.pagefactory.AndroidFindBy;
import io.appium.java_client.pagefactory.iOSXCUITFindBy;
import org.openqa.selenium.WebElement;

import java.util.HashMap;
import java.util.Map;

public class MockCertifyLoginPage extends BasePage {

    @iOSXCUITFindBy(iOSClassChain = "**/XCUIElementTypeStaticText[`label == \"“Inji” Wants to Use “mosip.net” to Sign In\"`]")
    private WebElement iosSignInPermissionPopup;

    @iOSXCUITFindBy(accessibility = "Continue")
    private WebElement iosContinueButton;

    @AndroidFindBy(xpath = "//android.widget.TextView[@text=\"Login with OTP\"]")
    @iOSXCUITFindBy(accessibility = "Login with OTP")
    private WebElement esignetLoginButton;

    @AndroidFindBy(xpath = "//*[contains(@text,'Login with e-Signet')]")
    @iOSXCUITFindBy(xpath = "//*[contains(@text,'Login with e-Signet')]")
    private WebElement esignetLoginHeader;

    @AndroidFindBy(xpath = "//android.widget.EditText[@resource-id=\"Otp_vid\"]")
    @iOSXCUITFindBy(xpath = "//*[contains(@text,'Please enter your UIN/VID'')]")
    private WebElement enterYourVidTextHeader;

    @AndroidFindBy(uiAutomator = "UiSelector().className(\"android.widget.EditText\").instance(0)")
    @iOSXCUITFindBy(xpath = "//XCUIElementTypeTextField[@value=\"Enter UIN/VID\"]")
    private WebElement enterIdTextBox;

    @AndroidFindBy(xpath = "//android.widget.Button[@text=\"Get OTP\"]")
    @iOSXCUITFindBy(accessibility = "Get OTP")
    private WebElement getOtpButton;


    @AndroidFindBy(xpath = "//android.widget.Button[@resource-id=\"verify_otp\"]")
    @iOSXCUITFindBy(accessibility = "Verify")
    private WebElement verifyButton;

    @AndroidFindBy(xpath = "//*[contains(@text,'Please enter the 6-digit OTP sent to')]")
    @iOSXCUITFindBy(xpath = "//*[contains(@text,'Please enter the 6-digit OTP sent to')]")
    private WebElement otpSendMessage;

    @AndroidFindBy(className = "android.view.ViewGroup")
    private WebElement redirectingPage;

    @AndroidFindBy(accessibility = "progressingLogo")
    private WebElement progressingLogo;

    @AndroidFindBy(accessibility = "loaderTitle")
    private WebElement loadingPageHeader;

    @iOSXCUITFindBy(accessibility = "Done")
    private WebElement DoneButton;

    @AndroidFindBy(accessibility = "loaderSubTitle")
    private WebElement settingUpTextOrDownloadingCredentials;

    @AndroidFindBy(xpath = "//android.widget.TextView[@resource-id=\"error-banner-message\"]")
    @iOSXCUITFindBy(accessibility = "OTP authentication failed. Please try again.")
    private WebElement invalidOtpText;

    @AndroidFindBy(uiAutomator = "UiSelector().className(\"android.widget.TextView\").instance(1)")
    @iOSXCUITFindBy(xpath = "(//XCUIElementTypeStaticText)[5]")
    private WebElement loginTextHeader;

    @AndroidFindBy(uiAutomator = "UiSelector().className(\"android.widget.TextView\").instance(2)")
    @iOSXCUITFindBy(xpath = "(//XCUIElementTypeStaticText)[6]")
    private WebElement pleaseEnterUinHeaderText;

    @AndroidFindBy(uiAutomator = "UiSelector().className(\"android.widget.TextView\").instance(5)")
    @iOSXCUITFindBy(xpath = "(//XCUIElementTypeStaticText)[9]")
    private WebElement dontHaveAccountText;

    @AndroidFindBy(uiAutomator = "UiSelector().className(\"android.widget.TextView\").instance(6)")
    @iOSXCUITFindBy(xpath = "(//XCUIElementTypeStaticText)[10]")
    private WebElement signUpwithUnifiedLoginText;

    @AndroidFindBy(accessibility = "Close tab")
    @iOSXCUITFindBy(xpath = "//XCUIElementTypeButton[@name=\"Cancel\"]")
    private WebElement CloseTab;

    @AndroidFindBy(accessibility = "credentialTypeHeading-MOSIPVerifiableCredential")
    @iOSXCUITFindBy(accessibility = "credentialTypeHeading-MOSIPVerifiableCredential")
    private WebElement credentialTypeHeadingMOSIPVerifiableCredential;

    @AndroidFindBy(xpath = "//android.widget.TextView[@resource-id=\"error-banner-message\"]")
    @iOSXCUITFindBy(accessibility = "Invalid Individual ID")
    private WebElement invalidIndividualIdText;

    @AndroidFindBy(xpath = "//*[contains(@text,'CONTINUE')]")
    @iOSXCUITFindBy(xpath = "//*[contains(@text,'CONTINUE')]")
    private WebElement continuePopupButton;

    @AndroidFindBy(accessibility = "tryAgain")
    @iOSXCUITFindBy(accessibility = "tryAgain")
    private WebElement retryButton;

    @AndroidFindBy(xpath = "//*[@text=\"Network request failed\"]")
    @iOSXCUITFindBy(accessibility = "getIdButton")
    private WebElement networkErrorMesseage;


    public MockCertifyLoginPage(AppiumDriver driver) {
        super(driver);
    }

    public boolean isLoadingPageTextLoaded() {
        return isElementVisible(loadingPageHeader, "Checking if the Loading page header is displayed");
    }

    public boolean isSettingUpTextDisplayed() {
        return isElementVisible(settingUpTextOrDownloadingCredentials, "Checking if 'Setting up' text is displayed");
    }

    public boolean isDownloadingCredentialsTextDisplayed() {
        return isElementVisible(settingUpTextOrDownloadingCredentials, "Checking if 'Downloading credentials' text is displayed");
    }

    public boolean isOtpHasSendMessageDisplayed() {
        return isElementVisible(otpSendMessage, "Checking if OTP sent message is displayed");
    }

    public boolean isEsignetLoginPageDisplayed() {
        return isElementVisible(esignetLoginHeader, "Checking if Esignet login page header is displayed");
    }

    public void clickOnEsignetLoginWithOtpButton() {
        click(continuePopupButton, "Clicking on Continue button in popup");
        click(esignetLoginButton, "Clicking on Esignet Login with OTP button");
    }

    public OtpVerificationPage setEnterIdTextBox(String uinOrVid) {
        if ("iOS".equalsIgnoreCase(driver.getCapabilities().getCapability("platformName").toString())) {
            click(enterIdTextBox, "Click on Enter ID textbox to enter UIN or VID"); // Needed for iOS before typing
        }
        enterText(enterIdTextBox, uinOrVid, "Entering UIN or VID in the input textbox: " + uinOrVid);
        return new OtpVerificationPage(driver);
    }

    public boolean isEnterYourVidTextDisplayed() {
        return isElementVisible(enterYourVidTextHeader, "Checking if 'Enter your VID' text is displayed");
    }

    public boolean isProgressingLogoDisplayed() {
        return redirectingPage.isDisplayed(); // Consider replacing with isElementVisible() for consistency
    }

    public void clickOnGetOtpButton() {
        try {
            ((HidesKeyboard) driver).hideKeyboard();
        } catch (Exception e) {
            logger.info("Keyboard not hidden automatically, ignoring: " + e.getMessage());
        }
        click(getOtpButton, "Clicking on Get OTP button");
    }

    public void clickOnVerifyButton() {
        try {
            ((HidesKeyboard) driver).hideKeyboard();
        } catch (Exception e) {
            logger.info("Keyboard not hidden automatically, ignoring: " + e.getMessage());
        }
        click(verifyButton, "Clicking on Verify button after hiding keyboard");
    }

    public void clickOnVerifyButtonIos() {
        click(verifyButton, "Clicking on Verify button (iOS specific)");
    }

    public String getInvalidOtpMessage() {
        return getText(invalidOtpText, "Fetching the error message for 'Invalid OTP'");
    }
    private static final Map<String, Map<String, String>> LANGUAGE_TEXT_MAP = new HashMap<>();

    static {
        Map<String, String> loginHeaderTitle = new HashMap<>();
        loginHeaderTitle.put("English", "Login");
        loginHeaderTitle.put("Tamil", "eSignet மூலம் உள்நுழையவும்");
        loginHeaderTitle.put("Kannada", "ಇಸಿಗ್ನೆಟ್ ಮೂಲಕ ಲಾಗಿನ್ ಮಾಡಿ");
        loginHeaderTitle.put("Hindi", "ईसिग्नेट से लॉगिन करें");
        loginHeaderTitle.put("HindiIos", "ईसिग्नेट से लॉगिन करें");
        loginHeaderTitle.put("Arabic", "تسجيل الدخول باستخدام eSignet");
        LANGUAGE_TEXT_MAP.put("LoginHeaderTitle", loginHeaderTitle);

        Map<String, String> pleaseEnterUIN = new HashMap<>();
        pleaseEnterUIN.put("English", "Please enter your UIN/VID");
        pleaseEnterUIN.put("Tamil", "உங்கள் UIN/VIDஐ உள்ளிடவும்");
        pleaseEnterUIN.put("TamilIos", "உங்கள் UIN/VIDஐ உள்ளிடவும்");
        pleaseEnterUIN.put("Kannada", "ದಯವಿಟ್ಟು ನಿಮ್ಮ UIN/VID ಅನ್ನು ನಮೂದಿಸಿ");
        pleaseEnterUIN.put("Hindi", "कृपया अपना यूआईएन/वीआईडी \u200B\u200Bदर्ज करें");
        pleaseEnterUIN.put("HindiIos", "अपना यूआईएन या वीआईडी \u200B\u200Bदर्ज करें");
        pleaseEnterUIN.put("Arabic", "الرجاء إدخال UIN/VID الخاص بك");
        LANGUAGE_TEXT_MAP.put("PleaseEnterUIN", pleaseEnterUIN);
    }

    public boolean verifyLanguageText(String key, String language, String actualText) {
        Map<String, String> languageMap = LANGUAGE_TEXT_MAP.get(key);
        if (languageMap == null) return false;

        String expectedText = languageMap.get(language);
        if (expectedText == null) return false;

        return actualText.equalsIgnoreCase(expectedText);
    }

    public boolean verifyLoginHeaderTitle(String language) {
        return verifyLanguageText("LoginHeaderTitle", language, getText(loginTextHeader));
    }

    public boolean verifyPleaseEnterUinHeader(String language) {
        return verifyLanguageText("PleaseEnterUIN", language, getText(pleaseEnterUinHeaderText));
    }

    public void clickOnCloseButton() {
        click(CloseTab, "Clicking on Close tab button");
    }

    public String getText() {
        return getText(enterIdTextBox, "Getting text from the UIN/VID input box");
    }

    public void clickOnCredentialTypeHeadingMOSIPVerifiableCredential() {
        click(credentialTypeHeadingMOSIPVerifiableCredential, "Clicking on 'MOSIP Verifiable Credential' credential type heading");
    }

    public String getInvalidIndividualIdMessage() {
        return getText(invalidIndividualIdText, "Getting the error message for 'Invalid Individual ID'");
    }

    public boolean isNoInternetErrorDisplayed() {
        return isElementVisible(networkErrorMesseage, "Checking if 'Network Request Failed' message is displayed");
    }

    public boolean isRetryButtonDisplayed() {
        if (isElementVisible(retryButton, "Check if Retry button is displayed")) {
            click(retryButton, "Click on Retry button");
            return true;
        }
        return false;
    }
    public boolean isInvalidOtpErrorTextDisplay() {
        return isElementVisible(invalidOtpText, "Checking if invalid otp error message is displayed");
    }
}