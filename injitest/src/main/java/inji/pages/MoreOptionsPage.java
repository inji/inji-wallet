package inji.pages;

import inji.utils.IosUtil;
import io.appium.java_client.AppiumDriver;
import io.appium.java_client.pagefactory.AndroidFindBy;
import io.appium.java_client.pagefactory.iOSXCUITFindBy;
import org.openqa.selenium.WebElement;

public class MoreOptionsPage extends BasePage {

//    @AndroidFindBy(accessibility = "outlined-delete-icon")
//    @iOSXCUITFindBy(accessibility = "removeFromWallet")
//    private WebElement removeFromWalletButton;

    @AndroidFindBy(uiAutomator = "new UiScrollable(new UiSelector().scrollable(true).instance(0)).scrollIntoView(new UiSelector().description(\"outlined-delete-icon\"))")
    @iOSXCUITFindBy(accessibility = "removeFromWallet")
    private WebElement removeFromWalletButton;

    @AndroidFindBy(accessibility = "kebabTitle")
    @iOSXCUITFindBy(accessibility = "kebabTitle")
    private WebElement moreOptionsText;

    @AndroidFindBy(accessibility = "viewActivityLog")
    @iOSXCUITFindBy(accessibility = "viewActivityLog")
    private WebElement viewActivityLogButton;

    @AndroidFindBy(accessibility = "pinOrUnPinCard")
    @iOSXCUITFindBy(accessibility = "pinOrUnPinCard")
    private WebElement pinOrUnPinCardButton;

    @AndroidFindBy(accessibility = "pendingActivationOrActivated")
    @iOSXCUITFindBy(accessibility = "pendingActivationOrActivated")
    private WebElement activationPending;

    @AndroidFindBy(accessibility = "wallet-activated-icon")
    @iOSXCUITFindBy(accessibility = "wallet-activated-icon")
    private WebElement activatedForOnlineLoginButton;

    @AndroidFindBy(accessibility = "close")
    @iOSXCUITFindBy(accessibility = "close")
    private WebElement closeButton;

    @AndroidFindBy(uiAutomator = "new UiSelector().textContains(\"Something is wrong. Please try again later!\")")
    @iOSXCUITFindBy(accessibility = "walletBindingErrorTitle")
    public WebElement somethingIsWrongPopup;

    @AndroidFindBy(accessibility = "activated")
    @iOSXCUITFindBy(accessibility = "activated")
    private WebElement activated;

    @AndroidFindBy(accessibility = "enableVerification")
    @iOSXCUITFindBy(accessibility = "enableVerification")
    private WebElement enableVerification;

    @AndroidFindBy(accessibility = "shareVcWithSelfieFromKebab")
    @iOSXCUITFindBy(accessibility = "shareVcWithSelfieFromKebab")
    private WebElement shareVcWithSelfieFromKebab;


    public MoreOptionsPage(AppiumDriver driver) {
        super(driver);
    }

    public boolean isMoreOptionsPageLoaded() {
        return isElementVisible(moreOptionsText, "Checking if 'More Options' page is loaded");
    }

    public PleaseConfirmPopupPage clickOnRemoveFromWallet() {
        IosUtil.scrollToElement(driver, 59, 755, 119, 20);
        click(removeFromWalletButton, "Clicking on 'Remove from Wallet' button");
        return new PleaseConfirmPopupPage(driver);
    }

    public void clickOnPinOrUnPinCard() {
        click(pinOrUnPinCardButton, "Clicking on 'Pin/Unpin Card' button");
    }

    public HistoryPage clickOnViewActivityLog() {
        IosUtil.scrollToElement(driver, 171, 2149, 625, 1944);
        click(viewActivityLogButton, "Clicking on 'View Activity Log' button");
        return new HistoryPage(driver);
    }

    public PleaseConfirmPopupPage clickOnActivationPending() {
        click(activationPending, "Clicking on 'Activation Pending' card");
        return new PleaseConfirmPopupPage(driver);
    }

    public boolean isVcActivatedForOnlineLogin() {
        return isElementVisible(activatedForOnlineLoginButton, "Checking if VC is activated for online login");
    }

    public HomePage clickOnCloseButton() {
        click(closeButton, "Clicking on 'Close' button from More Options page");
        return new HomePage(driver);
    }

    public boolean isSomethingIsWrongPopupVisible() {
        return isElementVisible(somethingIsWrongPopup, "Checking if 'Something went wrong' popup is displayed");
    }

    public boolean isVcActivatedDisplayed() {
        return isElementVisible(activatedForOnlineLoginButton, "Checking if VC is shown as activated");
    }

    public void clickOnActivationButton() {
        click(enableVerification, "Clicking on 'Enable Verification' button");
    }

    public void clickOnDetailsViewActivationButton() {
        click(activationPending, "Clicking on 'Activation Pending' from details view");
    }

    public void clickOnShareVcWithSelfieFromKebabButton() {
        click(shareVcWithSelfieFromKebab, "Clicking on 'Share VC with Selfie' from kebab menu");
    }
}