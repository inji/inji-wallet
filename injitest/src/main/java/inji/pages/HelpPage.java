package inji.pages;

import io.appium.java_client.AppiumDriver;
import io.appium.java_client.pagefactory.AndroidFindBy;
import io.appium.java_client.pagefactory.iOSXCUITFindBy;
import org.openqa.selenium.WebElement;

public class HelpPage extends BasePage {

    @AndroidFindBy(accessibility = "helpScreen")
    @iOSXCUITFindBy(accessibility = "helpScreen")
    private WebElement helpText;

    @AndroidFindBy(accessibility = "close")
    @iOSXCUITFindBy(accessibility = "close")
    private WebElement crossIcon;

    @AndroidFindBy(uiAutomator = "new UiScrollable(new UiSelector()).scrollIntoView(text(\"What happens when Android keystore biometric is changed?\"));")
    @iOSXCUITFindBy(accessibility = "How to add a card?")
    public WebElement biometricIsChangeTextdHeader;

    @AndroidFindBy(uiAutomator = "new UiSelector().textContains(\"The Android keystore holds important information like private keys \")")
    private WebElement biometricIsChangeTextDescription;

    @AndroidFindBy(uiAutomator = "new UiSelector().textContains(\"What is an ID?\")")
    @iOSXCUITFindBy(accessibility = "What is an ID?")
    public WebElement helpPageContent;

    @AndroidFindBy(uiAutomator = "new UiScrollable(new UiSelector()).scrollIntoView(text(\"What is Share with selfie?\"));")
    @iOSXCUITFindBy(accessibility = "new UiScrollable(new UiSelector()).scrollIntoView(text(\"What is Share with selfie?\"));")
    public WebElement whatIsShareWithSelfieTextdHeader;

    public HelpPage(AppiumDriver driver) {
        super(driver);
    }

    public boolean isHelpPageLoaded() {
        return isElementVisible(helpText, "Checking if 'Help' page is loaded");
    }

    public void exitHelpPage() {
        click(crossIcon, "Clicking on 'Close' icon to exit Help page");
    }

    public void scrollPerformInHelpPage() {
        biometricIsChangeTextdHeader.isDisplayed();
    }

    public boolean isHelpPageContentEmpty() {
        return helpPageContent.getText().isBlank();
    }

    public boolean isBiometricIsChangeTextDescription() {
        return isElementVisible(biometricIsChangeTextDescription, "Checking if 'Biometric is Changed' description text is displayed");
    }

    public void clickOnBackButton() {
        driver.navigate().back();
    }

    public boolean isWhatIsShareWithSelfieTextdHeader() {
        return isElementVisible(whatIsShareWithSelfieTextdHeader, "Checking if 'What is Share with Selfie' header is displayed");
    }

    public void clickOnCrossButton() {
        click(crossIcon, "Clicking on 'Cross' button to close the popup or screen");
    }
}

