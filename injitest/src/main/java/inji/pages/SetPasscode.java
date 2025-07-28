package inji.pages;

import inji.constants.Target;
import io.appium.java_client.AppiumDriver;
import io.appium.java_client.pagefactory.AndroidFindBy;
import io.appium.java_client.pagefactory.iOSXCUITFindBy;
import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebElement;

public class SetPasscode extends BasePage {

    @iOSXCUITFindBy(accessibility = "setPasscodeHeader")
    @AndroidFindBy(xpath = "//*[contains(@text,'Set Passcode')]")
    private WebElement setPasscodeHeader;

    @iOSXCUITFindBy(accessibility = "Done")
    private WebElement doneButton;

    @AndroidFindBy(xpath = "//android.view.View[contains(@resource-id, \"otp_verify_input\")]//android.widget.EditText[1]")
    @iOSXCUITFindBy(xpath = "//XCUIElementTypeOther[@name=\"eSignet\"]/XCUIElementTypeOther[6]/XCUIElementTypeTextField[1]")
    private WebElement inputOtp;


    public SetPasscode(AppiumDriver driver) {
        super(driver);
    }

    public boolean isSetPassCodePageLoaded() {
        return this.isElementDisplayed(setPasscodeHeader);
    }

    public ConfirmPasscode enterPasscode(String passcode, Target os) {
        char[] arr = passcode.toCharArray();
        switch (os) {
            case ANDROID:
                enterOtpAndroid(arr);
                break;
            case IOS:
                enterOtpIos(arr);
                break;
        }
        return new ConfirmPasscode(driver);
    }

    public ConfirmPasscode enterPasscodeotp(String passcode, Target os) {
        char[] arr = passcode.toCharArray();
        switch (os) {
            case ANDROID:
                enterOtpAndroidotp(arr);
                break;
            case IOS:
                enterOtpIos(arr);
                break;
        }
        return new ConfirmPasscode(driver);
    }

    public void enterPasscodeForEsignet(String passcode, Target os) {
        char[] array = passcode.toCharArray();
        switch (os) {
            case ANDROID:
                enterOtpAndroidForEsignet(array);
                break;
            case IOS:
                enterOtpIosForEsignet(array);
                break;
        }
        new ConfirmPasscode(driver);
    }

    private void enterOtpAndroid(char[] arr) {
        for (int i = 1; i <= 6; i++) {
            String locator = "(//*[@class='android.widget.EditText'])[" + i + "]";
            driver.findElement(By.xpath(locator)).sendKeys(String.valueOf(arr[i - 1]));
        }
    }

    private void enterOtpIos(char[] arr) {
        for (int i = 1; i <= 6; i++) {
            String locator = "(//*[@type='XCUIElementTypeSecureTextField'])[" + i + "]";
            driver.findElement(By.xpath(locator)).sendKeys(String.valueOf(arr[i - 1]));
        }
    }

    private void enterOtpAndroidotp(char[] arr) {
        for (int i = 1; i <= 6; i++) {
            String locator = "(//*[@resource-id=\"otp_verify_input\"]/android.view.View/android.widget.EditText[" + i + "])";
            driver.findElement(By.xpath(locator)).sendKeys(String.valueOf(arr[i - 1]));
        }
    }

    private void enterOtpIosForEsignet(char[] arr) {
        if (isElementDisplayed(inputOtp)) {
            for (int i = 1; i <= 6; i++) {
                String locator = "//XCUIElementTypeOther[@name=\"eSignet\"]/XCUIElementTypeOther[6]/XCUIElementTypeTextField[" + i + "]";
                driver.findElement(By.xpath(locator)).sendKeys(String.valueOf(arr[i - 1]));
            }
        } else {
            for (int i = 1; i <= 6; i++) {
                String locator = "//XCUIElementTypeOther[@name=\"eSignet\"]/XCUIElementTypeOther[7]/XCUIElementTypeTextField[" + i + "]";
                driver.findElement(By.xpath(locator)).sendKeys(String.valueOf(arr[i - 1]));

            }
        }
    }

    private void clickOnDoneButton() {
        if (isElementDisplayed(doneButton, 3)) {
            clickOnElement(doneButton);
        }
    }
    private void enterOtpAndroidForEsignet(char[] arr) {
        if (isElementDisplayed(inputOtp)) {
            for (int i = 1; i <= 6; i++) {
                String locator = "//android.view.View[contains(@resource-id, \"otp_verify_input\")]//android.widget.EditText[" + i + "]";
                driver.findElement(By.xpath(locator)).sendKeys(String.valueOf(arr[i - 1]));
            }
        } else {
            for (int i = 2; i <= 8; i++) {
                int index = i - 2;
                if (index < arr.length) {
                    String locator = "(//*[@class='android.widget.EditText'])[" + i + "]";
                    driver.findElement(By.xpath(locator)).sendKeys(String.valueOf(arr[index]));
                }
            }
        }
    }
}