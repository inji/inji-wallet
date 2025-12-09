package inji.pages;

import inji.utils.IosUtil;
import io.appium.java_client.AppiumDriver;
import io.appium.java_client.pagefactory.AndroidFindBy;
import io.appium.java_client.pagefactory.iOSXCUITFindBy;
import org.openqa.selenium.WebElement;

import java.util.Arrays;
import java.util.List;

public class KeyManagementPage extends BasePage {
    @AndroidFindBy(accessibility = "copilot-next-action")
    @iOSXCUITFindBy(accessibility = "copilot-next-action")
    private WebElement stepCountButton;

    @AndroidFindBy(accessibility = "saveKeyOrderingPreference")
    @iOSXCUITFindBy(accessibility = "saveKeyOrderingPreference")
    private WebElement saveKeyOrderingPreference;

    @AndroidFindBy(accessibility = "keyOrderingSuccessText")
    @iOSXCUITFindBy(accessibility = "keyOrderingSuccessText")
    private WebElement keyOrderingSuccessText;

    @AndroidFindBy(accessibility = "arrow-left")
    @iOSXCUITFindBy(accessibility = "arrow-left")
    private WebElement arrowleftButton;

    @AndroidFindBy(xpath = "//android.widget.TextView[@resource-id=\"listItemTitle\" and @text=\"RSA\"]")
    @iOSXCUITFindBy(xpath = "(//XCUIElementTypeOther[@name=\"RSA \uE25D\"])[2]")
    private WebElement RSAText;

    @AndroidFindBy(xpath = "//android.widget.TextView[@resource-id=\"listItemTitle\" and @text=\"ED25519\"]")
    @iOSXCUITFindBy(xpath = "(//XCUIElementTypeOther[@name=\"ED25519 \uE25D\"])[2]")
    private WebElement ED25519Text;

    @AndroidFindBy(xpath = "//android.widget.TextView[@resource-id=\"listItemTitle\" and @text=\"ECC R1\"]")
    @iOSXCUITFindBy(xpath = "(//XCUIElementTypeOther[@name=\"ED25519 \uE25D\"])[2]")
    private WebElement ECCR1Text;

    @AndroidFindBy(xpath = "//android.widget.TextView[@resource-id=\"listItemTitle\" and @text=\"ECC K1\"]")
    @iOSXCUITFindBy(xpath = "(//XCUIElementTypeOther[@name=\"ED25519 \uE25D\"])[2]")
    private WebElement ECCK1Text;

    @AndroidFindBy(accessibility = "keyTypeVcDetailViewValue")
    @iOSXCUITFindBy(accessibility = "saveKeyOrderingPreference")
    private WebElement keyTypeVcDetailViewValue;

    @AndroidFindBy(accessibility = "goBack")
    @iOSXCUITFindBy(accessibility = "goBack")
    private WebElement goBackbutton;

    @AndroidFindBy(accessibility = "close")
    @iOSXCUITFindBy(accessibility = "close")
    private WebElement closeButton;

    public KeyManagementPage(AppiumDriver driver) {
        super(driver);
    }

    public boolean isDoneButtonDisplayed() {
        return isElementVisible(stepCountButton, "Checking if Done button (step count button) is displayed");
    }

    public void clickOnDoneButton() {
        click(stepCountButton, "Clicking on the Done button (step count button)");
    }

    public WebElement getTheCoordinatesForRSA() {
        RSAText.isDisplayed(); // this should ideally be replaced with isElementVisible or a proper wait
        return RSAText;
    }

    public WebElement getTheCoordinatesED25519Text() {
        ED25519Text.isDisplayed(); // same as above
        return ED25519Text;
    }

    public WebElement getTheCoordinatesECCR1TextText() {
        ECCR1Text.isDisplayed(); // same as above
        return ECCR1Text;
    }

    public void clickOnSaveKeyOrderingPreferenceButton() {
        click(saveKeyOrderingPreference, "Clicking on Save Key Ordering Preference button");
    }

    public void clickOnArrowleftButton() {
        click(arrowleftButton, "Clicking on the left arrow button");
    }

    public WebElement getTheCoordinatesECCk1TextText() {
        ECCK1Text.isDisplayed();
        return ECCK1Text;
    }

    public void clickOnGoBackButton() {
        click(goBackbutton, "Clicking on the Go Back button");
    }

    public void clickOnCloseButton() {
        click(closeButton, "Clicking on the success message button");
    }

    public boolean iskeyOrderingSuccessTextMessageDisplayed() {
        return isElementVisible(keyOrderingSuccessText, "Checking if key ordering success message is displayed");
    }

    public String getPKeyTypeVcDetailViewValueSunbirdCard() {
        IosUtil.scrollToElement(driver, 100, 800, 100, 200);
        return getText(keyTypeVcDetailViewValue, "Getting text of Public Key Type in VC Detail View (Sunbird Card)");
    }

    public boolean compareListOfKeys() {
        List<String> stringList = Arrays.asList("ED25519", "ES256K", "ES256", "RS256");
        String str = getPKeyTypeVcDetailViewValueSunbirdCard();

        for (String key : stringList) {
            if (str.equals(key)) {
                return true;
            }
        }
        return false;
    }
}