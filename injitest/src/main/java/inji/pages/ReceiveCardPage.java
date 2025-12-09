package inji.pages;

import io.appium.java_client.AppiumDriver;
import io.appium.java_client.pagefactory.AndroidFindBy;
import org.openqa.selenium.WebElement;

public class ReceiveCardPage extends BasePage {
    @AndroidFindBy(uiAutomator = "new UiSelector().textContains(\"Allow\")")
    private WebElement allowButton;

    @AndroidFindBy(accessibility = "showQrCode")
    private WebElement receiveCardHeader;

    @AndroidFindBy(uiAutomator = "new UiSelector().textContains(\"Ipakita ang QR code na ito para humiling ng resident card\")")
    private WebElement receiveCardHeaderInFilipinoLanguage;

    @AndroidFindBy(accessibility = "qrCode")
    private WebElement qrCode;

    @AndroidFindBy(accessibility = "receiveCardStatusMessage")
    private WebElement waitingForConnection;

    @AndroidFindBy(uiAutomator = "new UiSelector().resourceId(\"com.oplus.wirelesssettings:id/alertTitle\")")
    private WebElement bluetoothPopUp;

    @AndroidFindBy(id = "com.android.permissioncontroller:id/permission_allow_button")
    private WebElement nearbyAllowButton;

    public ReceiveCardPage(AppiumDriver driver) {
        super(driver);
    }

    public void clickOnAllowButton() {
        click(nearbyAllowButton, "Click on Nearby Devices Allow button");
        click(allowButton, "Click on Location Allow button");
    }

    public boolean isReceiveCardHeaderDisplayed() {
        return isElementVisible(receiveCardHeader, "Verify 'Receive Card' header is displayed");
    }

    public boolean isReceiveCardHeaderInFilipinoLanguageDisplayed() {
        return isElementVisible(receiveCardHeaderInFilipinoLanguage, "Verify 'Receive Card' header is displayed in Filipino language");
    }

    public boolean isWaitingForConnectionDisplayed() {
        return isElementVisible(waitingForConnection, "Verify 'Waiting for connection' message is displayed");
    }

    public boolean isQrCodeEnabled() {
        return isElementEnabled(qrCode, "Verify QR code is enabled and visible");
    }

}