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
    }

    public SetPasscode clickOnUsePasscode() {
        if (isElementVisible(usePasscodeButton)) {
            click(usePasscodeButton, "Click on 'Use Passcode' button to proceed");
        }
        return new SetPasscode(driver);
    }

    public String getDescriptionText() {
        return getText(descriptionText, "Get the description text displayed on the passcode screen");
    }

    public String getPasswordTypeDescriptionText() {
        return getText(passwordTypeDescriptionText, "Get the description text related to password type");
    }

    public boolean isUseBiometricsButton() {
        return isElementVisible(useBiometricsButton, "Check if the 'Use Biometrics' button is visible");
    }

}