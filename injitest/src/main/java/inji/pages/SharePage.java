package inji.pages;

import io.appium.java_client.AppiumDriver;
import io.appium.java_client.pagefactory.AndroidFindBy;
import io.appium.java_client.pagefactory.iOSXCUITFindBy;
import org.openqa.selenium.WebElement;

public class SharePage extends BasePage {

    @AndroidFindBy(accessibility = "camera")
    private WebElement camera;

    @AndroidFindBy(uiAutomator = "new UiSelector().textContains(\"Bluetooth\")")
    private WebElement bluetoothPopUp;

    @AndroidFindBy(id = "com.android.permissioncontroller:id/permission_allow_button")
    @iOSXCUITFindBy(accessibility = "OK")
    private WebElement nearbyAllowButton;

    @AndroidFindBy(id = "android:id/button1")
    @iOSXCUITFindBy(accessibility = "OK")
    private WebElement bluetoothTurnOn;

    @AndroidFindBy(xpath = "//android.widget.Button[@resource-id=\"com.android.permissioncontroller:id/permission_allow_foreground_only_button\"]")
    @iOSXCUITFindBy(accessibility = "OK")
    private WebElement cameraPopupAndroid;

    @AndroidFindBy(id = "com.android.permissioncontroller:id/permission_deny_button")
    private WebElement denyButton;

    @AndroidFindBy(accessibility = "noShareableVcs")
    @iOSXCUITFindBy(accessibility = "noShareableVcs")
    private WebElement noShareableCards;

    @AndroidFindBy(accessibility = "flipCameraIcon")
    @iOSXCUITFindBy(accessibility = "Flip Camera")
    private WebElement flipCamera;

    @AndroidFindBy(accessibility = "holdPhoneSteadyMessage")
    @iOSXCUITFindBy(accessibility = "holdPhoneSteadyMessage")
    private WebElement holdCameraSteady;

    @iOSXCUITFindBy(accessibility = "enableBluetoothButton")
    private WebElement enableBluetoothButton;

    @AndroidFindBy(accessibility = "bluetoothIsTurnedOffMessage")
    private WebElement bluetoothIsTurnedOffMessage;

    @iOSXCUITFindBy(iOSClassChain = "**/XCUIElementTypeStaticText[`name == \"“Inji” Would Like to Use Bluetooth\"`]")
    private WebElement bluetoothPopUpIos;

    @iOSXCUITFindBy(iOSClassChain = "**/XCUIElementTypeStaticText[`name == \"“Inji” Would Like to Access the Camera\"`]")
    private WebElement cameraPopUpIos;

    @iOSXCUITFindBy(accessibility = "OK")
    private WebElement okButtonIos;

    @iOSXCUITFindBy(xpath = "//*[@name=\"Allow\"]")
    private WebElement AllowButtonIos;

    @iOSXCUITFindBy(accessibility = "Don’t Allow")
    @AndroidFindBy(xpath = "//android.widget.Button[@resource-id=\"com.android.permissioncontroller:id/permission_deny_button\"]")
    private WebElement dontAllowButtonIos;

    @AndroidFindBy(accessibility = "cameraAccessDisabled")
    @iOSXCUITFindBy(accessibility = "cameraAccessDisabled")
    private WebElement cameraAccessDisabledPopup;

    @AndroidFindBy(xpath = "//*[@resource-id=\"com.android.permissioncontroller:id/permission_allow_one_time_button\"]")
    private WebElement locationAccessPopup;

    @AndroidFindBy(xpath = "//*[@resource-id=\"com.android.permissioncontroller:id/permission_allow_one_time_button\"]")
    private WebElement gallaryAccessPopup;

    @AndroidFindBy(xpath = "//android.widget.TextView[@resource-id=\"close\"]")
    private WebElement closePopupButton;

    @AndroidFindBy(xpath = "//android.widget.Button[@resource-id=\"com.android.permissioncontroller:id/permission_deny_button\"]")
    @iOSXCUITFindBy(accessibility = "Don’t Allow")
    private WebElement cameraDontAllowAccessPopup;

    @AndroidFindBy(accessibility = "holdPhoneSteadyMessage")
    @iOSXCUITFindBy(accessibility = "cameraAccessDisabled")
    private WebElement cameraDisabledToaster;

    @AndroidFindBy(xpath = "//android.widget.TextView[@resource-id=\"close\"]")
    @iOSXCUITFindBy(accessibility = "close")
    private WebElement cameraDisabledToasterClose;

    @AndroidFindBy(accessibility = "sharingStatusTitle")
    @iOSXCUITFindBy(accessibility = "sharingStatusTitle")
    private WebElement cameraAccessLostPage;

    @AndroidFindBy(accessibility = "allowNearbyDevicesPermissionButton")
    @iOSXCUITFindBy(accessibility = "allowNearbyDevicesPermissionButton")
    private WebElement allowNearbyDevicesButton;

    @AndroidFindBy(xpath = "//*[contains(@text,'CONTINUE')]")
    @iOSXCUITFindBy(xpath = "//*[contains(@text,'CONTINUE')]")
    private WebElement continuePopupButton;

    public SharePage(AppiumDriver driver) {
        super(driver);
    }

    public SharePage acceptPermissionPopupBluetooth() {
        click(nearbyAllowButton, "Click on Nearby Allow Button");
        click(bluetoothTurnOn, "Click on Bluetooth Turn On Button");
        return this;
    }

    public SharePage acceptPermissionPopupCamera() {
        click(cameraPopupAndroid, "Click on Camera Permission Popup (Android)");
        return this;
    }

    public SharePage acceptPermissionPopupBluetoothIos() {
        click(okButtonIos, "Click on OK Button (iOS)");
//        click(AllowButtonIos, "Click on Allow Button (iOS)");
        return this;
    }

    public void acceptPermissionPopupCameraIos() {
        click(continuePopupButton, "Click on Continue Popup Button (iOS)");
        click(okButtonIos, "Click on OK Button (iOS)");
        click(AllowButtonIos, "Click on Allow Button (iOS)");
    }

    public void denyPermissionPopupBluetooth() {
        click(denyButton, "Click on Deny Button for Bluetooth Permission");
    }

    public void denyPermissionPopupBluetoothIos() {
        click(dontAllowButtonIos, "Click on Don't Allow Button (iOS Bluetooth)");
    }

    public SharePage denyPermissionPopupCameraIos() {
        click(dontAllowButtonIos, "Click on Don't Allow Button (iOS Camera)");
        return this;
    }

    public boolean isCameraOpen() {
        return isElementVisible(camera, "Check if Camera is Open");
    }

    public boolean isNoShareableCardsMessageDisplayed() {
        return isElementVisible(noShareableCards, "Check if No Shareable Cards Message is Displayed");
    }

    public boolean isAllowNearbyDevicesButtonDisplayed() {
        return isElementVisible(allowNearbyDevicesButton, "Check if Allow Nearby Devices Button is Displayed");
    }

    public String isBluetoothIsTurnedOffMessageDisplayed() {
        return getText(bluetoothIsTurnedOffMessage, "Get Bluetooth is Turned Off Message");
    }

    public String isEnableBluetoothButtonButtonDisplayed() {
        return getText(enableBluetoothButton, "Get Enable Bluetooth Button Text");
    }

    public boolean isCameraPageLoaded() {
        return isElementEnabled(holdCameraSteady, "Check if Camera Page is Loaded (Hold Camera Steady)");
    }

    public boolean isFlipCameraClickable() {
        return isElementEnabled(flipCamera, "Check if Flip Camera Button is Clickable");
    }

    public void clickOnDenyCameraPopupButton() {
        click(dontAllowButtonIos, "Click on Don't Allow Camera Access Button (iOS)");
    }

    public boolean isCameraDisabledPopUpDisplayed() {
        return isElementVisible(cameraAccessDisabledPopup, "Check if Camera Access Disabled Popup is Displayed");
    }

    public void clickOnPopupCloseButton() {
        click(closePopupButton, "Click on Close Button of Popup");
    }

    public void clickOnAllowLocationPopupButton() {
        click(locationAccessPopup, "Click on Allow Location Popup Button");
    }

    public void clickOnAllowGallaryAccessButton() {
        click(gallaryAccessPopup, "Click on Allow Gallery Access Button");
    }

    public boolean isCameraDisabledToasterLoaded() {
        return isElementVisible(cameraDisabledToaster, "Check if Camera Disabled Toaster is Loaded");
    }

    public void clickOnCameraDisabledToasterClose() {
        click(cameraDisabledToasterClose, "Click on Close Button of Camera Disabled Toaster");
    }

    public void clickOnDontAllowCameraAccessButton() {
        click(cameraDontAllowAccessPopup, "Click on Don't Allow Camera Access Popup");
    }

    public boolean isCameraAccessLostPageLoaded() {
        return isElementVisible(cameraAccessLostPage, "Check if Camera Access Lost Page is Loaded");
    }
}