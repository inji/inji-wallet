package inji.pages;

import inji.utils.IosUtil;
import io.appium.java_client.AppiumDriver;
import io.appium.java_client.pagefactory.AndroidFindBy;
import io.appium.java_client.pagefactory.iOSXCUITFindBy;
import org.openqa.selenium.WebElement;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;

public class SettingsPage extends BasePage {

    @AndroidFindBy(accessibility = "settingsScreen")
    @iOSXCUITFindBy(accessibility = "settingsScreen")
    private WebElement settingsTittle;

    @AndroidFindBy(accessibility = "logout")
    @iOSXCUITFindBy(accessibility = "Logout")
    private WebElement logoutButton;

    @AndroidFindBy(accessibility = "languageTitle")
    @iOSXCUITFindBy(accessibility = "languageTitle")
    private WebElement languageButton;

    @iOSXCUITFindBy(accessibility = "لغة")
    private WebElement languageButtonInArabic;

    @AndroidFindBy(accessibility = "fil")
    @iOSXCUITFindBy(accessibility = "fil")
    private WebElement filipinoLanguageButton;

    @AndroidFindBy(accessibility = "en")
    @iOSXCUITFindBy(accessibility = "en")
    private WebElement englishLanguageButton;

    @AndroidFindBy(accessibility = "hi")
    @iOSXCUITFindBy(accessibility = "hi")
    private WebElement hindiLanguageButton;

    @AndroidFindBy(accessibility = "ta")
    @iOSXCUITFindBy(accessibility = "ta")
    private WebElement tamilLanguageButton;

    @AndroidFindBy(accessibility = "kn")
    @iOSXCUITFindBy(accessibility = "kn")
    private WebElement kannadaLanguageButton;

    @AndroidFindBy(xpath = "//*[contains(@text,'Wika')]")
    @iOSXCUITFindBy(accessibility = "languageTitle")
    private WebElement wikaButton;

    @AndroidFindBy(uiAutomator = "new UiSelector().resourceId(\"listItemTitle\")")
//    @iOSXCUITFindBy(accessibility = "languages")
    @iOSXCUITFindBy(xpath = "//XCUIElementTypeOther[@name='languages']/XCUIElementTypeOther")
    private List<WebElement> languages;

    @AndroidFindBy(accessibility = "aboutInjiTitle")
    @iOSXCUITFindBy(accessibility = "aboutInjiTitle")
    private WebElement aboutInji;

    @AndroidFindBy(xpath = "//*[contains(@text,'Tuvali-version:')]")
    @iOSXCUITFindBy(xpath = "//*[contains(@name,'Tuvali-version:')]")
    private WebElement tuvaliVersion;

    @AndroidFindBy(accessibility = "injiTourGuide")
    @iOSXCUITFindBy(accessibility = "injiTourGuide")
    private WebElement injiTourGuide;

    @AndroidFindBy(accessibility = "receivedCards")
    @iOSXCUITFindBy(accessibility = "injiTourGuide")
    private WebElement receivedCards;

    @AndroidFindBy(accessibility = "credentialRegistryTitle")
    @iOSXCUITFindBy(accessibility = "credentialRegistryTitle")
    public WebElement credentialRegistryText;

    @AndroidFindBy(accessibility = "receiveCard")
    public WebElement receiveCardText;

    @AndroidFindBy(xpath = "//*[contains(@text,'Tumanggap ng Card')]")
    public WebElement receiveCardInfilipinoLanguageText;

    @AndroidFindBy(accessibility = "ar")
    @iOSXCUITFindBy(accessibility = "ar")
    private WebElement arabicLanguageButton;

    @AndroidFindBy(accessibility = "arrowLeft")
    @iOSXCUITFindBy(accessibility = "arrowLeft")
    private WebElement backButton;

    @AndroidFindBy(accessibility = "dataBackupAndRestore")
    private WebElement dataBackupAndRestore;

    @AndroidFindBy(accessibility = "newLabel")
    private WebElement newlable;

    @AndroidFindBy(accessibility = "keyManagement")
    private WebElement keyManagement;

    public SettingsPage(AppiumDriver driver) {
        super(driver);
    }

    public boolean isSettingPageLoaded() {
        return isElementVisible(settingsTittle, "Checking if Settings page title is visible");
    }

    public boolean isSettingPageLoadedInFilipion() {
        return isElementVisible(settingsTittle, "Checking if Settings page title is visible in Filipino");
    }

    public UnlockApplicationPage clickOnLogoutButton() {
        IosUtil.scrollToElement(driver, 100, 800, 100, 200);
        click(logoutButton, "Clicking on Logout button");
        return new UnlockApplicationPage(driver);
    }

    public SettingsPage clickOnLanguage() {
        click(languageButton, "Clicking on Language button");
        return this;
    }

    public void clickOnEnglishLanguage() {
        click(englishLanguageButton, "Clicking on English Language button");
    }

    public void clickOnFilipinoLanguage() {
        click(filipinoLanguageButton, "Clicking on Filipino Language button");
    }

    public void clickOnTamilLanguage() {
        click(tamilLanguageButton, "Clicking on Tamil Language button");
    }

    public void clickOnHindiLanguage() {
        click(hindiLanguageButton, "Clicking on Hindi Language button");
    }

    public void clickOnKannadaLanguage() {
        click(kannadaLanguageButton, "Clicking on Kannada Language button");
    }

    public boolean verifyFilipinoLanguage() {
        return isElementVisible(wikaButton, "Verifying if Wika button is visible for Filipino language");
    }

    public boolean verifyTamilLanguage() {
        return isElementVisible(languageButton, "Verifying if Language button is visible for Tamil language");
    }

    public boolean verifyHindiLanguage() {
        return isElementVisible(languageButton, "Verifying if Language button is visible for Hindi language");
    }

    public boolean verifyKannadaLanguage() {
        return isElementVisible(languageButton, "Verifying if Language button is visible for Kannada language");
    }

    public boolean verifyLanguagesInLanguageFilter(String os) {
        List<String> expectedLanguages;

        if (os.equalsIgnoreCase("IOS")) {
            expectedLanguages = Arrays.asList("English", "Filipino", "عربى", "हिंदी", "ಕನ್ನಡ", "தமிழ்");
        } else if (os.equalsIgnoreCase("ANDROID")) {
            expectedLanguages = Arrays.asList("English", "Filipino", "عربى", "हिंदी", "ಕನ್ನಡ", "தமிழ்");
        } else {
            throw new IllegalArgumentException("Unsupported OS: " + os);
        }

        List<String> actualLanguages = languages.stream()
                .map(WebElement::getText)
                .map(text -> text.replaceAll("[^\\p{L}\\p{M}\\s]", "").trim())
                .toList();

        return new HashSet<>(expectedLanguages).equals(new HashSet<>(actualLanguages));
    }

    public SettingsPage clickOnAboutInji() {
        click(aboutInji, "Clicking on About Inji option");
        return this;
    }

    public boolean isTuvaliVersionPresent() {
        return isElementVisible(tuvaliVersion, "Checking if Tuvali version is displayed");
    }

    public void clickOnInjiTourGuide() {
        click(injiTourGuide, "Clicking on Inji Tour Guide");
    }

    public boolean isReceivedCardsPresent() {
        return isElementVisible(receivedCards, "Checking if Received Cards section is visible");
    }

    public CredentialRegistryPage clickOnCredentialRegistry() {
        click(credentialRegistryText, "Clicking on Credential Registry");
        return new CredentialRegistryPage(driver);
    }

    public ReceiveCardPage clickOnReceiveCard() {
        click(receiveCardText, "Clicking on Receive Card");
        return new ReceiveCardPage(driver);
    }

    public ReceiveCardPage clickOnReceiveCardFilipinoLanguage() {
        click(receiveCardInfilipinoLanguageText, "Clicking on Receive Card (Filipino Language)");
        return new ReceiveCardPage(driver);
    }

    public AboutInjiPage clickOnAbouInji() {
        click(aboutInji, "Clicking on About Inji");
        return new AboutInjiPage(driver);
    }

    public SettingsPage clickOnBackArrow() {
        click(backButton, "Clicking on Back Arrow");
        return this;
    }

    public UnlockApplicationPage clickOnlanguageButtonInArabic() {
        click(languageButtonInArabic, "Clicking on Language Button in Arabic");
        return new UnlockApplicationPage(driver);
    }

    public UnlockApplicationPage clickOnArabicLanguageButton() {
        click(arabicLanguageButton, "Clicking on Arabic Language Button");
        return new UnlockApplicationPage(driver);
    }

    public boolean isDataBackupAndRestoreDisplayed() {
        return isElementVisible(dataBackupAndRestore, "Checking if Data Backup and Restore option is visible");
    }

    public BackupAndRestorePage clickOnDataBackupAndRestoreButton() {
        click(dataBackupAndRestore, "Clicking on Data Backup and Restore button");
        return new BackupAndRestorePage(driver);
    }

    public boolean isNewLableDisplayed() {
        return isElementVisible(newlable, "Checking if 'New' label is displayed");
    }

    public String getDataBackupAndRestoreText() {
        return getText(dataBackupAndRestore); // Consider adding description if `getText()` supports it
    }

    public String getReceiveCardText() {
        return getText(receiveCardText); // Consider adding description if `getText()` supports it
    }

    public KeyManagementPage clickOnKeyManagement() {
        click(keyManagement, "Clicking on Key Management");
        return new KeyManagementPage(driver);
    }
}