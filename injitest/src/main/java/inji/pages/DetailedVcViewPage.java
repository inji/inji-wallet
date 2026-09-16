package inji.pages;

import inji.utils.IosUtil;
import io.appium.java_client.AppiumDriver;
import io.appium.java_client.pagefactory.AndroidFindBy;
import io.appium.java_client.pagefactory.iOSXCUITFindBy;
import org.openqa.selenium.WebElement;

public class DetailedVcViewPage extends BasePage {
    @AndroidFindBy(accessibility = "idDetailsHeader")
    @iOSXCUITFindBy(accessibility = "idDetailsHeader")
    private WebElement detailedVcViewPageTitle;

    @AndroidFindBy(accessibility = "fullNameValue")
    @iOSXCUITFindBy(accessibility = "fullNameValue")
    private WebElement fullNameValue;

    @AndroidFindBy(accessibility = "genderValue")
    @iOSXCUITFindBy(accessibility = "genderValue")
    private WebElement genderValue;

    @AndroidFindBy(accessibility = "dateOfBirthValue")
    @iOSXCUITFindBy(accessibility = "dateOfBirthValue")
    private WebElement dateOfBirthValue;

    @AndroidFindBy(accessibility = "idTypeValue")
    @iOSXCUITFindBy(accessibility = "idTypeValue")
    private WebElement idTypeValue;

    @AndroidFindBy(accessibility = "verificationStatus")
    @iOSXCUITFindBy(accessibility = "verificationStatus")
    private WebElement statusValue;

    @AndroidFindBy(accessibility = "UINValue")
    @iOSXCUITFindBy(accessibility = "UINValue")
    private WebElement uinNumberValue;

    @AndroidFindBy(accessibility = "generatedOnValue")
    @iOSXCUITFindBy(accessibility = "generatedOnValue")
    private WebElement generatedOnValue;

    @AndroidFindBy(accessibility = "phoneValue")
    @iOSXCUITFindBy(accessibility = "phoneValue")
    private WebElement phoneNumberValue;

    @AndroidFindBy(accessibility = "emailValue")
    @iOSXCUITFindBy(accessibility = "emailValue")
    private WebElement emailIdValue;

    @AndroidFindBy(accessibility = "enableVerification")
    @iOSXCUITFindBy(accessibility = "enableVerification")
    private WebElement activateButton;

    @iOSXCUITFindBy(accessibility = "enableVerification")
    private WebElement activeButtonIos;

    @AndroidFindBy(accessibility = "profileAuthenticated")
    @iOSXCUITFindBy(accessibility = "profileAuthenticated")
    private WebElement profileAuthenticated;

    @AndroidFindBy(accessibility = "close")
    @iOSXCUITFindBy(accessibility = "close")
    private WebElement crossIcon;

    @AndroidFindBy(accessibility = "qrCodeCloseIcon")
    @iOSXCUITFindBy(accessibility = "qrCodeCloseIcon")
    private WebElement qrCloseIcon;

    @AndroidFindBy(accessibility = "qrCodePressable")
    @iOSXCUITFindBy(accessibility = "qrCodePressable")
    private WebElement detailedVcViewPageQr;

    @AndroidFindBy(accessibility = "qrCodeHeader")
    @iOSXCUITFindBy(accessibility = "qrCodeHeader")
    private WebElement qrCodeHeader;

    @AndroidFindBy(accessibility = "credentialRegistry")
    @iOSXCUITFindBy(accessibility = "credentialRegistry")
    private WebElement credentialRegistryText;

    @AndroidFindBy(accessibility = "credentialRegistryValue")
    @iOSXCUITFindBy(accessibility = "credentialRegistryValue")
    private WebElement credentialRegistryValue;

    @AndroidFindBy(accessibility = "issuerLogo")
    @iOSXCUITFindBy(accessibility = "issuerLogo")
    private WebElement esignetLogo;

    @AndroidFindBy(accessibility = "goBack")
    @iOSXCUITFindBy(accessibility = "goBack")
    public WebElement backArrow;

    @AndroidFindBy(accessibility = "arrow-left")
    @iOSXCUITFindBy(accessibility = "arrow-left")
    public WebElement arrowleft;

    @AndroidFindBy(accessibility = "KebabIcon")
    @iOSXCUITFindBy(accessibility = "KebabIcon")
    public WebElement moreOptionsButton;

    @AndroidFindBy(uiAutomator = "new UiScrollable(new UiSelector().scrollable(true).instance(0)).scrollIntoView(new UiSelector().description(\"outlined-delete-icon\"))")
    @iOSXCUITFindBy(accessibility = "removeFromWallet")
    private WebElement removeFromWalletButton;

    @AndroidFindBy(accessibility = "yesConfirm")
    @iOSXCUITFindBy(accessibility = "yesConfirm")
    private WebElement yesButton;


    public DetailedVcViewPage(AppiumDriver driver) {
        super(driver);
    }

    public boolean isDetailedVcViewPageLoaded() {
        return isElementVisible(detailedVcViewPageTitle, "Check if Detailed VC View page title is visible");
    }

    public String getNameInDetailedVcView() {
        return getText(fullNameValue, "Get the full name displayed in Detailed VC View");
    }

    public String getGenderInDetailedVcView() {
        return getText(genderValue, "Get the gender value displayed in Detailed VC View");
    }

    public String getDateOfBirthInDetailedVcView() {
        return getText(dateOfBirthValue, "Get the date of birth value displayed in Detailed VC View");
    }

    public String getIdTypeValueInDetailedVcView() {
        return getText(idTypeValue, "Get the ID type value displayed in Detailed VC View");
    }

    public String getStatusInDetailedVcView() {
        return getText(statusValue, "Get the status value displayed in Detailed VC View");
    }

    public String getUinInDetailedVcView() {
        return getText(uinNumberValue, "Get the UIN value displayed in Detailed VC View");
    }

    public String getGeneratedOnValueInDetailedVcView() {
        return getText(generatedOnValue, "Get the generated-on timestamp from Detailed VC View");
    }

    public String getPhoneInDetailedVcView() {
        return getText(phoneNumberValue, "Get the phone number displayed in Detailed VC View");
    }

    public String getEmailInDetailedVcView() {
        return scrollToElementByAccessibilityIdGetText("emailValue", "Get the email ID displayed in Detailed VC View");
    }

    public boolean isActivateButtonDisplayed() {
        return isElementVisible(activateButton, "Check if the 'Activate' button is visible");
    }

    public PleaseConfirmPopupPage clickOnActivateButtonAndroid() {
        click(activateButton, "Click on the 'Activate' button on Android");
        return new PleaseConfirmPopupPage(driver);
    }

    public PleaseConfirmPopupPage clickOnActivateButtonIos() {
        IosUtil.scrollToElement(driver, 58, 712, 160, 129);
        click(activeButtonIos, "Scroll and click on the 'Activate' button on iOS");
        return new PleaseConfirmPopupPage(driver);
    }

    public boolean isProfileAuthenticatedDisplayed() {
        return isElementVisible(profileAuthenticated, "Check if the 'Profile Authenticated' indicator is displayed");
    }

    public HomePage clickOnBackArrow() {
        click(backArrow, "Click on the back arrow to return to the Home page");
        return new HomePage(driver);
    }

    public HomePage clickOnArrowleft() {
        click(arrowleft, "Click on the left arrow to return to the Home page");
        return new HomePage(driver);
    }

    public HomePage clickOnQrCrossIcon() {
        click(qrCloseIcon, "Click on the QR code close icon to return to Home page");
        return new HomePage(driver);
    }

    public HomePage clickOnCrossIcon() {
        click(crossIcon, "Click on the cross icon to close the Detailed VC View");
        return new HomePage(driver);
    }

    public void clickOnQrCodeButton() {
        click(detailedVcViewPageQr, "Click on the QR code button on Detailed VC View page");
        new PleaseConfirmPopupPage(driver);
    }

    public boolean isQrCodeDisplayed() {
        return isElementVisible(qrCodeHeader, "Check if the QR code is displayed on Detailed VC View");
    }

    public boolean isCredentialRegistryTextDisplayed() {
        return isElementVisible(credentialRegistryText, "Check if Credential Registry label text is visible");
    }

    public String getCredentialRegistryValue() {
        return getText(credentialRegistryValue, "Get the value shown for Credential Registry in Detailed VC View");
    }

    public boolean isEsignetLogoDisplayed() {
        return isElementVisible(esignetLogo, "Check if the Esignet logo is displayed");
    }

    public void clickOnMoreOptionsInDetails() {
        click(moreOptionsButton, "Click on the 'More Options' button in Detailed VC View");
    }
    public PleaseConfirmPopupPage clickOnRemoveFromWallet() {
        IosUtil.scrollToElement(driver, 59, 755, 119, 20);
        click(removeFromWalletButton, "Clicking on 'Remove from Wallet' button");
        return new PleaseConfirmPopupPage(driver);
    }
    public PleaseConfirmPopupPage clickOnConfirmButton() {
        click(yesButton, "Click on Yes button to confirm");
        return new PleaseConfirmPopupPage(driver);
    }
}
