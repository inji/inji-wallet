package inji.pages;

import inji.utils.IosUtil;
import io.appium.java_client.AppiumDriver;
import io.appium.java_client.pagefactory.AndroidFindBy;
import io.appium.java_client.pagefactory.iOSXCUITFindBy;

import org.openqa.selenium.WebElement;

import java.time.LocalDate;
import java.time.Month;

public class SunbirdLoginPage extends BasePage {
    LocalDate currentDate = LocalDate.now();
    Month currentMonth = currentDate.getMonth();
    @AndroidFindBy(xpath = "//*[contains(@text,'Login with KBA')]")
    private WebElement loginWithKBA;

    @AndroidFindBy(xpath = "//*[@resource-id=\"_form_policyNumber\"]")
    @iOSXCUITFindBy(xpath = "//XCUIElementTypeTextField[@name=\"Please fill in this field\" and @value=\"Policy Number\"]")
    private WebElement enterPolicyTextBox;

    @AndroidFindBy(xpath = "//android.widget.EditText[@resource-id=\"_form_fullName\"]")
    @iOSXCUITFindBy(iOSClassChain = "**/XCUIElementTypeTextField[`name == \"Please fill in this field\"`][2]")
    private WebElement enterFullnameTextBox;

    @AndroidFindBy(uiAutomator = "UiSelector().className(\"android.widget.Spinner\")")
    @iOSXCUITFindBy(iOSClassChain = "**/XCUIElementTypeOther[`name == \"Please fill in this field\"`]")
    private WebElement enterDateOfBirthTextBox;

    @iOSXCUITFindBy(xpath = "//XCUIElementTypePickerWheel[@value=\"2025\"]")
    private WebElement iosCalenderWheel;

    @AndroidFindBy(xpath = "//android.widget.Button[@resource-id=\"android:id/button1\"]")
    @iOSXCUITFindBy(accessibility = "Done")
    private WebElement clickOnSetButton;

    @AndroidFindBy(xpath = "//android.view.View[@content-desc='01 January 2024']")
    @iOSXCUITFindBy(xpath = "//XCUIElementTypeButton[@name=\"Monday, January 1\"]")
    private WebElement dateOfBirth;

    @iOSXCUITFindBy(xpath = "//XCUIElementTypeCollectionView//XCUIElementTypeButton[@name=\"Monday, 1 January\"]")
    private WebElement dateOfBirthSecond;
    @iOSXCUITFindBy(xpath = "//XCUIElementTypeStaticText[@name=\"January 2025\"]")
    private WebElement January2025;

    @AndroidFindBy(xpath = "//android.widget.Button[@resource-id=\"verify_form\"]")
    @iOSXCUITFindBy(iOSClassChain = "**/XCUIElementTypeButton[`name == \"Login\"`]")
    private WebElement loginButton;

    @AndroidFindBy(xpath = "//android.widget.Button[@text=\"Login\"]")
    @iOSXCUITFindBy(iOSClassChain = "**/XCUIElementTypeButton[`name == \"Login\"`]")
    private WebElement loginButtonSecond;
    @AndroidFindBy(xpath = "//android.widget.ImageButton[@content-desc=\"Previous month\"]")
    @iOSXCUITFindBy(accessibility = "Previous Month")
    private WebElement previousMonth;

    @AndroidFindBy(accessibility = "Next month")
    @iOSXCUITFindBy(accessibility = "Next month")
    private WebElement nextmonth;

    @AndroidFindBy(accessibility = "wallet-activated-icon")
    @iOSXCUITFindBy(accessibility = "wallet-activated-icon")
    private WebElement activatedStatus;

    @AndroidFindBy(accessibility = "issuerLogo")
    @iOSXCUITFindBy(accessibility = "issuerLogo")
    private WebElement sunbirdLogo;

    @AndroidFindBy(accessibility = "issuerLogo")
    @iOSXCUITFindBy(accessibility = "issuerLogo")
    private WebElement sunbirdSquareLogo;

    @AndroidFindBy(accessibility = "fullNameValue")
    @iOSXCUITFindBy(accessibility = "fullNameValue")
    private WebElement fullName;

    @AndroidFindBy(accessibility = "credentialTypeValue")
    @iOSXCUITFindBy(accessibility = "credentialTypeValue")
    private WebElement credentialTypeValue;

    @AndroidFindBy(accessibility = "fullNameValue")
    @iOSXCUITFindBy(accessibility = "fullNameValue")
    private WebElement fullNameInDetailView;

    @AndroidFindBy(accessibility = "policyNameValue")
    @iOSXCUITFindBy(accessibility = "policyNameValue")
    private WebElement policyName;

    @AndroidFindBy(accessibility = "idTypeValue")
    @iOSXCUITFindBy(accessibility = "idTypeValue")
    private WebElement idType;

    @iOSXCUITFindBy(accessibility = "Continue")
    private WebElement continueButton;

    @AndroidFindBy(accessibility = "verificationStatus")
    @iOSXCUITFindBy(accessibility = "verificationStatus")
    private WebElement status;

    @AndroidFindBy(accessibility = "emailValue")
    @iOSXCUITFindBy(accessibility = "emailValue")
    private WebElement emailIdValue;

    @AndroidFindBy(accessibility = "genderValue")
    @iOSXCUITFindBy(accessibility = "genderValue")
    private WebElement gender;

    @AndroidFindBy(accessibility = "dobValue")
    @iOSXCUITFindBy(accessibility = "dobValue")
    private WebElement dateofBirthValue;

    @AndroidFindBy(accessibility = "mobileValue")
    @iOSXCUITFindBy(accessibility = "mobileValue")
    private WebElement phoneNumber;

    @AndroidFindBy(accessibility = "Policy NumberValue")
    @iOSXCUITFindBy(accessibility = "Policy NumberValue")
    private WebElement policyNumber;

    @AndroidFindBy(accessibility = "ExpiryValue")
    @iOSXCUITFindBy(accessibility = "ExpiryValue")
    private WebElement expiryValue;

    @AndroidFindBy(accessibility = "profileAuthenticated")
    @iOSXCUITFindBy(accessibility = "profileAuthenticated")
    private WebElement activeStatus;

    @AndroidFindBy(accessibility = "qrCodeHeader")
    @iOSXCUITFindBy(accessibility = "qrCodeHeader")
    private WebElement qrCodeHeader;

    @AndroidFindBy(accessibility = "credentialTypeSelectionScreen")
    @iOSXCUITFindBy(accessibility = "credentialTypeSelectionScreen")
    private WebElement credentialTypeSelectionScreen;

    @AndroidFindBy(accessibility = "credentialTypeItem-InsuranceCredential")
    @iOSXCUITFindBy(accessibility = "credentialTypeItem-InsuranceCredential")
    private WebElement credentialTypeItemInsuranceCredential;

    @AndroidFindBy(accessibility = "credentialTypeItem-LifeInsuranceCredential_ldp")
    @iOSXCUITFindBy(accessibility = "credentialTypeItem-LifeInsuranceCredential_ldp")
    private WebElement credentialTypeItemLifeInsuranceCredentialldp;

    @AndroidFindBy(accessibility = "arrow-left")
    @iOSXCUITFindBy(accessibility = "goBack")
    private WebElement arrowLeft;

    @AndroidFindBy(accessibility = "policyExpiresOnValue")
    @iOSXCUITFindBy(accessibility = "policyExpiresOnValue")
    private WebElement policyExpiresOnValue;

    @AndroidFindBy(accessibility = "benefitsValue")
    @iOSXCUITFindBy(accessibility = "benefitsValue")
    private WebElement benefitsValue;

    @AndroidFindBy(xpath = "//android.view.ViewGroup[@resource-id=\"statusIcon\"]")
    private WebElement statusIcon;

    @AndroidFindBy(accessibility = "copilot-next-action")
    @iOSXCUITFindBy(accessibility = "copilot-next-action")
    private WebElement doneButton;

    @AndroidFindBy(xpath = "//*[contains(@text,'Login failed')]")
    private WebElement LoginFailedDueTOInValidCredentials;

    @AndroidFindBy(xpath = "//*[@resource-id=\"android:id/date_picker_header_year\"]")
//    @iOSXCUITFindBy(accessibility = "Show year picker")
    private WebElement pickeYear;

    @AndroidFindBy(xpath = "//*[@resource-id=\"android:id/text1\" and @text=\"2023\"]")
    @iOSXCUITFindBy(accessibility = "issuerSearchBar")
    private WebElement select2023Year;

    @AndroidFindBy(xpath = "//*[@resource-id=\"android:id/text1\" and @text=\"2024\"]")
    @iOSXCUITFindBy(accessibility = "issuerSearchBar")
    private WebElement select2024Year;

    @AndroidFindBy(xpath = "//android.widget.Button[@resource-id=\"android:id/button1\"]")
    @iOSXCUITFindBy(accessibility = "Done")
    private WebElement setButton;

    @AndroidFindBy(xpath = "//*[contains(@text,'CONTINUE')]")
    @iOSXCUITFindBy(xpath = "//*[contains(@text,'CONTINUE')]")
    private WebElement continuePopupButton;

    public SunbirdLoginPage(AppiumDriver driver) {
        super(driver);
    }
    BasePage basePage = new BasePage(driver);
    public void clickOnloginWithKbaButton() {
        clickOnElement(loginWithKBA);
    }

    public void enterPolicyNumberTextBox(String PolicyNo) {

        if (isElementDisplayed(continuePopupButton)){
            clickOnElement(continuePopupButton);
        }
        sendKeysToTextBox(enterPolicyTextBox, PolicyNo);
    }

    public void enterFullNameTextBox(String fullname) {
        sendKeysToTextBox(enterFullnameTextBox, fullname);
    }

    public void selectYear(){
        if(isElementDisplayed(pickeYear)){
            clickOnElement(pickeYear);
            if(currentMonth.getValue() > 6) {
                if (isElementDisplayed(select2023Year)) {
                    clickOnElement(select2023Year);
                }
            }else{
                clickOnElement(select2024Year);
            }

        }
    }
    public void enterDateOfBirthTextBox() {
        clickOnElement(enterDateOfBirthTextBox);
if (isElementDisplayed(setButton)){
    clickOnElement(setButton);
}

    }

    public void clickOnloginButton() throws InterruptedException {

        int retryCount = 0;
        while (isElementDisplayed(loginButton) && retryCount < 5) {
            clickOnElement(loginButton);
            if (isElementDisplayed(LoginFailedDueTOInValidCredentials)) {
                retryCount++;
            } else {
                break;
            }
        }
        if(isElementDisplayed(loginButtonSecond)){
            clickOnElement(loginButtonSecond);
        }
    }
    public boolean isSunbirdCardIsActive() {
        if(isElementDisplayed(doneButton))
            clickOnElement(doneButton);
        basePage.retryToGetElement(activatedStatus);
        return this.isElementDisplayed(activatedStatus);
    }

    public boolean isSunbirdCardLogoIsDisplayed() {
        if(isElementDisplayed(sunbirdSquareLogo)){
            basePage.retryToGetElement(sunbirdSquareLogo);
            return true;
        } else if (isElementDisplayed(sunbirdLogo)) {
            basePage.retryToGetElement(sunbirdLogo);
            return true;
        }
        else {
            return false;
        }
    }

    public String getFullNameForSunbirdCard() {
        basePage.retryToGetElement(fullName);
        return this.getTextFromLocator(fullName);
    }
    public String getFullNameForSunbirdCardForDetailView() {
        basePage.retryToGetElement(fullNameInDetailView);
        return this.getTextFromLocator(fullNameInDetailView);
    }
    public String getPolicyNameForSunbirdCard() {
        basePage.retryToGetElement(policyName);
        return this.getTextFromLocator(policyName);
    }

    public String getPolicyNumberForSunbirdCard() {
        basePage.retryToGetElement(policyNumber);
        return this.getTextFromLocator(policyNumber);
    }

    public String getPhoneNumberForSunbirdCard() {
        basePage.retryToGetElement(phoneNumber);
        return this.getTextFromLocator(phoneNumber);
    }

//    public String getDateofBirthValueForSunbirdCard() {
//        basePage.retryToGetElement(dateofBirthValue);
//        return this.getTextFromLocator(dateofBirthValue);
//    }

    public boolean isDateofBirthValueForSunbirdCardDisplayed() {
        return  isElementDisplayed(dateofBirthValue);
    }

    public String getGenderValueForSunbirdCard() {
        basePage.retryToGetElement(gender);
        return this.getTextFromLocator(gender);
    }

    public String getEmailIdValueForSunbirdCard() {
        IosUtil.scrollToElement(driver,100,800,100,200);
        basePage.retryToGetElement(emailIdValue);
        return this.getTextFromLocator(emailIdValue);
    }

    public String getStatusValueForSunbirdCard() {
        basePage.retryToGetElement(status);
        return this.getTextFromLocator(status);
    }

    public String getIdTypeValueForSunbirdCard() {
        basePage.retryToGetElement(idType);
        return this.getTextFromLocator(idType);
    }

    public void clickOnContinueButtonInSigninPopupIos(){
        clickOnElement(continueButton);
    }

    public void openDetailedSunbirdVcView() {
        basePage.retryToGetElement(credentialTypeValue);
        clickOnElement(credentialTypeValue);
    }

    public boolean isSunbirdRCInsuranceVerifiableCredentialHeaderDisplayed() {
        basePage.retryToGetElement(credentialTypeSelectionScreen);
        return this.isElementDisplayed(credentialTypeSelectionScreen);
    }

    public boolean isMosipInsuranceDisplayed() {
        basePage.retryToGetElement(credentialTypeItemInsuranceCredential);
        return this.isElementDisplayed(credentialTypeItemInsuranceCredential);
    }

    public void clickOnMosipInsurance() {
        this.clickOnElement(credentialTypeItemInsuranceCredential);
    }

    public void clickOnBackArrow() {
        this.clickOnElement(arrowLeft);
    }

    public boolean isPolicyExpiresOnValueDisplayed() {
        return this.isElementDisplayed(policyExpiresOnValue);
    }

    public boolean isbenefitsValueDisplayed() {
        return this.isElementDisplayed(benefitsValue);
    }

    public boolean isStatusIconDisplayed() {
        return this.isElementDisplayed(statusIcon);
    }

}
