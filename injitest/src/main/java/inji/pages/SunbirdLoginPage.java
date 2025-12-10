package inji.pages;

import inji.utils.IosUtil;
import io.appium.java_client.AppiumDriver;
import io.appium.java_client.pagefactory.AndroidFindBy;
import io.appium.java_client.pagefactory.iOSXCUITFindBy;
import org.openqa.selenium.WebElement;

import java.time.LocalDate;
import java.time.Month;

public class SunbirdLoginPage extends BasePage {

    private final Month currentMonth = LocalDate.now().getMonth();
    private final BasePage basePage;

    public SunbirdLoginPage(AppiumDriver driver) {
        super(driver);
        basePage = new BasePage(driver);
    }

    @AndroidFindBy(xpath = "//*[contains(@text,'Login with KBA')]")
    private WebElement loginWithKBA;

    @AndroidFindBy(xpath = "//*[@resource-id=\"_form_policyNumber\"]")
    @iOSXCUITFindBy(xpath = "//XCUIElementTypeTextField[@value=\"Policy Number\"]")
    private WebElement enterPolicyTextBox;

    @AndroidFindBy(xpath = "//android.widget.EditText[@resource-id=\"_form_fullName\"]")
    @iOSXCUITFindBy(xpath = "//XCUIElementTypeTextField[@value=\"Full Name\"]")
    private WebElement enterFullNameTextBox;

    @AndroidFindBy(uiAutomator = "UiSelector().className(\"android.widget.Spinner\")")
    @iOSXCUITFindBy(iOSClassChain = "**/XCUIElementTypeOther[`name == \"eSignet\"`]/XCUIElementTypeOther[10]")
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
    private WebElement nextMonth;

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
    private WebElement dateOfBirthValue;

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
    private WebElement credentialTypeItemLifeInsuranceCredentialLdp;

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
    private WebElement loginFailedInvalidCredentials;

    @AndroidFindBy(xpath = "//*[@resource-id=\"android:id/date_picker_header_year\"]")
//    @iOSXCUITFindBy(accessibility = "Show year picker")
    private WebElement pickerYear;

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
    @iOSXCUITFindBy(accessibility = "Continue")
    private WebElement continuePopupButton;

    public void clickOnLoginWithKbaButton() {
        click(loginWithKBA, "Click on 'Login with KBA' button");
    }

    public void enterPolicyNumber(String policyNo) {
        click(continuePopupButton, "Click on continue button in popup before entering policy number");
        enterText(enterPolicyTextBox, policyNo, "Enter policy number: " + policyNo);
    }

    public void enterFullName(String fullName) {
        enterText(enterFullNameTextBox, fullName, "Enter full name: " + fullName);
    }

    public void selectYear() {
        if (isElementVisible(pickerYear, "Checking if year picker is visible")) {
            click(pickerYear, "Click on year picker");
            if (currentMonth.getValue() > 6 && isElementVisible(select2023Year, "Check if 2023 year is visible")) {
                click(select2023Year, "Select year 2023");
            } else {
                click(select2024Year, "Select year 2024");
            }
        }
    }

    public void enterDateOfBirth() {
        click(enterDateOfBirthTextBox, "Click on date of birth input field");
        click(setButton, "Click on set button to confirm date of birth");
    }

    public void clickOnLoginButton() {
        int retryCount = 0;
        while (isElementVisible(loginButton) && retryCount < 5) {
            click(loginButton, "Click on login button (Attempt " + (retryCount + 1) + ")");
            if (!isElementVisible(loginFailedInvalidCredentials)) {
                break;
            }
            retryCount++;
            sleep(1000);
        }
        if (isElementVisible(loginButtonSecond)) {
            click(loginButtonSecond, "Click on fallback login button");
        }
    }

    public boolean isSunbirdCardActive() {
        click(doneButton, "Click on Done button after login");
        return isElementVisible(activatedStatus, "Check if Sunbird card is active (status visible)");
    }

    public boolean isSunbirdCardLogoDisplayed() {
        return isElementVisible(sunbirdSquareLogo, "Check if Sunbird square logo is displayed") ||
                isElementVisible(sunbirdLogo, "Check if Sunbird logo is displayed");
    }

    public String getFullNameForSunbirdCard() {
        return getText(fullName, "Fetch full name from Sunbird card");
    }

    public String getFullNameForSunbirdCardForDetailView() {
        return getText(fullNameInDetailView, "Fetch full name from detailed Sunbird card view");
    }

    public String getPolicyNameForSunbirdCard() {
        return getText(policyName, "Fetch policy name from Sunbird card");
    }

    public String getPolicyNumberForSunbirdCard() {
        return getText(policyNumber, "Fetch policy number from Sunbird card");
    }

    public String getPhoneNumberForSunbirdCard() {
        return getText(phoneNumber, "Fetch phone number from Sunbird card");
    }

    public boolean isDateOfBirthValueForSunbirdCardDisplayed() {
        return isElementVisible(dateOfBirthValue, "Check if date of birth is displayed on Sunbird card");
    }

    public String getGenderValueForSunbirdCard() {
        return getText(gender, "Fetch gender value from Sunbird card");
    }

    public String getEmailIdValueForSunbirdCard() {
        IosUtil.scrollToElement(driver, 100, 800, 100, 200);
        return basePage.retryGetText(emailIdValue, "Fetch email ID from Sunbird card (scrolled)");
    }

    public String getStatusValueForSunbirdCard() {
        return getText(status, "Fetch status value from Sunbird card");
    }

    public String getIdTypeValueForSunbirdCard() {
        return getText(idType, "Fetch ID type from Sunbird card");
    }

    public void clickOnContinueButtonInSignInPopupIos() {
        click(continueButton, "Click on continue button in sign-in popup (iOS)");
    }

    public void openDetailedSunbirdVcView() {
        click(credentialTypeValue, "Open detailed view of Sunbird VC");
    }

    public boolean isSunbirdRCInsuranceVerifiableCredentialHeaderDisplayed() {
        return isElementVisible(credentialTypeSelectionScreen, "Check if RC Insurance header is visible");
    }

    public boolean isMosipInsuranceDisplayed() {
        return isElementVisible(credentialTypeItemInsuranceCredential, "Check if MOSIP Insurance VC is displayed");
    }

    public void clickOnMosipInsurance() {
        click(credentialTypeItemInsuranceCredential, "Click on MOSIP Insurance VC item");
    }

    public void clickOnBackArrow() {
        click(arrowLeft, "Click on back arrow icon");
    }

    public boolean isPolicyExpiresOnValueDisplayed() {
        return isElementVisible(policyExpiresOnValue, "Check if 'Policy Expires On' value is visible");
    }

    public boolean isBenefitsValueDisplayed() {
        return isElementVisible(benefitsValue, "Check if benefits value is visible");
    }

    public boolean isStatusIconDisplayed() {
        return isElementVisible(statusIcon, "Check if status icon is displayed");
    }
    
    public HomePage navigateBackToHomePage() {
    	click(doneButton, "Click on Done button to navigate back to Home");
    	 return new HomePage(driver);
    }
    
    public void clickOnDoneButton() {
        click(doneButton, "Click on Done button after login");
    }
    public boolean isSunbirdCardisActive() {
        return isElementVisible(activatedStatus, "Check if Sunbird card is active (status visible)");
    }
}
