package androidTestCases;

import BaseTest.AndroidBaseTest;
import inji.api.BaseTestCase;
import inji.constants.Target;
import inji.pages.*;
import inji.utils.TestDataReader;
import org.testng.annotations.Test;
import org.testng.asserts.SoftAssert;

import static inji.api.AdminTestUtil.fullName;
import static inji.api.AdminTestUtil.policyNumber;
import static inji.api.BaseTestCase.uin;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

public class ChangeLanguageTest extends AndroidBaseTest {
    @Test
    public void changeLanguage() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), Target.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), Target.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnLanguage().clickOnFilipinoLanguage();

        assertTrue(settingsPage.verifyFilipinoLanguage(), "Verify if language is changed to filipino");
    }

    @Test
    public void languageShouldBeInNativeLanguages() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), Target.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), Target.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnLanguage();

        assertTrue(settingsPage.verifyLanguagesInLanguageFilter("ANDROID"), "Verify if all languages are shown in language filter");
    }

    @Test
    public void verifyTuvaliVersion() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), Target.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), Target.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        assertTrue(settingsPage.clickOnAboutInji().isTuvaliVersionPresent());
    }

    @Test
    public void changeLanguageToArabic() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), Target.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), Target.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        UnlockApplicationPage unlockApplicationPage = settingsPage.clickOnLanguage().clickOnArabicLanguageButton();

        assertTrue(unlockApplicationPage.isUnlockApplicationPageLoadedInArabic(), "Verify if language is changed to arabic");
        unlockApplicationPage.clickOnUnlockApplicationButton();
        setPasscode.enterPasscode(TestDataReader.readData("passcode"), Target.ANDROID);
        HistoryPage historyPage = homePage.clickOnHistoryButton();

        assertTrue(historyPage.noHistoryAvailable(),"verify no history available in arabic");
    }

    @Test
    public void changeLanguageToFilipionAndSearchIssuer() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), Target.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), Target.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnLanguage().clickOnFilipinoLanguage();

        assertTrue(settingsPage.verifyFilipinoLanguage(), "Verify if language is changed to filipino");
        homePage.clickOnHomeButton();

        assertEquals(homePage.verifyLanguageForNoVCDownloadedPageLoaded(),"Dalhin ang Iyong Digital ID");
        AddNewCardPage addNewCardPage = homePage.downloadCard();

        assertEquals(addNewCardPage.verifyLanguageForAddNewCardGuideMessage(),"Mangyaring piliin ang iyong gustong tagabigay mula sa mga opsyon sa ibaba upang magdagdag ng bagong card.");
        assertTrue(addNewCardPage.isIssuerSearchBarDisplayedInFilipino(),"verify if search bar is displayed in filipino");
        addNewCardPage.sendTextInIssuerSearchBar("I-download ang Mga Kredensyal ng MOSIP ");

        assertTrue(addNewCardPage.isDownloadViaUinDisplayed(),"verify if download via uin vid aid");
        addNewCardPage.clickOnBack();

        homePage.downloadCard();
        addNewCardPage.sendTextInIssuerSearchBar("I-download ang Mga Kredensyal ng MOSIP");
        assertTrue(addNewCardPage.isDownloadViaEsignetDisplayed(),"verify if download via e-signet is displayed");
    }

    @Test
    public void changeLanguageToFilipionAndSearchIssuerEnterIncompleteName() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), Target.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), Target.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnLanguage().clickOnFilipinoLanguage();

        assertTrue(settingsPage.verifyFilipinoLanguage(), "Verify if language is changed to filipino");
        homePage.clickOnHomeButton();

        assertEquals(homePage.verifyLanguageForNoVCDownloadedPageLoaded(),"Dalhin ang Iyong Digital ID");
        AddNewCardPage addNewCardPage = homePage.downloadCard();

        assertEquals(addNewCardPage.verifyLanguageForAddNewCardGuideMessage(),"Mangyaring piliin ang iyong gustong tagabigay mula sa mga opsyon sa ibaba upang magdagdag ng bagong card.");
        assertTrue(addNewCardPage.isIssuerSearchBarDisplayedInFilipino(),"verify if search bar is displayed in filipino");
        addNewCardPage.sendTextInIssuerSearchBar("otp");

        assertTrue(addNewCardPage.isDownloadViaUinDisplayed(),"verify if download via uin vid aid");
        addNewCardPage.clickOnBack();

        homePage.downloadCard();
        addNewCardPage.sendTextInIssuerSearchBar("I-download ang");
        assertTrue(addNewCardPage.isDownloadViaEsignetDisplayed(),"verify if download via e-signet is displayed");
    }

    @Test
    public void changeLanguageToHindiAndSearchIssuer() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), Target.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), Target.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnLanguage().clickOnHindiLanguage();

        assertTrue(settingsPage.verifyHindiLanguage(), "Verify if language is changed to hindi");
        homePage.clickOnHomeButton();

        assertEquals(homePage.verifyLanguageForNoVCDownloadedPageLoaded(),"अपनी डिजिटल आईडी लाओ");
        AddNewCardPage addNewCardPage = homePage.downloadCard();

        assertEquals(addNewCardPage.verifyLanguageForAddNewCardGuideMessage(),"नया कार्ड जोड़ने के लिए कृपया नीचे दिए गए विकल्पों में से अपना पसंदीदा जारीकर्ता चुनें।");
        assertTrue(addNewCardPage.isIssuerSearchBarDisplayedInHindi(),"verify if search bar is displayed in hindi");
        addNewCardPage.sendTextInIssuerSearchBar("OTP के माध्यम से MOSIP क्रेडेंशियल डाउनलोड करें");

        assertTrue(addNewCardPage.isDownloadViaUinDisplayedInHindi(),"verify if download via uin vid aid displayed in hindi");
        addNewCardPage.clickOnBack();

        homePage.downloadCard();

        addNewCardPage.sendTextInIssuerSearchBar("MOSIP क्रेडेंशियल डाउनलोड करेंं");
        assertTrue(addNewCardPage.isDownloadViaEsignetDisplayedInHindi(),"verify if download via e-signet is displayed");
    }

    @Test
    public void changeLanguageToFilipionAndcheckInjiTour() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), Target.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), Target.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnLanguage().clickOnFilipinoLanguage();

        assertTrue(settingsPage.verifyFilipinoLanguage(), "Verify if language is changed to filipino");

        settingsPage.clickOnInjiTourGuide();

        assertTrue(homePage.verifyLanguageForHelpAndFrequentlyAskedQuationsHeaderDisplayed("Filipino"), "Verify if help and frequently asked quations header displayed");
        assertTrue(homePage.verifyLanguageForHelpAndFrequentlyAskedQuationsDescriptionDisplayed("Filipino"), "Verify if help and frequently asked quations description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyLanguageForDownloadCardHeaderDisplayed("Filipino"), "Verify if download card header text displayed");
        assertTrue(homePage.verifyLanguageForDownloadCardDescriptionDisplayed("Filipino"), "Verify if download card description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyLanguageForShareCardHeaderDisplayed("Filipino"), "Verify if share card header text displayed");
        assertTrue(homePage.verifyLanguageForShareCardDescriptionDisplayed("Filipino"), "Verify if share card description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyLanguageForAccesstoHistoryHeaderDisplayed("Filipino"), "Verify if access to history header text displayed");
        assertTrue(homePage.verifyLanguageForaccesstoHistoryDescriptionDisplayed("Filipino"), "Verify if access to history description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyLanguageForAppSettingsHeaderDisplayed("Filipino"), "Verify if app settings header text displayed");
        assertTrue(homePage.verifyLanguageForAppSettingsDescriptionDisplayed("Filipino"), "Verify if app settings description displayed");
        homePage.clickOnNextButton();
        assertEquals(homePage.getShareButton(), "Ibahagi");
    }

    @Test
    public void changeLanguageToHindiAndcheckInjiTour() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), Target.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), Target.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnLanguage().clickOnHindiLanguage();

        assertTrue(settingsPage.verifyHindiLanguage(), "Verify if language is changed to hindi");

        settingsPage.clickOnInjiTourGuide();

        assertTrue(homePage.verifyLanguageForHelpAndFrequentlyAskedQuationsHeaderDisplayed("Hindi"), "Verify if help and frequently asked quations header displayed");
        assertTrue(homePage.verifyLanguageForHelpAndFrequentlyAskedQuationsDescriptionDisplayed("Hindi"), "Verify if help and frequently asked quations description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyLanguageForDownloadCardHeaderDisplayed("Hindi"), "Verify if download card header text displayed");
        assertTrue(homePage.verifyLanguageForDownloadCardDescriptionDisplayed("Hindi"), "Verify if download card description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyLanguageForShareCardHeaderDisplayed("Hindi"), "Verify if share card header text displayed");
        assertTrue(homePage.verifyLanguageForShareCardDescriptionDisplayed("Hindi"), "Verify if share card description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyLanguageForAccesstoHistoryHeaderDisplayed("Hindi"), "Verify if access to history header text displayed");
        assertTrue(homePage.verifyLanguageForaccesstoHistoryDescriptionDisplayed("Hindi"), "Verify if access to history description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyLanguageForAppSettingsHeaderDisplayed("Hindi"), "Verify if app settings header text displayed");
        assertTrue(homePage.verifyLanguageForAppSettingsDescriptionDisplayed("Hindi"), "Verify if app settings description displayed");
        homePage.clickOnNextButton();
        assertEquals(homePage.getShareButton(), "शेयर करना");
    }

    @Test
    public void changeLanguageToTamilAndcheckInjiTour() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), Target.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), Target.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnLanguage().clickOnTamilLanguage();

        assertTrue(settingsPage.verifyTamilLanguage(), "Verify if language is changed to tamil");

        settingsPage.clickOnInjiTourGuide();

        assertTrue(homePage.verifyLanguageForHelpAndFrequentlyAskedQuationsHeaderDisplayed("Tamil"), "Verify if help and frequently asked quations header displayed");
        assertTrue(homePage.verifyLanguageForHelpAndFrequentlyAskedQuationsDescriptionDisplayed("Tamil"), "Verify if help and frequently asked quations description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyLanguageForDownloadCardHeaderDisplayed("Tamil"), "Verify if download card header text displayed");
        assertTrue(homePage.verifyLanguageForDownloadCardDescriptionDisplayed("Tamil"), "Verify if download card description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyLanguageForShareCardHeaderDisplayed("Tamil"), "Verify if share card header text displayed");
        assertTrue(homePage.verifyLanguageForShareCardDescriptionDisplayed("Tamil"), "Verify if share card description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyLanguageForAccesstoHistoryHeaderDisplayed("Tamil"), "Verify if access to history header text displayed");
        assertTrue(homePage.verifyLanguageForaccesstoHistoryDescriptionDisplayed("Tamil"), "Verify if access to history description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyLanguageForAppSettingsHeaderDisplayed("Tamil"), "Verify if app settings header text displayed");
        assertTrue(homePage.verifyLanguageForAppSettingsDescriptionDisplayed("Tamil"), "Verify if app settings description displayed");
        homePage.clickOnNextButton();
        assertEquals(homePage.getShareButton(), "பகிர்");
    }

    @Test
    public void changeLanguageToKannadAndcheckInjiTour() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), Target.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), Target.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnLanguage().clickOnKannadaLanguage();

        assertTrue(settingsPage.verifyKannadaLanguage(), "Verify if language is changed to kannada");

        settingsPage.clickOnInjiTourGuide();

        assertTrue(homePage.verifyLanguageForHelpAndFrequentlyAskedQuationsHeaderDisplayed("Kannada"), "Verify if help and frequently asked quations header displayed");
        assertTrue(homePage.verifyLanguageForHelpAndFrequentlyAskedQuationsDescriptionDisplayed("Kannada"), "Verify if help and frequently asked quations description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyLanguageForDownloadCardHeaderDisplayed("Kannada"), "Verify if download card header text displayed");
        assertTrue(homePage.verifyLanguageForDownloadCardDescriptionDisplayed("Kannada"), "Verify if download card description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyLanguageForShareCardHeaderDisplayed("Kannada"), "Verify if share card header text displayed");
        assertTrue(homePage.verifyLanguageForShareCardDescriptionDisplayed("Kannada"), "Verify if share card description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyLanguageForAccesstoHistoryHeaderDisplayed("Kannada"), "Verify if access to history header text displayed");
        assertTrue(homePage.verifyLanguageForaccesstoHistoryDescriptionDisplayed("Kannada"), "Verify if access to history description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyLanguageForAppSettingsHeaderDisplayed("Kannada"), "Verify if app settings header text displayed");
        assertTrue(homePage.verifyLanguageForAppSettingsDescriptionDisplayed("Kannada"), "Verify if app settings description displayed");
        homePage.clickOnNextButton();
        assertEquals(homePage.getShareButton(), "ಹಂಚಿಕೊಳ್ಳಿ");
    }

    @Test
    public void downloadVcAndChnageLangaugeVerifyVcViaSunbird() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), Target.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), Target.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        AddNewCardPage addNewCardPage = homePage.downloadCard();

        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
        assertTrue(addNewCardPage.isIssuerDescriptionEsignetDisplayed(), "Verify if issuer description  esignet displayed");
        assertTrue(addNewCardPage.isIssuerSearchBarDisplayed(), "Verify if issuer search bar displayed");
        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
        assertTrue(addNewCardPage.isAddNewCardPageGuideMessageForEsignetDisplayed(), "Verify if add new card guide message displayed");
        assertTrue(addNewCardPage.isDownloadViaSunbirdDisplayed(), "Verify if download sunbird displayed");
        SunbirdLoginPage sunbirdLoginPage =  addNewCardPage.clickOnDownloadViaSunbird();
        addNewCardPage.clickOnCredentialTypeHeadingInsuranceCredential();

        sunbirdLoginPage.enterPolicyNumberTextBox(policyNumber);
        sunbirdLoginPage.enterFullNameTextBox(fullName);
        sunbirdLoginPage.enterDateOfBirthTextBox();
        sunbirdLoginPage.clickOnloginButton();

        assertTrue(sunbirdLoginPage.isSunbirdCardIsActive(), "Verify if download sunbird displayed active");
        SettingsPage settingsPage= homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnLanguage().clickOnHindiLanguage();

        assertTrue(settingsPage.verifyHindiLanguage(), "Verify if language is changed to hindi");
        homePage.clickOnHomeButton();

        assertTrue(sunbirdLoginPage.isSunbirdCardLogoIsDisplayed(), "Verify if download sunbird logo displayed");
        // assertEquals(sunbirdLoginPage.getFullNameForSunbirdCard(),TestDataReader.readData("fullNameSunbird"));
        sunbirdLoginPage.openDetailedSunbirdVcView();

        assertEquals(sunbirdLoginPage.getFullNameForSunbirdCard(),TestDataReader.readData("fullNameSunbird"));
        assertEquals(sunbirdLoginPage.getPolicyNameForSunbirdCard(),TestDataReader.readData("policyNameSunbird"));
        assertEquals(sunbirdLoginPage.getPhoneNumberForSunbirdCard(),TestDataReader.readData("phoneNumberSunbird"));
        assertTrue(sunbirdLoginPage.isDateofBirthValueForSunbirdCardDisplayed());
        assertEquals(sunbirdLoginPage.getGenderValueForSunbirdCard(),TestDataReader.readData("genderValueSunbird"));
        assertEquals(sunbirdLoginPage.getEmailIdValueForSunbirdCard(),TestDataReader.readData("emailIdValueSunbird"));
        assertEquals(sunbirdLoginPage.getStatusValueForSunbirdCard(),"वैध");
        assertTrue(sunbirdLoginPage.isPolicyExpiresOnValueDisplayed(), "Verify if policy expireson value displayed");
        assertEquals(sunbirdLoginPage.getIdTypeValueForSunbirdCard(),TestDataReader.readData("idTypeSunbirdHindi"));
        sunbirdLoginPage.clickOnBackArrow();

        homePage.clickOnSettingIcon();
        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        UnlockApplicationPage unlockApplicationPage = settingsPage.clickOnLanguage().clickOnArabicLanguageButton();

        assertTrue(unlockApplicationPage.isUnlockApplicationPageLoadedInArabic(), "Verify if language is changed to arabic");
        unlockApplicationPage.clickOnUnlockApplicationButton();
        setPasscode.enterPasscode(TestDataReader.readData("passcode"), Target.ANDROID);
        assertTrue(sunbirdLoginPage.isStatusIconDisplayed(), "Verify if status icon displayed");
    }

    @Test
    public void DownloadAndVerifyVcInArabic() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), Target.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), Target.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        UnlockApplicationPage unlockApplicationPage = settingsPage.clickOnLanguage().clickOnArabicLanguageButton();

        assertTrue(unlockApplicationPage.isUnlockApplicationPageLoadedInArabic(), "Verify if language is changed to arabic");
        unlockApplicationPage.clickOnUnlockApplicationButton();
        setPasscode.enterPasscode(TestDataReader.readData("passcode"), Target.ANDROID);
        AddNewCardPage addNewCardPage = homePage.downloadCard();

        assertEquals(addNewCardPage.verifyLanguageForAddNewCardGuideMessage(),"يرجى اختيار جهة الإصدار المفضلة لديك من الخيارات أدناه لإضافة بطاقة جديدة.");
        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();
//        String uin= TestDataReader.readData("uin");
        OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(uin).clickOnGenerateCardButton();

        assertTrue(otpVerification.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
        otpVerification.enterOtp(BaseTestCase.getOtp(), Target.ANDROID);

        DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();
        assertEquals(homePage.getFullNameValue(), "TEST_FULLNAMEara");
        assertEquals(homePage.GetActivationPendingHeaderText(), "التنشيط معلق لتسجيل الدخول عبر الإنترنت!");
    }

    @Test
    public void changeLanguageToHindiAndVerifyEsignetPage() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), Target.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), Target.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnLanguage().clickOnHindiLanguage();

        assertTrue(settingsPage.verifyHindiLanguage(), "Verify if language is changed to hindi");
        homePage.clickOnHomeButton();

        assertEquals(homePage.verifyLanguageForNoVCDownloadedPageLoaded(),"अपनी डिजिटल आईडी लाओ");
        AddNewCardPage addNewCardPage = homePage.downloadCard();

        assertEquals(addNewCardPage.verifyLanguageForAddNewCardGuideMessage(),"नया कार्ड जोड़ने के लिए कृपया नीचे दिए गए विकल्पों में से अपना पसंदीदा जारीकर्ता चुनें।");
        assertTrue(addNewCardPage.isIssuerSearchBarDisplayedInHindi(),"verify if search bar is displayed in hindi");

        EsignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();
        esignetLoginPage.clickOnCredentialTypeHeadingMOSIPVerifiableCredential();
//        assertTrue(esignetLoginPage.verifyLanguageEnterUinOrVidBoxTextDisplayed("Hindi"),"verify if enter uin or vid text hindi");
        assertTrue(esignetLoginPage.verifyLanguageLoginHeaderTextDisplayed("Hindi"),"verify login text in hindi");
        assertTrue(esignetLoginPage.verifyLanguagePleaseEnterUinHeaderTextDisplayed("Hindi"),"verify if enter uin/vid header in hindi");
    }

    @Test
    public void changeLanguageToTamilAndVerifyEsignetPage() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), Target.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), Target.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnLanguage().clickOnTamilLanguage();

        assertTrue(settingsPage.verifyTamilLanguage(), "Verify if language is changed to tamil");
        homePage.clickOnHomeButton();

        AddNewCardPage addNewCardPage = homePage.downloadCard();
        EsignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();
        esignetLoginPage.clickOnCredentialTypeHeadingMOSIPVerifiableCredential();
        esignetLoginPage.clickOnEsignetLoginWithOtpButton();
        assertTrue(esignetLoginPage.verifyLanguageLoginHeaderTextDisplayed("Tamil"), "verify login text in tamil");
        assertTrue(esignetLoginPage.verifyLanguagePleaseEnterUinHeaderTextDisplayed("Tamil"), "verify if enter uin/vid header in tamil");
    }

    @Test
    public void changeLanguageToKannadaAndVerifyEsignetPage() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), Target.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), Target.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnLanguage().clickOnKannadaLanguage();

        assertTrue(settingsPage.verifyKannadaLanguage(), "Verify if language is changed to Kannada");
        homePage.clickOnHomeButton();

        AddNewCardPage addNewCardPage = homePage.downloadCard();
        EsignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();
        esignetLoginPage.clickOnCredentialTypeHeadingMOSIPVerifiableCredential();
        esignetLoginPage.clickOnEsignetLoginWithOtpButton();
        assertTrue(esignetLoginPage.verifyLanguageLoginHeaderTextDisplayed("Kannada"), "verify login text in Kannada");
        assertTrue(esignetLoginPage.verifyLanguagePleaseEnterUinHeaderTextDisplayed("Kannada"), "verify if enter uin/vid header in Kannada");

    }

    @Test
    public void changeLanguageToArabicAndVerifyEsignetPage() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), Target.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), Target.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnLanguage().clickOnArabicLanguageButton();

        UnlockApplicationPage unlockApplicationPage = new UnlockApplicationPage(driver);
        assertTrue(unlockApplicationPage.isUnlockApplicationPageLoadedInArabic(), "Verify if language is changed to arabic");
        unlockApplicationPage.clickOnUnlockApplicationButton();
        setPasscode.enterPasscode(TestDataReader.readData("passcode"), Target.ANDROID);

        homePage.clickOnHomeButton();
        AddNewCardPage addNewCardPage = homePage.downloadCard();
        EsignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();
        esignetLoginPage.clickOnCredentialTypeHeadingMOSIPVerifiableCredential();
        esignetLoginPage.clickOnEsignetLoginWithOtpButton();
        assertTrue(esignetLoginPage.verifyLanguageLoginHeaderTextDisplayed("Arabic"), "verify login text in arabic");
        assertTrue(esignetLoginPage.verifyLanguagePleaseEnterUinHeaderTextDisplayed("Arabic"), "verify if enter uin/vid header in arabic");

    }

    @Test
    public void changeLanguageToFillipineAndVerifyEsignetPage() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), Target.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), Target.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnLanguage().clickOnKannadaLanguage();

        assertTrue(settingsPage.verifyKannadaLanguage(), "Verify if language is changed to Kannada");
        homePage.clickOnHomeButton();

        AddNewCardPage addNewCardPage = homePage.downloadCard();
        EsignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();
        esignetLoginPage.clickOnCredentialTypeHeadingMOSIPVerifiableCredential();
        esignetLoginPage.clickOnEsignetLoginWithOtpButton();
        assertTrue(esignetLoginPage.verifyLanguageLoginHeaderTextDisplayed("Kannada"), "verify login text in Kannada");
        assertTrue(esignetLoginPage.verifyLanguagePleaseEnterUinHeaderTextDisplayed("Kannada"), "verify if enter uin/vid header in Kannada");

        esignetLoginPage.clickOnCloseButton();
        addNewCardPage.clickOnBack();
        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");

        homePage.clickOnSettingIcon();
        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnLanguage().clickOnFilipinoLanguage();

        homePage.clickOnHomeButton();
        homePage.downloadCard();
        addNewCardPage.clickOnDownloadViaEsignet();
        esignetLoginPage.clickOnCredentialTypeHeadingMOSIPVerifiableCredential();
        esignetLoginPage.clickOnEsignetLoginWithOtpButton();
        assertTrue(esignetLoginPage.verifyLanguageLoginHeaderTextDisplayed("Kannada"), "verify login text in Kannada");
        assertTrue(esignetLoginPage.verifyLanguagePleaseEnterUinHeaderTextDisplayed("Kannada"), "verify if enter uin/vid header in Kannada");
    }

    @Test
    public void changeLanguageFromKannadaToEnglishAndVerifyEsignetPage() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), Target.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), Target.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnLanguage().clickOnKannadaLanguage();

        assertTrue(settingsPage.verifyKannadaLanguage(), "Verify if language is changed to Kannada");
        homePage.clickOnHomeButton();

        AddNewCardPage addNewCardPage = homePage.downloadCard();
        EsignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();
        esignetLoginPage.clickOnCredentialTypeHeadingMOSIPVerifiableCredential();
        esignetLoginPage.clickOnEsignetLoginWithOtpButton();
        assertTrue(esignetLoginPage.verifyLanguageLoginHeaderTextDisplayed("Kannada"), "verify login text in Kannada");
        assertTrue(esignetLoginPage.verifyLanguagePleaseEnterUinHeaderTextDisplayed("Kannada"), "verify if enter uin/vid header in Kannada");

        esignetLoginPage.clickOnCloseButton();
        addNewCardPage.clickOnBack();
        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");

        homePage.clickOnSettingIcon();
        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnLanguage().clickOnEnglishLanguage();

        homePage.clickOnHomeButton();
        homePage.downloadCard();
        addNewCardPage.clickOnDownloadViaEsignet();
        esignetLoginPage.clickOnCredentialTypeHeadingMOSIPVerifiableCredential();
        esignetLoginPage.clickOnEsignetLoginWithOtpButton();
        assertTrue(esignetLoginPage.verifyLanguageLoginHeaderTextDisplayed("English"), "verify login text in english");
        assertTrue(esignetLoginPage.verifyLanguagePleaseEnterUinHeaderTextDisplayed("English"), "verify if enter uin/vid header in english");
    }

    @Test
    public void verifyWelcomePagesContentEnglish() {

        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);
        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        assertTrue(welcomePage.isSelectAppUnlockMethodHeaderTextDisplayed(), "Verify if select app unlock method header  displayed");
        assertTrue(welcomePage.isWelcomePageDescriptionTextDisplayed(), "Verify if select app unlock method description  displayed");
        assertTrue(welcomePage.isPasswordTypeDescriptionTextDisplayed(), "Verify if password type description displayed");
        assertTrue(welcomePage.getWelcomeDescription("English"), "Keep your digital credential with you at all times. Inji helps you manage and use them effectively. To get started, add cards to your profile.");
        welcomePage.clickOnNextButton();

        SecureSharingPage secureSharingPage = new SecureSharingPage(driver);
        assertTrue(secureSharingPage.isRequesterHeaderTextDisplayed(), "Verify if requester header displayed");
        assertTrue(secureSharingPage.isPleaseSelectIdTextDisplayed(), "Verify if please select id text displayed");
        assertTrue(secureSharingPage.verifyLanguageforSecureSharingPageLoaded("English"), "Secure Sharing");
        assertTrue(secureSharingPage.getSecureSharingDescription("English"), "Share your cards securely in a hassle free way and avail various services.");
        secureSharingPage.clickOnNextButton();

        TrustedDigitalWalletPage trustedDigitalWalletPage = new TrustedDigitalWalletPage(driver);
        assertTrue(trustedDigitalWalletPage.isInjiLogoDisplayed(), "Verify if injilogo displayed");
        assertTrue(trustedDigitalWalletPage.isHelpTextDisplayed(), "Verify if help text displayed");
        assertTrue(trustedDigitalWalletPage.verifyLanguageforTrustedDigitalWalletPageLoaded("English"), "Trusted Digital Wallet");
        assertTrue(trustedDigitalWalletPage.getTrustedDigitalWalletDescription("English"), "Store and carry all your important cards in a single trusted wallet.");
        trustedDigitalWalletPage.clickOnNextButton();

        QuickAccessPage quickAccessPage = new QuickAccessPage(driver);
        assertTrue(quickAccessPage.isHoldPhoneSteadyMessageDisplayed(), "Verify if hold phone steady message displayed");
        assertTrue(quickAccessPage.verifyLanguageforQuickAccessTextPageLoaded("English"), "Quick Access");
        assertTrue(quickAccessPage.getQuickAccessDescription("English"), "Authenticate yourself with ease using the stored digital credential.");
        quickAccessPage.clickOnNextButton();

        BackupDataTourPage backupDataPage = new BackupDataTourPage(driver);
        assertTrue(backupDataPage.isAccountSectionHeaderDisplayed(), "Verify if account section header displayed");
        assertTrue(backupDataPage.isLastBackupSectionHeaderDisplayed(), "Verify if last backup section header displayed");
        assertTrue(backupDataPage.isBackupAndRestoreDisplayed(), "Verify if backup and restore displayed");
        assertTrue(backupDataPage.verifyLanguageforBackupDataPageLoaded("English"), "Backup & Restore");
        assertTrue(backupDataPage.getBackupDataPageDescription("English"), "Protect your data with ease using our Backup & Restore feature. Safely store your VCs against loss or accidents by creating regular backups and recover it effortlessly whenever needed for seamless continuity.");
    }

    @Test
    public void verifyWelcomePagesContentInFilipino() {

        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);
        chooseLanguagePage.clickOnFilipinoLangauge();
        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        assertTrue(welcomePage.isSelectAppUnlockMethodHeaderTextDisplayed(), "Verify if select app unlock method header  displayed");
        assertTrue(welcomePage.isWelcomePageDescriptionTextDisplayed(), "Verify if select app unlock method description  displayed");
        assertTrue(welcomePage.isPasswordTypeDescriptionTextDisplayed(), "Verify if password type description displayed");
        assertTrue(welcomePage.getWelcomeDescription("Filipino"), "Keep your digital credential with you at all times. Inji helps you manage and use them effectively. To get started, add cards to your profile.");
        welcomePage.clickOnNextButton();

        SecureSharingPage secureSharingPage = new SecureSharingPage(driver);
//        assertTrue(secureSharingPage.isRequesterHeaderTextDisplayed(), "Verify if requester header displayed");
//        assertTrue(secureSharingPage.isPleaseSelectIdTextDisplayed(), "Verify if please select id text displayed");
        assertTrue(secureSharingPage.verifyLanguageforSecureSharingPageLoaded("Filipino"), "Secure Sharing");
        assertTrue(secureSharingPage.getSecureSharingDescription("Filipino"), "Share your cards securely in a hassle free way and avail various services.");
        secureSharingPage.clickOnNextButton();

        TrustedDigitalWalletPage trustedDigitalWalletPage = new TrustedDigitalWalletPage(driver);
        assertTrue(trustedDigitalWalletPage.isInjiLogoDisplayed(), "Verify if injilogo displayed");
        assertTrue(trustedDigitalWalletPage.isHelpTextDisplayed(), "Verify if help text displayed");
        assertTrue(trustedDigitalWalletPage.verifyLanguageforTrustedDigitalWalletPageLoaded("Filipino"), "Trusted Digital Wallet");
        assertTrue(trustedDigitalWalletPage.getTrustedDigitalWalletDescription("Filipino"), "Store and carry all your important cards in a single trusted wallet.");
        trustedDigitalWalletPage.clickOnNextButton();

        QuickAccessPage quickAccessPage = new QuickAccessPage(driver);
        assertTrue(quickAccessPage.isHoldPhoneSteadyMessageDisplayed(), "Verify if hold phone steady message displayed");
        assertTrue(quickAccessPage.verifyLanguageforQuickAccessTextPageLoaded("Filipino"), "Quick Access");
        assertTrue(quickAccessPage.getQuickAccessDescription("Filipino"), "Authenticate yourself with ease using the stored digital credential.");
        quickAccessPage.clickOnNextButton();

        BackupDataTourPage backupDataPage = new BackupDataTourPage(driver);
        assertTrue(backupDataPage.isAccountSectionHeaderDisplayed(), "Verify if account section header displayed");
        assertTrue(backupDataPage.isLastBackupSectionHeaderDisplayed(), "Verify if last backup section header displayed");
//        assertTrue(backupDataPage.isBackupAndRestoreDisplayed(), "Verify if backup and restore displayed");
        assertTrue(backupDataPage.verifyLanguageforBackupDataPageLoaded("Filipino"), "Backup & Restore");
        assertTrue(backupDataPage.getBackupDataPageDescription("Filipino"), "Protect your data with ease using our Backup & Restore feature. Safely store your VCs against loss or accidents by creating regular backups and recover it effortlessly whenever needed for seamless continuity.");
    }

    @Test
    public void verifyWelcomePagesContentInHindi() {

        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);
        chooseLanguagePage.clickOnHindiLanguage();
        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        assertTrue(welcomePage.isSelectAppUnlockMethodHeaderTextDisplayed(), "Verify if select app unlock method header  displayed");
        assertTrue(welcomePage.isWelcomePageDescriptionTextDisplayed(), "Verify if select app unlock method description  displayed");
        assertTrue(welcomePage.isPasswordTypeDescriptionTextDisplayed(), "Verify if password type description displayed");
        assertTrue(welcomePage.getWelcomeDescription("Hindi"), "Keep your digital credential with you at all times. Inji helps you manage and use them effectively. To get started, add cards to your profile.");
        welcomePage.clickOnNextButton();

        SecureSharingPage secureSharingPage = new SecureSharingPage(driver);
//        assertTrue(secureSharingPage.isRequesterHeaderTextDisplayed(), "Verify if requester header displayed");
//        assertTrue(secureSharingPage.isPleaseSelectIdTextDisplayed(), "Verify if please select id text displayed");
        assertTrue(secureSharingPage.verifyLanguageforSecureSharingPageLoaded("Hindi"), "Secure Sharing");
        assertTrue(secureSharingPage.getSecureSharingDescription("Hindi"), "Share your cards securely in a hassle free way and avail various services.");
        secureSharingPage.clickOnNextButton();

        TrustedDigitalWalletPage trustedDigitalWalletPage = new TrustedDigitalWalletPage(driver);
        assertTrue(trustedDigitalWalletPage.isInjiLogoDisplayed(), "Verify if injilogo displayed");
        assertTrue(trustedDigitalWalletPage.isHelpTextDisplayed(), "Verify if help text displayed");
        assertTrue(trustedDigitalWalletPage.verifyLanguageforTrustedDigitalWalletPageLoaded("Hindi"), "Trusted Digital Wallet");
        assertTrue(trustedDigitalWalletPage.getTrustedDigitalWalletDescription("Hindi"), "Store and carry all your important cards in a single trusted wallet.");
        trustedDigitalWalletPage.clickOnNextButton();

        QuickAccessPage quickAccessPage = new QuickAccessPage(driver);
        assertTrue(quickAccessPage.isHoldPhoneSteadyMessageDisplayed(), "Verify if hold phone steady message displayed");
        assertTrue(quickAccessPage.verifyLanguageforQuickAccessTextPageLoaded("Hindi"), "Quick Access");
        assertTrue(quickAccessPage.getQuickAccessDescription("Hindi"), "Authenticate yourself with ease using the stored digital credential.");
        quickAccessPage.clickOnNextButton();

        BackupDataTourPage backupDataPage = new BackupDataTourPage(driver);
        assertTrue(backupDataPage.isAccountSectionHeaderDisplayed(), "Verify if account section header displayed");
        assertTrue(backupDataPage.isLastBackupSectionHeaderDisplayed(), "Verify if last backup section header displayed");
//        assertTrue(backupDataPage.isBackupAndRestoreDisplayed(), "Verify if backup and restore displayed");
        assertTrue(backupDataPage.verifyLanguageforBackupDataPageLoaded("Hindi"), "Backup & Restore");
        assertTrue(backupDataPage.getBackupDataPageDescription("Hindi"), "Protect your data with ease using our Backup & Restore feature. Safely store your VCs against loss or accidents by creating regular backups and recover it effortlessly whenever needed for seamless continuity.");
    }

    @Test
    public void verifyWelcomePagesContentInKannada() {

        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);
        chooseLanguagePage.clickOnKannadaLanguage();
        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        assertTrue(welcomePage.isSelectAppUnlockMethodHeaderTextDisplayed(), "Verify if select app unlock method header  displayed");
        assertTrue(welcomePage.isWelcomePageDescriptionTextDisplayed(), "Verify if select app unlock method description  displayed");
        assertTrue(welcomePage.isPasswordTypeDescriptionTextDisplayed(), "Verify if password type description displayed");
        assertTrue(welcomePage.getWelcomeDescription("Kannada"), "Keep your digital credential with you at all times. Inji helps you manage and use them effectively. To get started, add cards to your profile.");
        welcomePage.clickOnNextButton();

        SecureSharingPage secureSharingPage = new SecureSharingPage(driver);
//        assertTrue(secureSharingPage.isRequesterHeaderTextDisplayed(), "Verify if requester header displayed");
//        assertTrue(secureSharingPage.isPleaseSelectIdTextDisplayed(), "Verify if please select id text displayed");
        assertTrue(secureSharingPage.verifyLanguageforSecureSharingPageLoaded("Kannada"), "Secure Sharing");
        assertTrue(secureSharingPage.getSecureSharingDescription("Kannada"), "Share your cards securely in a hassle free way and avail various services.");
        secureSharingPage.clickOnNextButton();

        TrustedDigitalWalletPage trustedDigitalWalletPage = new TrustedDigitalWalletPage(driver);
        assertTrue(trustedDigitalWalletPage.isInjiLogoDisplayed(), "Verify if injilogo displayed");
        assertTrue(trustedDigitalWalletPage.isHelpTextDisplayed(), "Verify if help text displayed");
        assertTrue(trustedDigitalWalletPage.verifyLanguageforTrustedDigitalWalletPageLoaded("Kannada"), "Trusted Digital Wallet");
        assertTrue(trustedDigitalWalletPage.getTrustedDigitalWalletDescription("Kannada"), "Store and carry all your important cards in a single trusted wallet.");
        trustedDigitalWalletPage.clickOnNextButton();

        QuickAccessPage quickAccessPage = new QuickAccessPage(driver);
        assertTrue(quickAccessPage.isHoldPhoneSteadyMessageDisplayed(), "Verify if hold phone steady message displayed");
        assertTrue(quickAccessPage.verifyLanguageforQuickAccessTextPageLoaded("Kannada"), "Quick Access");
        assertTrue(quickAccessPage.getQuickAccessDescription("Kannada"), "Authenticate yourself with ease using the stored digital credential.");
        quickAccessPage.clickOnNextButton();

        BackupDataTourPage backupDataPage = new BackupDataTourPage(driver);
        assertTrue(backupDataPage.isAccountSectionHeaderDisplayed(), "Verify if account section header displayed");
        assertTrue(backupDataPage.isLastBackupSectionHeaderDisplayed(), "Verify if last backup section header displayed");
//        assertTrue(backupDataPage.isBackupAndRestoreDisplayed(), "Verify if backup and restore displayed");
        assertTrue(backupDataPage.verifyLanguageforBackupDataPageLoaded("Kannada"), "Backup & Restore");
        assertTrue(backupDataPage.getBackupDataPageDescription("Kannada"), "Protect your data with ease using our Backup & Restore feature. Safely store your VCs against loss or accidents by creating regular backups and recover it effortlessly whenever needed for seamless continuity.");
    }


    @Test
    public void verifyWelcomePagesContentInTamil() {

        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);
        chooseLanguagePage.clickOnTamilLanguage();
        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        assertTrue(welcomePage.isSelectAppUnlockMethodHeaderTextDisplayed(), "Verify if select app unlock method header  displayed");
        assertTrue(welcomePage.isWelcomePageDescriptionTextDisplayed(), "Verify if select app unlock method description  displayed");
        assertTrue(welcomePage.isPasswordTypeDescriptionTextDisplayed(), "Verify if password type description displayed");
        assertTrue(welcomePage.getWelcomeDescription("Tamil"), "Keep your digital credential with you at all times. Inji helps you manage and use them effectively. To get started, add cards to your profile.");
        welcomePage.clickOnNextButton();

        SecureSharingPage secureSharingPage = new SecureSharingPage(driver);
//        assertTrue(secureSharingPage.isRequesterHeaderTextDisplayed(), "Verify if requester header displayed");
//        assertTrue(secureSharingPage.isPleaseSelectIdTextDisplayed(), "Verify if please select id text displayed");
        assertTrue(secureSharingPage.verifyLanguageforSecureSharingPageLoaded("Tamil"), "Secure Sharing");
        assertTrue(secureSharingPage.getSecureSharingDescription("Tamil"), "Share your cards securely in a hassle free way and avail various services.");
        secureSharingPage.clickOnNextButton();

        TrustedDigitalWalletPage trustedDigitalWalletPage = new TrustedDigitalWalletPage(driver);
        assertTrue(trustedDigitalWalletPage.isInjiLogoDisplayed(), "Verify if injilogo displayed");
        assertTrue(trustedDigitalWalletPage.isHelpTextDisplayed(), "Verify if help text displayed");
        assertTrue(trustedDigitalWalletPage.verifyLanguageforTrustedDigitalWalletPageLoaded("Tamil"), "Trusted Digital Wallet");
        assertTrue(trustedDigitalWalletPage.getTrustedDigitalWalletDescription("Tamil"), "Store and carry all your important cards in a single trusted wallet.");
        trustedDigitalWalletPage.clickOnNextButton();

        QuickAccessPage quickAccessPage = new QuickAccessPage(driver);
        assertTrue(quickAccessPage.isHoldPhoneSteadyMessageDisplayed(), "Verify if hold phone steady message displayed");
        assertTrue(quickAccessPage.verifyLanguageforQuickAccessTextPageLoaded("Tamil"), "Quick Access");
        assertTrue(quickAccessPage.getQuickAccessDescription("Tamil"), "Authenticate yourself with ease using the stored digital credential.");
        quickAccessPage.clickOnNextButton();

        BackupDataTourPage backupDataPage = new BackupDataTourPage(driver);
        assertTrue(backupDataPage.isAccountSectionHeaderDisplayed(), "Verify if account section header displayed");
        assertTrue(backupDataPage.isLastBackupSectionHeaderDisplayed(), "Verify if last backup section header displayed");
//        assertTrue(backupDataPage.isBackupAndRestoreDisplayed(), "Verify if backup and restore displayed");
        assertTrue(backupDataPage.verifyLanguageforBackupDataPageLoaded("Tamil"), "Backup & Restore");
        assertTrue(backupDataPage.getBackupDataPageDescription("Tamil"), "Protect your data with ease using our Backup & Restore feature. Safely store your VCs against loss or accidents by creating regular backups and recover it effortlessly whenever needed for seamless continuity.");
    }

    @Test(enabled = false)
    public void verifyWelcomePagesContentInArabic() {

        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);
        chooseLanguagePage.clickOnArabicLanguage();
        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        assertTrue(welcomePage.isSelectAppUnlockMethodHeaderTextDisplayed(), "Verify if select app unlock method header  displayed");
        assertTrue(welcomePage.isWelcomePageDescriptionTextDisplayed(), "Verify if select app unlock method description  displayed");
        assertTrue(welcomePage.isPasswordTypeDescriptionTextDisplayed(), "Verify if password type description displayed");
        assertTrue(welcomePage.getWelcomeDescription("Arabic"), "Keep your digital credential with you at all times. Inji helps you manage and use them effectively. To get started, add cards to your profile.");
        welcomePage.clickOnNextButton();

        SecureSharingPage secureSharingPage = new SecureSharingPage(driver);
//        assertTrue(secureSharingPage.isRequesterHeaderTextDisplayed(), "Verify if requester header displayed");
//        assertTrue(secureSharingPage.isPleaseSelectIdTextDisplayed(), "Verify if please select id text displayed");
        assertTrue(secureSharingPage.verifyLanguageforSecureSharingPageLoaded("Arabic"), "Secure Sharing");
        assertTrue(secureSharingPage.getSecureSharingDescription("Arabic"), "Share your cards securely in a hassle free way and avail various services.");
        secureSharingPage.clickOnNextButton();

        TrustedDigitalWalletPage trustedDigitalWalletPage = new TrustedDigitalWalletPage(driver);
        assertTrue(trustedDigitalWalletPage.isInjiLogoDisplayed(), "Verify if injilogo displayed");
        assertTrue(trustedDigitalWalletPage.isHelpTextDisplayed(), "Verify if help text displayed");
        assertTrue(trustedDigitalWalletPage.verifyLanguageforTrustedDigitalWalletPageLoaded("Arabic"), "Trusted Digital Wallet");
        assertTrue(trustedDigitalWalletPage.getTrustedDigitalWalletDescription("Arabic"), "Store and carry all your important cards in a single trusted wallet.");
        trustedDigitalWalletPage.clickOnNextButton();

        QuickAccessPage quickAccessPage = new QuickAccessPage(driver);
        assertTrue(quickAccessPage.isHoldPhoneSteadyMessageDisplayed(), "Verify if hold phone steady message displayed");
        assertTrue(quickAccessPage.verifyLanguageforQuickAccessTextPageLoaded("Arabic"), "Quick Access");
        assertTrue(quickAccessPage.getQuickAccessDescription("Arabic"), "Authenticate yourself with ease using the stored digital credential.");
        quickAccessPage.clickOnNextButton();

        BackupDataTourPage backupDataPage = new BackupDataTourPage(driver);
        assertTrue(backupDataPage.isAccountSectionHeaderDisplayed(), "Verify if account section header displayed");
        assertTrue(backupDataPage.isLastBackupSectionHeaderDisplayed(), "Verify if last backup section header displayed");
//        assertTrue(backupDataPage.isBackupAndRestoreDisplayed(), "Verify if backup and restore displayed");
        assertTrue(backupDataPage.verifyLanguageforBackupDataPageLoaded("Arabic"), "Backup & Restore");
        assertTrue(backupDataPage.getBackupDataPageDescription("Arabic"), "Protect your data with ease using our Backup & Restore feature. Safely store your VCs against loss or accidents by creating regular backups and recover it effortlessly whenever needed for seamless continuity.");
    }

}
