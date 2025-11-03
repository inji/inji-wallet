package inji.pages;

import java.time.Duration;
import java.util.Collections;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.PointerInput;
import org.openqa.selenium.interactions.Sequence;
import org.openqa.selenium.remote.RemoteWebDriver;
import inji.utils.AndroidUtil;
import io.appium.java_client.AppiumDriver;
import io.appium.java_client.pagefactory.AndroidFindBy;
import io.appium.java_client.pagefactory.iOSXCUITFindBy;
import org.openqa.selenium.WebElement;


public class ChooseLanguagePage extends BasePage {

    @AndroidFindBy(accessibility = "chooseLanguage")
    @iOSXCUITFindBy(accessibility = "chooseLanguage")
    private WebElement chooseLanguageText;

    @AndroidFindBy(accessibility = "savePreference")
    @iOSXCUITFindBy(accessibility = "savePreference")
    private WebElement savePreferenceText;


    @AndroidFindBy(accessibility = "unlockApplication")
    private WebElement unlockApplications;

    @AndroidFindBy(accessibility = "fil")
    @iOSXCUITFindBy(accessibility = "fil")
    private WebElement filipinoLanguage;

    @AndroidFindBy(accessibility = "hi")
    @iOSXCUITFindBy(accessibility = "hi")
    private WebElement hindiLanguage;

    @AndroidFindBy(accessibility = "kn")
    @iOSXCUITFindBy(accessibility = "kn")
    private WebElement KannadaLanguage;

    @AndroidFindBy(accessibility = "ta")
    @iOSXCUITFindBy(accessibility = "ta")
    private WebElement tamilLanguage;

    @AndroidFindBy(accessibility = "ar")
    @iOSXCUITFindBy(accessibility = "ar")
    private WebElement arabicLanguage;


    public ChooseLanguagePage(AppiumDriver driver) {
        super(driver);
    }

    public boolean isChooseLanguagePageLoaded() {
        boolean temp = isElementVisible(chooseLanguageText);
        if (!temp) {
            AndroidUtil.invokeAppFromBackGroundAndroid();
        }
        return true;
    }

    public WelcomePage clickOnSavePreference() {
        click(savePreferenceText, "Click on 'Save Preference' to confirm language selection");
        return new WelcomePage(driver);
    }

    public void clickOnUnlockApplication() {
        click(unlockApplications, "Click on 'Unlock Application' to proceed to login or onboarding");
    }

    public boolean isUnlockApplicationDisplayed() {
        return isElementVisible(unlockApplications, "Check if 'Unlock Application' option is visible on the screen");
    }

    public void clickOnFilipinoLangauge() {
        click(filipinoLanguage, "Select 'Filipino' as the preferred language");
    }

    public void clickOnHindiLanguage() {
        click(hindiLanguage, "Select 'Hindi' as the preferred language");
    }

    public void clickOnKannadaLanguage() {
        click(KannadaLanguage, "Select 'Kannada' as the preferred language");
    }

    public void clickOnTamilLanguage() {
        click(tamilLanguage, "Select 'Tamil' as the preferred language");
    }

    public void clickOnArabicLanguage() {
        click(arabicLanguage, "Select 'Arabic' as the preferred language");
    }
    public void ScrollRightToLeft() {
    Dimension size = driver.manage().window().getSize();
    int startX = (int) (size.width * 0.9);
    int endX = (int) (size.width * 0.1);
    int y = (int) (size.height * 0.5);
    PointerInput finger = new PointerInput(PointerInput.Kind.TOUCH, "finger");
    Sequence swipe = new Sequence(finger, 1);
    swipe.addAction(finger.createPointerMove(Duration.ZERO, PointerInput.Origin.viewport(), startX, y));
    swipe.addAction(finger.createPointerDown(PointerInput.MouseButton.LEFT.asArg()));
    swipe.addAction(finger.createPointerMove(Duration.ofMillis(500), PointerInput.Origin.viewport(), endX, y));
    swipe.addAction(finger.createPointerUp(PointerInput.MouseButton.LEFT.asArg()));
    ((RemoteWebDriver) driver).perform(Collections.singletonList(swipe)); 
    }
    public void ScrollLeftToright() {
        Dimension size = driver.manage().window().getSize();
    	int startX = (int) (size.width * 0.1);
    	int endX = (int) (size.width * 0.9);
    	int y = (int) (size.height * 0.5);
    	PointerInput finger = new PointerInput(PointerInput.Kind.TOUCH, "finger");
    	Sequence swipe = new Sequence(finger, 1);
    	swipe.addAction(finger.createPointerMove(Duration.ZERO, PointerInput.Origin.viewport(), startX, y));
    	swipe.addAction(finger.createPointerDown(PointerInput.MouseButton.LEFT.asArg()));
    	swipe.addAction(finger.createPointerMove(Duration.ofMillis(500), PointerInput.Origin.viewport(), endX, y));
    	swipe.addAction(finger.createPointerUp(PointerInput.MouseButton.LEFT.asArg()));
    	((RemoteWebDriver) driver).perform(Collections.singletonList(swipe));
}
}
