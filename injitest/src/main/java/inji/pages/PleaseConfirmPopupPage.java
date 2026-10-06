package inji.pages;

import io.appium.java_client.AppiumDriver;
import io.appium.java_client.pagefactory.AndroidFindBy;
import io.appium.java_client.pagefactory.iOSXCUITFindBy;
import org.openqa.selenium.WebElement;

public class PleaseConfirmPopupPage extends BasePage {
    @AndroidFindBy(accessibility = "yesConfirm")
    @iOSXCUITFindBy(accessibility = "yesConfirm")
    private WebElement yesButton;

    @AndroidFindBy(accessibility = "no")
    @iOSXCUITFindBy(accessibility = "no")
    private WebElement noButton;

    public PleaseConfirmPopupPage(AppiumDriver driver) {
        super(driver);
    }

    public boolean isPleaseConfirmPopupPageLoaded() {
        return this.isElementVisible(yesButton);
    }

    public OtpVerificationPage clickOnConfirmButton() {
        click(yesButton, "Click on Yes button to confirm");
        return new OtpVerificationPage(driver);
    }

    public void clickOnNoButton() {
        click(noButton, "Click on No button to cancel confirmation");
        new OtpVerificationPage(driver);
    }

}