package inji.pages;

import io.appium.java_client.AppiumDriver;
import io.appium.java_client.HidesKeyboard;
import io.appium.java_client.pagefactory.AndroidFindBy;
import io.appium.java_client.pagefactory.iOSXCUITFindBy;
import org.openqa.selenium.WebElement;

import java.time.Duration;

public class MockCertifyLoginPage extends BasePage {

    @iOSXCUITFindBy(iOSClassChain = "**/XCUIElementTypeStaticText[`label == \"“Inji” Wants to Use “mosip.net” to Sign In\"`]")
    private WebElement iosSignInPermissionPopup;

    @iOSXCUITFindBy(accessibility = "Continue")
    private WebElement iosContinueButton;

    @AndroidFindBy(xpath = "//*[contains(@text,'Login with OTP')]")
    @iOSXCUITFindBy(accessibility = "Login with OTP")
    private WebElement esignetLoginButton;

    @AndroidFindBy(xpath = "//*[contains(@text,'Login with e-Signet')]")
    @iOSXCUITFindBy(xpath = "//*[contains(@text,'Login with e-Signet')]")
    private WebElement esignetLoginHeader;

    @AndroidFindBy(xpath = "//*[contains(@text,'Please enter your UIN/VID')]")
    @iOSXCUITFindBy(xpath = "//*[contains(@text,'Please enter your UIN/VID'')]")
    private WebElement enterYourVidTextHeader;

    @AndroidFindBy(uiAutomator = "UiSelector().className(\"android.widget.EditText\").instance(0)")
    @iOSXCUITFindBy(className = "XCUIElementTypeTextField")
    private WebElement enterIdTextBox;

    @AndroidFindBy(xpath = "//android.widget.Button[@text=\"Get OTP\"]")
    @iOSXCUITFindBy(accessibility = "Get OTP")
    private WebElement getOtpButton;


    @AndroidFindBy(uiAutomator = "new UiSelector().className(\"android.widget.Button\").instance(1)")
    @iOSXCUITFindBy(accessibility = "Verify")
    private WebElement verifyButton;

    @AndroidFindBy(xpath = "//*[contains(@text,'OTP has been sent to your registered Mobile Number')]")
    @iOSXCUITFindBy(xpath = "//*[contains(@text,'OTP has been sent to your registered Mobile Number')]")
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


    public MockCertifyLoginPage(AppiumDriver driver) {
        super(driver);
    }

    public boolean isLoadingPageTextLoaded() {
        return this.isElementDisplayed(loadingPageHeader);
    }

    public boolean isSettingUpTextDisplayed() {
        return this.isElementDisplayed(settingUpTextOrDownloadingCredentials);
    }

    public boolean isDownloadingCredentialsTextDisplayed() {
        return this.isElementDisplayed(settingUpTextOrDownloadingCredentials);
    }

    public boolean isOtpHasSendMessageDisplayed() {
        return this.isElementDisplayed(otpSendMessage);
    }

    public boolean isEsignetLoginPageDisplayed() {
        return this.isElementDisplayed(esignetLoginHeader);
    }

    public void clickOnEsignetLoginWithOtpButton() {
		if (isElementDisplayed(continuePopupButton)){
            clickOnElement(continuePopupButton);
        }
        if(isElementDisplayed(esignetLoginButton)) {
            clickOnElement(esignetLoginButton);
        }
    }

    public OtpVerificationPage setEnterIdTextBox(String uinOrVid) {
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
        sendKeysToTextBox(enterIdTextBox, uinOrVid);
        return new OtpVerificationPage(driver);
    }

    public boolean isEnterYourVidTextDisplayed() {
        return this.isElementDisplayed(enterYourVidTextHeader);
    }

    public boolean isProgressingLogoDisplayed() {
        return redirectingPage.isDisplayed();
    }

    public void clickOnGetOtpButton() {
        clickOnElement(getOtpButton);
    }

    public void clickOnVerifyButton() {
        ((HidesKeyboard) driver).hideKeyboard();
        clickOnElement(verifyButton);
    }

    public void clickOnVerifyButtonIos() {
        clickOnElement(verifyButton);
    }

    public String isInvalidOtpMessageDisplayed() {
        return getTextFromLocator(invalidOtpText);
    }

    public boolean  verifyLanguageLoginHeaderTextDisplayed(String language){
        String actualText = getTextFromLocator(loginTextHeader);

        switch (language) {
            case "English":
                boolean isEnglishMatch  = (actualText.equalsIgnoreCase("Login")==true) ? true : false;
                return isEnglishMatch ;
            case "Tamil":
                boolean isTamilMatch  = (actualText.equalsIgnoreCase("eSignet மூலம் உள்நுழையவும்")==true) ? true : false;
                return isTamilMatch ;
            case "Kannada":
                boolean isKannadaMatch  = (actualText.equalsIgnoreCase("ಇಸಿಗ್ನೆಟ್ ಮೂಲಕ ಲಾಗಿನ್ ಮಾಡಿ")==true) ? true : false;
                return isKannadaMatch ;
            case "Hindi":
                boolean isHindiMatch  = (actualText.equalsIgnoreCase("ईसिग्नेट से लॉगिन करें")==true) ? true : false;
                return isHindiMatch ;
            case "HindiIos":
                boolean isHindiMatchIos  = (actualText.equalsIgnoreCase("ईसिग्नेट से लॉगिन करें")==true) ? true : false;
                return isHindiMatchIos ;
            case "Arabic":
                boolean isArabicMatch  = (actualText.equalsIgnoreCase("تسجيل الدخول باستخدام eSignet")==true) ? true : false;
                return isArabicMatch ;
        }
        return false;
    }

    public boolean  verifyLanguagePleaseEnterUinHeaderTextDisplayed(String language){
        String actualText = getTextFromLocator(pleaseEnterUinHeaderText);

        switch (language) {
            case "English":
                boolean isEnglishMatch  = (actualText.equalsIgnoreCase("Please enter your UIN/VID")==true) ? true : false;
                return isEnglishMatch ;
            case "Tamil":
                boolean isTamilMatch  = (actualText.equalsIgnoreCase("உங்கள் UIN/VIDஐ உள்ளிடவும்")==true) ? true : false;
                return isTamilMatch ;
            case "TamilIos":
                boolean isTamilMatchIos  = (actualText.equalsIgnoreCase("உங்கள் UIN/VIDஐ உள்ளிடவும்")==true) ? true : false;
                return isTamilMatchIos ;
            case "Kannada":
                boolean isKannadaMatch  = (actualText.equalsIgnoreCase("ದಯವಿಟ್ಟು ನಿಮ್ಮ UIN/VID ಅನ್ನು ನಮೂದಿಸಿ")==true) ? true : false;
                return isKannadaMatch ;
            case "Hindi":
                boolean isHindiMatch  = (actualText.equalsIgnoreCase("कृपया अपना यूआईएन/वीआईडी \u200B\u200Bदर्ज करें")==true) ? true : false;
                return isHindiMatch ;
            case "HindiIos":
                boolean isHindiMatchIos  = (actualText.equalsIgnoreCase("अपना यूआईएन या वीआईडी \u200B\u200Bदर्ज करें")==true) ? true : false;
                return isHindiMatchIos ;
            case "Arabic":
                boolean isArabicMatch  = (actualText.equalsIgnoreCase("الرجاء إدخال UIN/VID الخاص بك")==true) ? true : false;
                return isArabicMatch ;
        }
        return false;
    }

    public void clickOnCloseButton() {
        clickOnElement(CloseTab);
    }

    public String getText(){
        System.out.println(getTextFromLocator(enterIdTextBox));
        return getTextFromLocator(enterIdTextBox);
    }

    public void clickOnCredentialTypeHeadingMOSIPVerifiableCredential() {
        if (isElementDisplayed(credentialTypeHeadingMOSIPVerifiableCredential)) {
            clickOnElement(credentialTypeHeadingMOSIPVerifiableCredential);
        }
    }

    public String isInvalidIndividualIdTextDisplayed(){
        return getTextFromLocator(invalidIndividualIdText);
    }
}