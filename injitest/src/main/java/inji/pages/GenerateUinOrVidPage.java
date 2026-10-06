package inji.pages;

import io.appium.java_client.AppiumDriver;
import io.appium.java_client.pagefactory.AndroidFindBy;
import io.appium.java_client.pagefactory.iOSXCUITFindBy;
import org.openqa.selenium.WebElement;

public class GenerateUinOrVidPage extends BasePage {

    @AndroidFindBy(accessibility = "getIdHeader")
    @iOSXCUITFindBy(accessibility = "getIdHeader")
    private WebElement retrieveUinVidText;

    @AndroidFindBy(accessibility = "getIdInputModalIndividualId")
    @iOSXCUITFindBy(accessibility = "getIdInputModalIndividualId")
    private WebElement applicationIdTextBox;

    @AndroidFindBy(accessibility = "getIdButton")
    @iOSXCUITFindBy(accessibility = "getIdButton")
    private WebElement getUinOrVidButton;

    @AndroidFindBy(xpath = "//*[@text=\"Network request failed\"]")
    @iOSXCUITFindBy(accessibility = "getIdButton")
    private WebElement networkErrorMesseage;

    public GenerateUinOrVidPage(AppiumDriver driver) {
        super(driver);
    }

    public boolean isGenerateUinOrVidPageLoaded() {
        return isElementVisible(retrieveUinVidText, "Checking if 'Generate UIN or VID' page is loaded");
    }

    public String getRetrieveUinVidText() {
        return getText(retrieveUinVidText, "Getting text from 'Retrieve UIN/VID' header");
    }

    public GenerateUinOrVidPage enterApplicationID(String applicationId) {
        enterText(applicationIdTextBox, applicationId, "Entering Application ID");
        return this;
    }

    public OtpVerificationPage clickOnGetUinOrVidButton() {
        click(getUinOrVidButton, "Clicking on 'Get UIN/VID' button");
        return new OtpVerificationPage(driver);
    }

    public String getGenerateUinOrVidPageTextloaded() {
        return getText(retrieveUinVidText, "Getting 'Generate UIN/VID Page' header text");
    }

    public boolean isNetworkRequesFailedDisplayed() {
        return isElementVisible(networkErrorMesseage, "Checking if 'Network Request Failed' message is displayed");
    }
}