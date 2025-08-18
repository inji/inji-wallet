package inji.pages;

import inji.constants.PlatformType;
import io.appium.java_client.AppiumDriver;
import io.appium.java_client.pagefactory.AndroidFindBy;
import io.appium.java_client.pagefactory.iOSXCUITFindBy;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import java.util.List;

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
        return isElementVisible(setPasscodeHeader, "Check if 'Set Passcode' page header is visible");
    }

    public ConfirmPasscode enterPasscode(String passcode, PlatformType os) {
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

    public ConfirmPasscode enterPasscodeotp(String passcode, PlatformType os) {
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

    public void enterPasscodeForEsignet(String passcode, PlatformType os) {
        char[] array = passcode.toCharArray();
        switch (os) {
            case ANDROID:
                enterOtpAndroidForeSignet(array);
                break;
            case IOS:
                enterOtpIosForeSignet(array);
                break;
        }
        new ConfirmPasscode(driver);
    }

    private void enterOtpAndroid(char[] otpDigits) {
        List<WebElement> passcodeInputs = waitForAllInputs(By.className("android.widget.EditText"), otpDigits.length);

        if (passcodeInputs.size() < otpDigits.length) {
            throw new IllegalStateException("Not enough input fields to enter passcode");
        }

        for (int i = 0; i < otpDigits.length; i++) {
//            WebElement input = passcodeInputs.get(i);
//            waitUntilElementIsVisible(input, 5);
            passcodeInputs.get(i).sendKeys(String.valueOf(otpDigits[i]));
        }
    }

    private void enterOtpIos(char[] otpDigits) {
        List<WebElement> passcodeInputs = waitForAllInputs(By.xpath("//*[@type='XCUIElementTypeSecureTextField']"), otpDigits.length);


        if (passcodeInputs.size() < otpDigits.length) {
            throw new IllegalStateException("Not enough input fields to enter passcode on iOS.");
        }

        for (int i = 0; i < otpDigits.length; i++) {
//            WebElement input = passcodeInputs.get(i);
//            waitUntilElementIsVisible(input, 5);
            passcodeInputs.get(i).sendKeys(String.valueOf(otpDigits[i]));
        }
    }

    private void enterOtpAndroidotp(char[] arr) {
        for (int i = 1; i <= 6; i++) {
            String locator = "(//*[@resource-id=\"otp_verify_input\"]/android.view.View/android.widget.EditText[" + i + "])";
            driver.findElement(By.xpath(locator)).sendKeys(String.valueOf(arr[i - 1]));
        }
    }

    private void enterOtpIosForeSignet(char[] arr) {
        String baseXpath = isElementVisible(inputOtp)
                ? "//XCUIElementTypeOther[@name=\"eSignet\"]/XCUIElementTypeOther[6]/XCUIElementTypeTextField"
                : "//XCUIElementTypeOther[@name=\"eSignet\"]/XCUIElementTypeOther[7]/XCUIElementTypeTextField";

        List<WebElement> fields = driver.findElements(By.xpath(baseXpath));

        if (fields.size() < arr.length) {
            throw new IllegalStateException("Not enough input fields to enter OTP on iOS eSignet.");
        }

        for (int i = 0; i < arr.length; i++) {
            fields.get(i).sendKeys(String.valueOf(arr[i]));
        }
    }

    private void enterOtpAndroidForeSignet(char[] arr) {
        String baseXpath = isElementVisible(inputOtp)
                ? "//android.view.View[contains(@resource-id, \"otp_verify_input\")]//android.widget.EditText"
                : "//*[@class='android.widget.EditText']";

        List<WebElement> fields = driver.findElements(By.xpath(baseXpath));

        if (fields.size() < arr.length) {
            throw new IllegalStateException("Not enough input fields to enter OTP on Android Esignet.");
        }

        // In the else branch of original logic, indexing started from 2nd element
        int startIndex = isElementVisible(inputOtp) ? 0 : 2;

        for (int i = 0; i < arr.length; i++) {
            fields.get(i + (startIndex - (isElementVisible(inputOtp) ? 0 : 2))).sendKeys(String.valueOf(arr[i]));
        }
    }

    private void clickOnDoneButton() {
        click(doneButton, "Click on 'Done' button after entering passcode");
    }
}