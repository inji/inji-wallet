package inji.pages;

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
}