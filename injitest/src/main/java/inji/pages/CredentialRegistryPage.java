package inji.pages;

import io.appium.java_client.AppiumDriver;
import io.appium.java_client.pagefactory.AndroidFindBy;
import io.appium.java_client.pagefactory.iOSXCUITFindBy;
import org.openqa.selenium.WebElement;

public class CredentialRegistryPage extends BasePage {

    @AndroidFindBy(accessibility = "credentialRegistryLabel")
    @iOSXCUITFindBy(accessibility = "credentialRegistryLabel")
    public WebElement credentialRegistryTextBoxHeader;

    @AndroidFindBy(uiAutomator = "new UiSelector().textContains(\"Palitan ang Credential Registry\")")
    public WebElement credentialRegistryTextBoxHeaderInFilipino;

    @AndroidFindBy(accessibility = "esignetHostLabel")
    @iOSXCUITFindBy(accessibility = "esignetHostLabel")
    public WebElement credentialRegistryEsignetTextBoxHeader;

    @AndroidFindBy(uiAutomator = "new UiSelector().textContains(\"Palitan ang esignethosturl\")")
    public WebElement credentialRegistryEsignetTextBoxHeaderInFilipino;

    @AndroidFindBy(accessibility = "credentialRegistryInputField")
    @iOSXCUITFindBy(accessibility = "credentialRegistryInputField")
    public WebElement credentialRegistryTextBox;

    @AndroidFindBy(accessibility = "esignetHostInputField")
    @iOSXCUITFindBy(accessibility = "esignetHostInputField")
    public WebElement credentialRegistryEsignetTextBox;

    @AndroidFindBy(accessibility = "save")
    @iOSXCUITFindBy(accessibility = "save")
    public WebElement saveButton;

    @AndroidFindBy(accessibility = "cancel")
    @iOSXCUITFindBy(accessibility = "cancel")
    public WebElement cancelButton;

    @AndroidFindBy(accessibility = "arrowLeft")
    @iOSXCUITFindBy(accessibility = "arrowLeft")
    public WebElement backArrow;

    @AndroidFindBy(accessibility = "credentialRegistryErrorMessage")
    @iOSXCUITFindBy(accessibility = "credentialRegistryErrorMessage")
    public WebElement credentialRegistryErrorMessage;


    public CredentialRegistryPage(AppiumDriver driver) {
        super(driver);
    }

    public boolean isCredentialRegistryTextBoxHeaderDisplayed() {
        return isElementVisible(credentialRegistryTextBoxHeader, "Check if the Credential Registry TextBox header is displayed");
    }

    public boolean isCredentialRegistryErrorMessageDisplayed() {
        return isElementVisible(credentialRegistryErrorMessage, "Check if the Credential Registry error message is displayed");
    }

    public boolean isCredentialRegistryTextBoxHeaderInFilipinoDisplayed() {
        return isElementVisible(credentialRegistryTextBoxHeaderInFilipino, "Check if the Credential Registry TextBox header is displayed in Filipino");
    }

    public boolean isCredentialRegistryTextBoxHeaderForEsignetInFilipinoDisplayed() {
        return isElementVisible(credentialRegistryEsignetTextBoxHeader, "Check if the Credential Registry Esignet TextBox header is displayed in Filipino");
    }

    public CredentialRegistryPage setEnterIdTextBox(String text) {
        clearAndSendKeys(credentialRegistryTextBox, text, "Enter ID into the Credential Registry TextBox");
        return this;
    }

    public CredentialRegistryPage enterUrlToEsignetHostTextBox(String text) {
        clearAndSendKeys(credentialRegistryEsignetTextBox, text, "Enter Esignet host URL into the TextBox");
        return this;
    }

    public CredentialRegistryPage clickOnSaveButton() {
        click(saveButton, "Click on the 'Save' button");
        return this;
    }

    public CredentialRegistryPage clickOnCancelButton() {
        click(cancelButton, "Click on the 'Cancel' button");
        return this;
    }

    public void clickOnBackArrow() {
        click(backArrow, "Click on the back arrow to return to the previous screen");
    }


    public String checkEnvNotChanged() {
        return credentialRegistryTextBox.getText();
    }
    
    public String getCurrentEnvValue() {
        return credentialRegistryTextBox.getText();
    }
}