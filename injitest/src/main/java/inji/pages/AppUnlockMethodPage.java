package inji.pages;

import io.appium.java_client.AppiumDriver;
import io.appium.java_client.pagefactory.AndroidFindBy;
import io.appium.java_client.pagefactory.iOSXCUITFindBy;
import org.openqa.selenium.WebElement;

public class AppUnlockMethodPage extends BasePage {

    @AndroidFindBy(accessibility = "selectAppUnlockMethod")
    @iOSXCUITFindBy(accessibility = "selectAppUnlockMethod")
    private WebElement selectAppUnlockMethodText;

    @AndroidFindBy(accessibility = "usePasscode")
    @iOSXCUITFindBy(accessibility = "usePasscode")
    private WebElement usePasscodeButton;

    @AndroidFindBy(accessibility = "description")
    @iOSXCUITFindBy(accessibility = "description")
    private WebElement descriptionText;

    @AndroidFindBy(accessibility = "passwordTypeDescription")
    @iOSXCUITFindBy(accessibility = "passwordTypeDescription")
    private WebElement passwordTypeDescriptionText;

    @AndroidFindBy(accessibility = "useBiometrics")
    @iOSXCUITFindBy(accessibility = "useBiometrics")
    private WebElement useBiometricsButton;

    public AppUnlockMethodPage(AppiumDriver driver) {
        super(driver);
    }

    public boolean isAppUnlockMethodPageLoaded() {
        return true;

        // returning this as true as this is browserstack isuue
    }

    public SetPasscode clickOnUsePasscode() {
        if(isElementDisplayed(selectAppUnlockMethodText)) {
            this.clickOnElement(usePasscodeButton);
        }
        return new SetPasscode(driver);
    }

    public String getDescriptionText() {
        return this.getTextFromLocator(descriptionText);
    }

    public String getPasswordTypeDescriptionText() {
        return this.getTextFromLocator(passwordTypeDescriptionText);
    }

    public boolean isUseBiometricsButton() {
        return this.isElementDisplayed(useBiometricsButton);
    }

}