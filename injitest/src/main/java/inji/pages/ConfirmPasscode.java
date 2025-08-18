package inji.pages;

import inji.constants.PlatformType;
import io.appium.java_client.AppiumDriver;
import io.appium.java_client.pagefactory.AndroidFindBy;
import io.appium.java_client.pagefactory.iOSXCUITFindBy;
import org.openqa.selenium.WebElement;

public class ConfirmPasscode extends BasePage {

    @iOSXCUITFindBy(accessibility = "confirmPasscodeHeader")
    @AndroidFindBy(xpath = "//*[contains(@text,'Confirm passcode')]")
    private WebElement confirmPasscode;


    @AndroidFindBy(accessibility = "PasscodeError")
    @iOSXCUITFindBy(accessibility = "PasscodeError")
    private WebElement invalidPasscode;

    public ConfirmPasscode(AppiumDriver driver) {
        super(driver);
    }

    public boolean isPasscodeInvalidMessageDisplayed() {
        return isElementVisible(invalidPasscode, "Check if 'Invalid Passcode' error message is displayed");
    }

    public boolean isConfirmPassCodePageLoaded() {
        return isElementVisible(confirmPasscode, "Verify that the 'Confirm Passcode' screen is loaded");
    }


    public HomePage enterPasscodeInConfirmPasscodePage(String passcode, PlatformType os) {
        SetPasscode setPasscode = new SetPasscode(driver);
        setPasscode.enterPasscode(passcode, os);
        return new HomePage(driver);
    }
}