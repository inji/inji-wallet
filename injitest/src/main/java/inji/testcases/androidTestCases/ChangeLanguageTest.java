package inji.testcases.androidTestCases;

import inji.annotations.NeedsSunbirdPolicy;
import inji.annotations.NeedsUIN;
import inji.constants.PlatformType;
import inji.pages.*;
import inji.testcases.BaseTest.AndroidBaseTest;
import inji.utils.InjiWalletUtil;
import inji.utils.TestDataReader;
import org.testng.annotations.Test;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

public class ChangeLanguageTest extends AndroidBaseTest {
    @Test
    public void changeLanguage() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnLanguage().clickOnFilipinoLanguage();

        assertTrue(settingsPage.verifyFilipinoLanguage(), "Verify if language is changed to filipino");
    }

    @Test
    public void languageShouldBeInNativeLanguages() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnLanguage();

        assertTrue(settingsPage.verifyLanguagesInLanguageFilter("ANDROID"), "Verify if all languages are shown in language filter");
    }

    @Test
    public void verifyTuvaliVersion() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        assertTrue(settingsPage.clickOnAboutInji().isTuvaliVersionPresent());
    }

    @Test
    public void changeLanguageToArabic() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        UnlockApplicationPage unlockApplicationPage = settingsPage.clickOnLanguage().clickOnArabicLanguageButton();

        assertTrue(unlockApplicationPage.isUnlockApplicationPageLoadedInArabic(), "Verify if language is changed to arabic");
        unlockApplicationPage.clickOnUnlockApplicationButton();
        setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);
        HistoryPage historyPage = homePage.clickOnHistoryButton();

        assertTrue(historyPage.noHistoryAvailable(), "verify no history available in arabic");
    }

    @Test
    public void changeLanguageToFilipionAndSearchIssuer() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnLanguage().clickOnFilipinoLanguage();

        assertTrue(settingsPage.verifyFilipinoLanguage(), "Verify if language is changed to filipino");
        homePage.clickOnHomeButton();

        assertEquals(homePage.verifyLanguageForNoVCDownloadedPageLoaded(), "Dalhin ang Iyong Digital ID");
        AddNewCardPage addNewCardPage = homePage.downloadCard();

        assertEquals(addNewCardPage.verifyLanguageForAddNewCardGuideMessage(), "Mangyaring piliin ang iyong gustong tagabigay mula sa mga opsyon sa ibaba upang magdagdag ng bagong card.");
        assertTrue(addNewCardPage.isIssuerSearchBarDisplayedInFilipino(), "verify if search bar is displayed in filipino");
        addNewCardPage.sendTextInIssuerSearchBar("I-download ang Mga Kredensyal ng MOSIP ");

        assertTrue(addNewCardPage.isDownloadViaUinDisplayed(), "verify if download via uin vid aid");
        addNewCardPage.clickOnBack();

        homePage.downloadCard();
        addNewCardPage.sendTextInIssuerSearchBar("I-download ang Mga Kredensyal ng MOSIP");
        assertTrue(addNewCardPage.isDownloadViaEsignetDisplayed(), "verify if download via e-signet is displayed");
    }

    @Test
    public void changeLanguageToFilipionAndSearchIssuerEnterIncompleteName() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnLanguage().clickOnFilipinoLanguage();

        assertTrue(settingsPage.verifyFilipinoLanguage(), "Verify if language is changed to filipino");
        homePage.clickOnHomeButton();

        assertEquals(homePage.verifyLanguageForNoVCDownloadedPageLoaded(), "Dalhin ang Iyong Digital ID");
        AddNewCardPage addNewCardPage = homePage.downloadCard();

        assertEquals(addNewCardPage.verifyLanguageForAddNewCardGuideMessage(), "Mangyaring piliin ang iyong gustong tagabigay mula sa mga opsyon sa ibaba upang magdagdag ng bagong card.");
        assertTrue(addNewCardPage.isIssuerSearchBarDisplayedInFilipino(), "verify if search bar is displayed in filipino");
        addNewCardPage.sendTextInIssuerSearchBar("otp");

        assertTrue(addNewCardPage.isDownloadViaUinDisplayed(), "verify if download via uin vid aid");
        addNewCardPage.clickOnBack();

        homePage.downloadCard();
        addNewCardPage.sendTextInIssuerSearchBar("I-download ang");
        assertTrue(addNewCardPage.isDownloadViaEsignetDisplayed(), "verify if download via e-signet is displayed");
    }

    @Test
    public void changeLanguageToHindiAndSearchIssuer() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnLanguage().clickOnHindiLanguage();

        assertTrue(settingsPage.verifyHindiLanguage(), "Verify if language is changed to hindi");
        homePage.clickOnHomeButton();

        assertEquals(homePage.verifyLanguageForNoVCDownloadedPageLoaded(), "अपनी डिजिटल आईडी लाओ");
        AddNewCardPage addNewCardPage = homePage.downloadCard();

        assertEquals(addNewCardPage.verifyLanguageForAddNewCardGuideMessage(), "नया कार्ड जोड़ने के लिए कृपया नीचे दिए गए विकल्पों में से अपना पसंदीदा जारीकर्ता चुनें।");
        assertTrue(addNewCardPage.isIssuerSearchBarDisplayedInHindi(), "verify if search bar is displayed in hindi");
        addNewCardPage.sendTextInIssuerSearchBar("OTP के माध्यम से MOSIP क्रेडेंशियल डाउनलोड करें");

        assertTrue(addNewCardPage.isDownloadViaUinDisplayedInHindi(), "verify if download via uin vid aid displayed in hindi");
        addNewCardPage.clickOnBack();

        homePage.downloadCard();

        addNewCardPage.sendTextInIssuerSearchBar("MOSIP क्रेडेंशियल डाउनलोड करेंं");
        assertTrue(addNewCardPage.isDownloadViaEsignetDisplayedInHindi(), "verify if download via e-signet is displayed");
    }

    @Test
    public void changeLanguageToFilipionAndcheckInjiTour() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnLanguage().clickOnFilipinoLanguage();

        assertTrue(settingsPage.verifyFilipinoLanguage(), "Verify if language is changed to filipino");

        settingsPage.clickOnInjiTourGuide();

        assertTrue(homePage.verifyHelpFAQsHeader("Filipino"), "Verify if help and frequently asked quations header displayed");
        assertTrue(homePage.verifyHelpFAQsDescription("Filipino"), "Verify if help and frequently asked quations description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyDownloadCardHeader("Filipino"), "Verify if download card header text displayed");
        assertTrue(homePage.verifyDownloadCardDescription("Filipino"), "Verify if download card description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyShareCardHeader("Filipino"), "Verify if share card header text displayed");
        assertTrue(homePage.verifyShareCardDescription("Filipino"), "Verify if share card description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyAccessToHistoryHeader("Filipino"), "Verify if access to history header text displayed");
        assertTrue(homePage.verifyAccessToHistoryDescription("Filipino"), "Verify if access to history description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyAppSettingsHeader("Filipino"), "Verify if app settings header text displayed");
        assertTrue(homePage.verifyAppSettingDescription("Filipino"), "Verify if app settings description displayed");
        homePage.clickOnNextButton();
        assertEquals(homePage.getShareButton(), "Ibahagi");
    }

    @Test
    public void changeLanguageToHindiAndcheckInjiTour() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnLanguage().clickOnHindiLanguage();

        assertTrue(settingsPage.verifyHindiLanguage(), "Verify if language is changed to hindi");

        settingsPage.clickOnInjiTourGuide();

        assertTrue(homePage.verifyHelpFAQsHeader("Hindi"), "Verify if help and frequently asked quations header displayed");
        assertTrue(homePage.verifyHelpFAQsDescription("Hindi"), "Verify if help and frequently asked quations description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyDownloadCardHeader("Hindi"), "Verify if download card header text displayed");
        assertTrue(homePage.verifyDownloadCardDescription("Hindi"), "Verify if download card description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyShareCardHeader("Hindi"), "Verify if share card header text displayed");
        assertTrue(homePage.verifyShareCardDescription("Hindi"), "Verify if share card description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyAccessToHistoryHeader("Hindi"), "Verify if access to history header text displayed");
        assertTrue(homePage.verifyAccessToHistoryDescription("Hindi"), "Verify if access to history description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyAppSettingsHeader("Hindi"), "Verify if app settings header text displayed");
        assertTrue(homePage.verifyAppSettingDescription("Hindi"), "Verify if app settings description displayed");
        homePage.clickOnNextButton();
        assertEquals(homePage.getShareButton(), "शेयर करना");
    }

    @Test
    public void changeLanguageToTamilAndcheckInjiTour() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnLanguage().clickOnTamilLanguage();

        assertTrue(settingsPage.verifyTamilLanguage(), "Verify if language is changed to tamil");

        settingsPage.clickOnInjiTourGuide();

        assertTrue(homePage.verifyHelpFAQsHeader("Tamil"), "Verify if help and frequently asked quations header displayed");
        assertTrue(homePage.verifyHelpFAQsDescription("Tamil"), "Verify if help and frequently asked quations description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyDownloadCardHeader("Tamil"), "Verify if download card header text displayed");
        assertTrue(homePage.verifyDownloadCardDescription("Tamil"), "Verify if download card description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyShareCardHeader("Tamil"), "Verify if share card header text displayed");
        assertTrue(homePage.verifyShareCardDescription("Tamil"), "Verify if share card description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyAccessToHistoryHeader("Tamil"), "Verify if access to history header text displayed");
        assertTrue(homePage.verifyAccessToHistoryDescription("Tamil"), "Verify if access to history description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyAppSettingsHeader("Tamil"), "Verify if app settings header text displayed");
        assertTrue(homePage.verifyAppSettingDescription("Tamil"), "Verify if app settings description displayed");
        homePage.clickOnNextButton();
        assertEquals(homePage.getShareButton(), "பகிர்");
    }

    @Test
    public void changeLanguageToKannadAndcheckInjiTour() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnLanguage().clickOnKannadaLanguage();

        assertTrue(settingsPage.verifyKannadaLanguage(), "Verify if language is changed to kannada");

        settingsPage.clickOnInjiTourGuide();

        assertTrue(homePage.verifyHelpFAQsHeader("Kannada"), "Verify if help and frequently asked quations header displayed");
        assertTrue(homePage.verifyHelpFAQsDescription("Kannada"), "Verify if help and frequently asked quations description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyDownloadCardHeader("Kannada"), "Verify if download card header text displayed");
        assertTrue(homePage.verifyDownloadCardDescription("Kannada"), "Verify if download card description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyShareCardHeader("Kannada"), "Verify if share card header text displayed");
        assertTrue(homePage.verifyShareCardDescription("Kannada"), "Verify if share card description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyAccessToHistoryHeader("Kannada"), "Verify if access to history header text displayed");
        assertTrue(homePage.verifyAccessToHistoryDescription("Kannada"), "Verify if access to history description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyAppSettingsHeader("Kannada"), "Verify if app settings header text displayed");
        assertTrue(homePage.verifyAppSettingDescription("Kannada"), "Verify if app settings description displayed");
        homePage.clickOnNextButton();
        assertEquals(homePage.getShareButton(), "ಹಂಚಿಕೊಳ್ಳಿ");
    }

    @Test
    @NeedsSunbirdPolicy
    public void downloadVcAndChnageLangaugeVerifyVcViaSunbird() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        AddNewCardPage addNewCardPage = homePage.downloadCard();

        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
        assertTrue(addNewCardPage.isIssuerDescriptionEsignetDisplayed(), "Verify if issuer description  esignet displayed");
        assertTrue(addNewCardPage.isIssuerSearchBarDisplayed(), "Verify if issuer search bar displayed");
        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
        assertTrue(addNewCardPage.isAddNewCardPageGuideMessageForEsignetDisplayed(), "Verify if add new card guide message displayed");
        assertTrue(addNewCardPage.isDownloadViaSunbirdDisplayed(), "Verify if download sunbird displayed");
        SunbirdLoginPage sunbirdLoginPage = addNewCardPage.clickOnDownloadViaSunbird();
        addNewCardPage.clickOnCredentialTypeHeadingInsuranceCredential();

        sunbirdLoginPage.enterPolicyNumber(getPolicyNumber());
        sunbirdLoginPage.enterFullName(getPolicyName());
        sunbirdLoginPage.enterDateOfBirth();
        sunbirdLoginPage.clickOnLoginButton();

        assertTrue(sunbirdLoginPage.isSunbirdCardActive(), "Verify if download sunbird displayed active");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnLanguage().clickOnHindiLanguage();

        assertTrue(settingsPage.verifyHindiLanguage(), "Verify if language is changed to hindi");
        homePage.clickOnHomeButton();

        assertTrue(sunbirdLoginPage.isSunbirdCardLogoDisplayed(), "Verify if download sunbird logo displayed");
        // assertEquals(sunbirdLoginPage.getFullNameForSunbirdCard(),TestDataReader.readData("fullNameSunbird"));
        sunbirdLoginPage.openDetailedSunbirdVcView();

        assertEquals(sunbirdLoginPage.getFullNameForSunbirdCard(), getPolicyName());
        assertEquals(sunbirdLoginPage.getPolicyNameForSunbirdCard(), TestDataReader.readData("policyNameSunbird"));
        assertEquals(sunbirdLoginPage.getPhoneNumberForSunbirdCard(), TestDataReader.readData("phoneNumberSunbird"));
        assertTrue(sunbirdLoginPage.isDateOfBirthValueForSunbirdCardDisplayed());
        assertEquals(sunbirdLoginPage.getGenderValueForSunbirdCard(), TestDataReader.readData("genderValueSunbird"));
        assertEquals(sunbirdLoginPage.getEmailIdValueForSunbirdCard(), TestDataReader.readData("emailIdValueSunbird"));
        assertEquals(sunbirdLoginPage.getStatusValueForSunbirdCard(), "वैध");
        assertTrue(sunbirdLoginPage.isPolicyExpiresOnValueDisplayed(), "Verify if policy expireson value displayed");
        assertEquals(sunbirdLoginPage.getIdTypeValueForSunbirdCard(), TestDataReader.readData("idTypeSunbirdHindi"));
        sunbirdLoginPage.clickOnBackArrow();

        homePage.clickOnSettingIcon();
        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        UnlockApplicationPage unlockApplicationPage = settingsPage.clickOnLanguage().clickOnArabicLanguageButton();

        assertTrue(unlockApplicationPage.isUnlockApplicationPageLoadedInArabic(), "Verify if language is changed to arabic");
        unlockApplicationPage.clickOnUnlockApplicationButton();
        setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);
        assertTrue(sunbirdLoginPage.isStatusIconDisplayed(), "Verify if status icon displayed");
    }

    @Test
    @NeedsUIN
    public void DownloadAndVerifyVcInArabic() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        UnlockApplicationPage unlockApplicationPage = settingsPage.clickOnLanguage().clickOnArabicLanguageButton();

        assertTrue(unlockApplicationPage.isUnlockApplicationPageLoadedInArabic(), "Verify if language is changed to arabic");
        unlockApplicationPage.clickOnUnlockApplicationButton();
        setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);
        AddNewCardPage addNewCardPage = homePage.downloadCard();

        assertEquals(addNewCardPage.verifyLanguageForAddNewCardGuideMessage(), "يرجى اختيار جهة الإصدار المفضلة لديك من الخيارات أدناه لإضافة بطاقة جديدة.");
        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();
        OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(getUIN()).clickOnGenerateCardButton();

        assertTrue(otpVerification.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
        otpVerification.enterOtp(InjiWalletUtil.getOtp(), PlatformType.ANDROID);

        DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();
        assertEquals(homePage.getFullNameValue(), "TEST_FULLNAMEara");
        assertEquals(homePage.GetActivationPendingHeaderText(), "التنشيط معلق لتسجيل الدخول عبر الإنترنت!");
    }

    @Test
    public void changeLanguageToHindiAndVerifyEsignetPage() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnLanguage().clickOnHindiLanguage();

        assertTrue(settingsPage.verifyHindiLanguage(), "Verify if language is changed to hindi");
        homePage.clickOnHomeButton();

        assertEquals(homePage.verifyLanguageForNoVCDownloadedPageLoaded(), "अपनी डिजिटल आईडी लाओ");
        AddNewCardPage addNewCardPage = homePage.downloadCard();

        assertEquals(addNewCardPage.verifyLanguageForAddNewCardGuideMessage(), "नया कार्ड जोड़ने के लिए कृपया नीचे दिए गए विकल्पों में से अपना पसंदीदा जारीकर्ता चुनें।");
        assertTrue(addNewCardPage.isIssuerSearchBarDisplayedInHindi(), "verify if search bar is displayed in hindi");

        ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();
        esignetLoginPage.clickOnCredentialTypeHeadingMOSIPVerifiableCredential();
//        assertTrue(esignetLoginPage.verifyLanguageEnterUinOrVidBoxTextDisplayed("Hindi"),"verify if enter uin or vid text hindi");
        assertTrue(esignetLoginPage.verifyLoginHeader("Hindi"), "verify login text in hindi");
        assertTrue(esignetLoginPage.verifyLanguagePleaseEnterUinHeaderTextDisplayed("Hindi"), "verify if enter uin/vid header in hindi");
    }

    @Test
    public void changeLanguageToTamilAndVerifyEsignetPage() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnLanguage().clickOnTamilLanguage();

        assertTrue(settingsPage.verifyTamilLanguage(), "Verify if language is changed to tamil");
        homePage.clickOnHomeButton();

        AddNewCardPage addNewCardPage = homePage.downloadCard();
        ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();
        esignetLoginPage.clickOnCredentialTypeHeadingMOSIPVerifiableCredential();
        esignetLoginPage.clickOnEsignetLoginWithOtpButton();
        assertTrue(esignetLoginPage.verifyLoginHeader("Tamil"), "verify login text in tamil");
        assertTrue(esignetLoginPage.verifyLanguagePleaseEnterUinHeaderTextDisplayed("Tamil"), "verify if enter uin/vid header in tamil");
    }

    @Test
    public void changeLanguageToKannadaAndVerifyEsignetPage() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnLanguage().clickOnKannadaLanguage();

        assertTrue(settingsPage.verifyKannadaLanguage(), "Verify if language is changed to Kannada");
        homePage.clickOnHomeButton();

        AddNewCardPage addNewCardPage = homePage.downloadCard();
        ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();
        esignetLoginPage.clickOnCredentialTypeHeadingMOSIPVerifiableCredential();
        esignetLoginPage.clickOnEsignetLoginWithOtpButton();
        assertTrue(esignetLoginPage.verifyLoginHeader("Kannada"), "verify login text in Kannada");
        assertTrue(esignetLoginPage.verifyLanguagePleaseEnterUinHeaderTextDisplayed("Kannada"), "verify if enter uin/vid header in Kannada");

    }

    @Test
    public void changeLanguageToArabicAndVerifyEsignetPage() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnLanguage().clickOnArabicLanguageButton();

        UnlockApplicationPage unlockApplicationPage = new UnlockApplicationPage(getDriver());
        assertTrue(unlockApplicationPage.isUnlockApplicationPageLoadedInArabic(), "Verify if language is changed to arabic");
        unlockApplicationPage.clickOnUnlockApplicationButton();
        setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnHomeButton();
        AddNewCardPage addNewCardPage = homePage.downloadCard();
        ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();
        esignetLoginPage.clickOnCredentialTypeHeadingMOSIPVerifiableCredential();
        esignetLoginPage.clickOnEsignetLoginWithOtpButton();
        assertTrue(esignetLoginPage.verifyLoginHeader("Arabic"), "verify login text in arabic");
        assertTrue(esignetLoginPage.verifyLanguagePleaseEnterUinHeaderTextDisplayed("Arabic"), "verify if enter uin/vid header in arabic");

    }

    @Test
    public void changeLanguageToFillipineAndVerifyEsignetPage() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnLanguage().clickOnKannadaLanguage();

        assertTrue(settingsPage.verifyKannadaLanguage(), "Verify if language is changed to Kannada");
        homePage.clickOnHomeButton();

        AddNewCardPage addNewCardPage = homePage.downloadCard();
        ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();
        esignetLoginPage.clickOnCredentialTypeHeadingMOSIPVerifiableCredential();
        esignetLoginPage.clickOnEsignetLoginWithOtpButton();
        assertTrue(esignetLoginPage.verifyLoginHeader("Kannada"), "verify login text in Kannada");
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
        assertTrue(esignetLoginPage.verifyLoginHeader("Kannada"), "verify login text in Kannada");
        assertTrue(esignetLoginPage.verifyLanguagePleaseEnterUinHeaderTextDisplayed("Kannada"), "verify if enter uin/vid header in Kannada");
    }

    @Test
    public void changeLanguageFromKannadaToEnglishAndVerifyEsignetPage() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnLanguage().clickOnKannadaLanguage();

        assertTrue(settingsPage.verifyKannadaLanguage(), "Verify if language is changed to Kannada");
        homePage.clickOnHomeButton();

        AddNewCardPage addNewCardPage = homePage.downloadCard();
        ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();
        esignetLoginPage.clickOnCredentialTypeHeadingMOSIPVerifiableCredential();
        esignetLoginPage.clickOnEsignetLoginWithOtpButton();
        assertTrue(esignetLoginPage.verifyLoginHeader("Kannada"), "verify login text in Kannada");
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
        assertTrue(esignetLoginPage.verifyLoginHeader("English"), "verify login text in english");
        assertTrue(esignetLoginPage.verifyLanguagePleaseEnterUinHeaderTextDisplayed("English"), "verify if enter uin/vid header in english");
    }

    @Test
    public void verifyWelcomePagesContentEnglish() {

        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        assertTrue(welcomePage.isSelectAppUnlockMethodHeaderTextDisplayed(), "Verify if select app unlock method header  displayed");
        assertTrue(welcomePage.isWelcomePageDescriptionTextDisplayed(), "Verify if select app unlock method description  displayed");
        assertTrue(welcomePage.isPasswordTypeDescriptionTextDisplayed(), "Verify if password type description displayed");
        assertTrue(welcomePage.getWelcomeDescription("English"), "Keep your digital credential with you at all times. Inji helps you manage and use them effectively. To get started, add cards to your profile.");
        welcomePage.clickOnNextButton();

        SecureSharingPage secureSharingPage = new SecureSharingPage(getDriver());
        assertTrue(secureSharingPage.isRequesterHeaderTextDisplayed(), "Verify if requester header displayed");
        assertTrue(secureSharingPage.isPleaseSelectIdTextDisplayed(), "Verify if please select id text displayed");
        assertTrue(secureSharingPage.verifyLanguageForSecureSharingPageLoaded("English"), "Secure Sharing");
        assertTrue(secureSharingPage.getSecureSharingDescription("English"), "Share your cards securely in a hassle free way and avail various services.");
        secureSharingPage.clickOnNextButton();

        TrustedDigitalWalletPage trustedDigitalWalletPage = new TrustedDigitalWalletPage(getDriver());
        assertTrue(trustedDigitalWalletPage.isInjiLogoDisplayed(), "Verify if injilogo displayed");
        assertTrue(trustedDigitalWalletPage.isHelpTextDisplayed(), "Verify if help text displayed");
        assertTrue(trustedDigitalWalletPage.verifyLanguageforTrustedDigitalWalletPageLoaded("English"), "Trusted Digital Wallet");
        assertTrue(trustedDigitalWalletPage.getTrustedDigitalWalletDescription("English"), "Store and carry all your important cards in a single trusted wallet.");
        trustedDigitalWalletPage.clickOnNextButton();

        QuickAccessPage quickAccessPage = new QuickAccessPage(getDriver());
        assertTrue(quickAccessPage.isHoldPhoneSteadyMessageDisplayed(), "Verify if hold phone steady message displayed");
        assertTrue(quickAccessPage.verifyQuickAccessTitle("English"), "Quick Access");
        assertTrue(quickAccessPage.VerifyQuickAccessDescription("English"), "Authenticate yourself with ease using the stored digital credential.");
        quickAccessPage.clickOnNextButton();

        BackupDataTourPage backupDataPage = new BackupDataTourPage(getDriver());
        assertTrue(backupDataPage.isAccountSectionHeaderDisplayed(), "Verify if account section header displayed");
        assertTrue(backupDataPage.isLastBackupSectionHeaderDisplayed(), "Verify if last backup section header displayed");
        assertTrue(backupDataPage.isBackupAndRestoreDisplayed(), "Verify if backup and restore displayed");
        assertTrue(backupDataPage.verifyBackupDataAndRestoreTitle("English"), "Backup & Restore");
        assertTrue(backupDataPage.verifyBackupDataDescription("English"), "Protect your data with ease using our Backup & Restore feature. Safely store your VCs against loss or accidents by creating regular backups and recover it effortlessly whenever needed for seamless continuity.");
    }

    @Test
    public void verifyWelcomePagesContentInFilipino() {

        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
        chooseLanguagePage.clickOnFilipinoLangauge();
        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        assertTrue(welcomePage.isSelectAppUnlockMethodHeaderTextDisplayed(), "Verify if select app unlock method header  displayed");
        assertTrue(welcomePage.isWelcomePageDescriptionTextDisplayed(), "Verify if select app unlock method description  displayed");
        assertTrue(welcomePage.isPasswordTypeDescriptionTextDisplayed(), "Verify if password type description displayed");
        assertTrue(welcomePage.getWelcomeDescription("Filipino"), "Keep your digital credential with you at all times. Inji helps you manage and use them effectively. To get started, add cards to your profile.");
        welcomePage.clickOnNextButton();

        SecureSharingPage secureSharingPage = new SecureSharingPage(getDriver());
//        assertTrue(secureSharingPage.isRequesterHeaderTextDisplayed(), "Verify if requester header displayed");
//        assertTrue(secureSharingPage.isPleaseSelectIdTextDisplayed(), "Verify if please select id text displayed");
        assertTrue(secureSharingPage.verifyLanguageForSecureSharingPageLoaded("Filipino"), "Secure Sharing");
        assertTrue(secureSharingPage.getSecureSharingDescription("Filipino"), "Share your cards securely in a hassle free way and avail various services.");
        secureSharingPage.clickOnNextButton();

        TrustedDigitalWalletPage trustedDigitalWalletPage = new TrustedDigitalWalletPage(getDriver());
        assertTrue(trustedDigitalWalletPage.isInjiLogoDisplayed(), "Verify if injilogo displayed");
        assertTrue(trustedDigitalWalletPage.isHelpTextDisplayed(), "Verify if help text displayed");
        assertTrue(trustedDigitalWalletPage.verifyLanguageforTrustedDigitalWalletPageLoaded("Filipino"), "Trusted Digital Wallet");
        assertTrue(trustedDigitalWalletPage.getTrustedDigitalWalletDescription("Filipino"), "Store and carry all your important cards in a single trusted wallet.");
        trustedDigitalWalletPage.clickOnNextButton();

        QuickAccessPage quickAccessPage = new QuickAccessPage(getDriver());
        assertTrue(quickAccessPage.isHoldPhoneSteadyMessageDisplayed(), "Verify if hold phone steady message displayed");
        assertTrue(quickAccessPage.verifyQuickAccessTitle("Filipino"), "Quick Access");
        assertTrue(quickAccessPage.VerifyQuickAccessDescription("Filipino"), "Authenticate yourself with ease using the stored digital credential.");
        quickAccessPage.clickOnNextButton();

        BackupDataTourPage backupDataPage = new BackupDataTourPage(getDriver());
        assertTrue(backupDataPage.isAccountSectionHeaderDisplayed(), "Verify if account section header displayed");
        assertTrue(backupDataPage.isLastBackupSectionHeaderDisplayed(), "Verify if last backup section header displayed");
//        assertTrue(backupDataPage.isBackupAndRestoreDisplayed(), "Verify if backup and restore displayed");
        assertTrue(backupDataPage.verifyBackupDataAndRestoreTitle("Filipino"), "Backup & Restore");
        assertTrue(backupDataPage.verifyBackupDataDescription("Filipino"), "Protect your data with ease using our Backup & Restore feature. Safely store your VCs against loss or accidents by creating regular backups and recover it effortlessly whenever needed for seamless continuity.");
    }

    @Test
    public void verifyWelcomePagesContentInHindi() {

        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
        chooseLanguagePage.clickOnHindiLanguage();
        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        assertTrue(welcomePage.isSelectAppUnlockMethodHeaderTextDisplayed(), "Verify if select app unlock method header  displayed");
        assertTrue(welcomePage.isWelcomePageDescriptionTextDisplayed(), "Verify if select app unlock method description  displayed");
        assertTrue(welcomePage.isPasswordTypeDescriptionTextDisplayed(), "Verify if password type description displayed");
        assertTrue(welcomePage.getWelcomeDescription("Hindi"), "Keep your digital credential with you at all times. Inji helps you manage and use them effectively. To get started, add cards to your profile.");
        welcomePage.clickOnNextButton();

        SecureSharingPage secureSharingPage = new SecureSharingPage(getDriver());
//        assertTrue(secureSharingPage.isRequesterHeaderTextDisplayed(), "Verify if requester header displayed");
//        assertTrue(secureSharingPage.isPleaseSelectIdTextDisplayed(), "Verify if please select id text displayed");
        assertTrue(secureSharingPage.verifyLanguageForSecureSharingPageLoaded("Hindi"), "Secure Sharing");
        assertTrue(secureSharingPage.getSecureSharingDescription("Hindi"), "Share your cards securely in a hassle free way and avail various services.");
        secureSharingPage.clickOnNextButton();

        TrustedDigitalWalletPage trustedDigitalWalletPage = new TrustedDigitalWalletPage(getDriver());
        assertTrue(trustedDigitalWalletPage.isInjiLogoDisplayed(), "Verify if injilogo displayed");
        assertTrue(trustedDigitalWalletPage.isHelpTextDisplayed(), "Verify if help text displayed");
        assertTrue(trustedDigitalWalletPage.verifyLanguageforTrustedDigitalWalletPageLoaded("Hindi"), "Trusted Digital Wallet");
        assertTrue(trustedDigitalWalletPage.getTrustedDigitalWalletDescription("Hindi"), "Store and carry all your important cards in a single trusted wallet.");
        trustedDigitalWalletPage.clickOnNextButton();

        QuickAccessPage quickAccessPage = new QuickAccessPage(getDriver());
        assertTrue(quickAccessPage.isHoldPhoneSteadyMessageDisplayed(), "Verify if hold phone steady message displayed");
        assertTrue(quickAccessPage.verifyQuickAccessTitle("Hindi"), "Quick Access");
        assertTrue(quickAccessPage.VerifyQuickAccessDescription("Hindi"), "Authenticate yourself with ease using the stored digital credential.");
        quickAccessPage.clickOnNextButton();

        BackupDataTourPage backupDataPage = new BackupDataTourPage(getDriver());
        assertTrue(backupDataPage.isAccountSectionHeaderDisplayed(), "Verify if account section header displayed");
        assertTrue(backupDataPage.isLastBackupSectionHeaderDisplayed(), "Verify if last backup section header displayed");
//        assertTrue(backupDataPage.isBackupAndRestoreDisplayed(), "Verify if backup and restore displayed");
        assertTrue(backupDataPage.verifyBackupDataAndRestoreTitle("Hindi"), "Backup & Restore");
        assertTrue(backupDataPage.verifyBackupDataDescription("Hindi"), "Protect your data with ease using our Backup & Restore feature. Safely store your VCs against loss or accidents by creating regular backups and recover it effortlessly whenever needed for seamless continuity.");
    }

    @Test
    public void verifyWelcomePagesContentInKannada() {

        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
        chooseLanguagePage.clickOnKannadaLanguage();
        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        assertTrue(welcomePage.isSelectAppUnlockMethodHeaderTextDisplayed(), "Verify if select app unlock method header  displayed");
        assertTrue(welcomePage.isWelcomePageDescriptionTextDisplayed(), "Verify if select app unlock method description  displayed");
        assertTrue(welcomePage.isPasswordTypeDescriptionTextDisplayed(), "Verify if password type description displayed");
        assertTrue(welcomePage.getWelcomeDescription("Kannada"), "Keep your digital credential with you at all times. Inji helps you manage and use them effectively. To get started, add cards to your profile.");
        welcomePage.clickOnNextButton();

        SecureSharingPage secureSharingPage = new SecureSharingPage(getDriver());
//        assertTrue(secureSharingPage.isRequesterHeaderTextDisplayed(), "Verify if requester header displayed");
//        assertTrue(secureSharingPage.isPleaseSelectIdTextDisplayed(), "Verify if please select id text displayed");
        assertTrue(secureSharingPage.verifyLanguageForSecureSharingPageLoaded("Kannada"), "Secure Sharing");
        assertTrue(secureSharingPage.getSecureSharingDescription("Kannada"), "Share your cards securely in a hassle free way and avail various services.");
        secureSharingPage.clickOnNextButton();

        TrustedDigitalWalletPage trustedDigitalWalletPage = new TrustedDigitalWalletPage(getDriver());
        assertTrue(trustedDigitalWalletPage.isInjiLogoDisplayed(), "Verify if injilogo displayed");
        assertTrue(trustedDigitalWalletPage.isHelpTextDisplayed(), "Verify if help text displayed");
        assertTrue(trustedDigitalWalletPage.verifyLanguageforTrustedDigitalWalletPageLoaded("Kannada"), "Trusted Digital Wallet");
        assertTrue(trustedDigitalWalletPage.getTrustedDigitalWalletDescription("Kannada"), "Store and carry all your important cards in a single trusted wallet.");
        trustedDigitalWalletPage.clickOnNextButton();

        QuickAccessPage quickAccessPage = new QuickAccessPage(getDriver());
        assertTrue(quickAccessPage.isHoldPhoneSteadyMessageDisplayed(), "Verify if hold phone steady message displayed");
        assertTrue(quickAccessPage.verifyQuickAccessTitle("Kannada"), "Quick Access");
        assertTrue(quickAccessPage.VerifyQuickAccessDescription("Kannada"), "Authenticate yourself with ease using the stored digital credential.");
        quickAccessPage.clickOnNextButton();

        BackupDataTourPage backupDataPage = new BackupDataTourPage(getDriver());
        assertTrue(backupDataPage.isAccountSectionHeaderDisplayed(), "Verify if account section header displayed");
        assertTrue(backupDataPage.isLastBackupSectionHeaderDisplayed(), "Verify if last backup section header displayed");
//        assertTrue(backupDataPage.isBackupAndRestoreDisplayed(), "Verify if backup and restore displayed");
        assertTrue(backupDataPage.verifyBackupDataAndRestoreTitle("Kannada"), "Backup & Restore");
        assertTrue(backupDataPage.verifyBackupDataDescription("Kannada"), "Protect your data with ease using our Backup & Restore feature. Safely store your VCs against loss or accidents by creating regular backups and recover it effortlessly whenever needed for seamless continuity.");
    }


    @Test
    public void verifyWelcomePagesContentInTamil() {

        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
        chooseLanguagePage.clickOnTamilLanguage();
        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        assertTrue(welcomePage.isSelectAppUnlockMethodHeaderTextDisplayed(), "Verify if select app unlock method header  displayed");
        assertTrue(welcomePage.isWelcomePageDescriptionTextDisplayed(), "Verify if select app unlock method description  displayed");
        assertTrue(welcomePage.isPasswordTypeDescriptionTextDisplayed(), "Verify if password type description displayed");
        assertTrue(welcomePage.getWelcomeDescription("Tamil"), "Keep your digital credential with you at all times. Inji helps you manage and use them effectively. To get started, add cards to your profile.");
        welcomePage.clickOnNextButton();

        SecureSharingPage secureSharingPage = new SecureSharingPage(getDriver());
//        assertTrue(secureSharingPage.isRequesterHeaderTextDisplayed(), "Verify if requester header displayed");
//        assertTrue(secureSharingPage.isPleaseSelectIdTextDisplayed(), "Verify if please select id text displayed");
        assertTrue(secureSharingPage.verifyLanguageForSecureSharingPageLoaded("Tamil"), "Secure Sharing");
        assertTrue(secureSharingPage.getSecureSharingDescription("Tamil"), "Share your cards securely in a hassle free way and avail various services.");
        secureSharingPage.clickOnNextButton();

        TrustedDigitalWalletPage trustedDigitalWalletPage = new TrustedDigitalWalletPage(getDriver());
        assertTrue(trustedDigitalWalletPage.isInjiLogoDisplayed(), "Verify if injilogo displayed");
        assertTrue(trustedDigitalWalletPage.isHelpTextDisplayed(), "Verify if help text displayed");
        assertTrue(trustedDigitalWalletPage.verifyLanguageforTrustedDigitalWalletPageLoaded("Tamil"), "Trusted Digital Wallet");
        assertTrue(trustedDigitalWalletPage.getTrustedDigitalWalletDescription("Tamil"), "Store and carry all your important cards in a single trusted wallet.");
        trustedDigitalWalletPage.clickOnNextButton();

        QuickAccessPage quickAccessPage = new QuickAccessPage(getDriver());
        assertTrue(quickAccessPage.isHoldPhoneSteadyMessageDisplayed(), "Verify if hold phone steady message displayed");
        assertTrue(quickAccessPage.verifyQuickAccessTitle("Tamil"), "Quick Access");
        assertTrue(quickAccessPage.VerifyQuickAccessDescription("Tamil"), "Authenticate yourself with ease using the stored digital credential.");
        quickAccessPage.clickOnNextButton();

        BackupDataTourPage backupDataPage = new BackupDataTourPage(getDriver());
        assertTrue(backupDataPage.isAccountSectionHeaderDisplayed(), "Verify if account section header displayed");
        assertTrue(backupDataPage.isLastBackupSectionHeaderDisplayed(), "Verify if last backup section header displayed");
//        assertTrue(backupDataPage.isBackupAndRestoreDisplayed(), "Verify if backup and restore displayed");
        assertTrue(backupDataPage.verifyBackupDataAndRestoreTitle("Tamil"), "Backup & Restore");
        assertTrue(backupDataPage.verifyBackupDataDescription("Tamil"), "Protect your data with ease using our Backup & Restore feature. Safely store your VCs against loss or accidents by creating regular backups and recover it effortlessly whenever needed for seamless continuity.");
    }

    @Test(enabled = false)
    public void verifyWelcomePagesContentInArabic() {

        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
        chooseLanguagePage.clickOnArabicLanguage();
        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        assertTrue(welcomePage.isSelectAppUnlockMethodHeaderTextDisplayed(), "Verify if select app unlock method header  displayed");
        assertTrue(welcomePage.isWelcomePageDescriptionTextDisplayed(), "Verify if select app unlock method description  displayed");
        assertTrue(welcomePage.isPasswordTypeDescriptionTextDisplayed(), "Verify if password type description displayed");
        assertTrue(welcomePage.getWelcomeDescription("Arabic"), "Keep your digital credential with you at all times. Inji helps you manage and use them effectively. To get started, add cards to your profile.");
        welcomePage.clickOnNextButton();

        SecureSharingPage secureSharingPage = new SecureSharingPage(getDriver());
//        assertTrue(secureSharingPage.isRequesterHeaderTextDisplayed(), "Verify if requester header displayed");
//        assertTrue(secureSharingPage.isPleaseSelectIdTextDisplayed(), "Verify if please select id text displayed");
        assertTrue(secureSharingPage.verifyLanguageForSecureSharingPageLoaded("Arabic"), "Secure Sharing");
        assertTrue(secureSharingPage.getSecureSharingDescription("Arabic"), "Share your cards securely in a hassle free way and avail various services.");
        secureSharingPage.clickOnNextButton();

        TrustedDigitalWalletPage trustedDigitalWalletPage = new TrustedDigitalWalletPage(getDriver());
        assertTrue(trustedDigitalWalletPage.isInjiLogoDisplayed(), "Verify if injilogo displayed");
        assertTrue(trustedDigitalWalletPage.isHelpTextDisplayed(), "Verify if help text displayed");
        assertTrue(trustedDigitalWalletPage.verifyLanguageforTrustedDigitalWalletPageLoaded("Arabic"), "Trusted Digital Wallet");
        assertTrue(trustedDigitalWalletPage.getTrustedDigitalWalletDescription("Arabic"), "Store and carry all your important cards in a single trusted wallet.");
        trustedDigitalWalletPage.clickOnNextButton();

        QuickAccessPage quickAccessPage = new QuickAccessPage(getDriver());
        assertTrue(quickAccessPage.isHoldPhoneSteadyMessageDisplayed(), "Verify if hold phone steady message displayed");
        assertTrue(quickAccessPage.verifyQuickAccessTitle("Arabic"), "Quick Access");
        assertTrue(quickAccessPage.VerifyQuickAccessDescription("Arabic"), "Authenticate yourself with ease using the stored digital credential.");
        quickAccessPage.clickOnNextButton();

        BackupDataTourPage backupDataPage = new BackupDataTourPage(getDriver());
        assertTrue(backupDataPage.isAccountSectionHeaderDisplayed(), "Verify if account section header displayed");
        assertTrue(backupDataPage.isLastBackupSectionHeaderDisplayed(), "Verify if last backup section header displayed");
//        assertTrue(backupDataPage.isBackupAndRestoreDisplayed(), "Verify if backup and restore displayed");
        assertTrue(backupDataPage.verifyBackupDataAndRestoreTitle("Arabic"), "Backup & Restore");
        assertTrue(backupDataPage.verifyBackupDataDescription("Arabic"), "Protect your data with ease using our Backup & Restore feature. Safely store your VCs against loss or accidents by creating regular backups and recover it effortlessly whenever needed for seamless continuity.");
    }

}
