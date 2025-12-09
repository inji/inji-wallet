package inji.pages;

import io.appium.java_client.AppiumDriver;
import io.appium.java_client.pagefactory.AndroidFindBy;
import io.appium.java_client.pagefactory.iOSXCUITFindBy;
import org.openqa.selenium.WebElement;

public class UnlockApplicationPage extends BasePage {

    @AndroidFindBy(accessibility = "unlockApplication")
    @iOSXCUITFindBy(accessibility = "unlockApplication")
    private WebElement unlockApplicationButton;

    @AndroidFindBy(accessibility = "unlockApplication")
    @iOSXCUITFindBy(iOSClassChain = "**/XCUIElementTypeButton[`label == \"فتح التطبيق\"`]")
    private WebElement unlockApplicationButtonInArabic;

    public UnlockApplicationPage(AppiumDriver driver) {
        super(driver);
    }

    public boolean isUnlockApplicationPageLoaded() {
        return isElementVisible(unlockApplicationButton, "Check if Unlock Application button is displayed");
    }

    public boolean isUnlockApplicationPageLoadedInArabic() {
        return isElementVisible(unlockApplicationButtonInArabic, "Check if Unlock Application button is displayed in Arabic");
    }

    public EnterYourPasscodePage clickOnUnlockApplicationButton() {
        click(unlockApplicationButton, "Click on Unlock Application button");
        return new EnterYourPasscodePage(driver);
    }

    public boolean isUnlockApplicationDisplayed() {
        return isElementVisible(unlockApplicationButton, 5, "Check if Unlock Application button is displayed within 5 seconds");
    }
}