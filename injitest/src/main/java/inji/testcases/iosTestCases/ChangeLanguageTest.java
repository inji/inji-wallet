package inji.testcases.iosTestCases;

import inji.annotations.NeedsSunbirdPolicy;
import inji.annotations.NeedsUIN;
import inji.constants.PlatformType;
import inji.pages.*;
import inji.testcases.BaseTest.IosBaseTest;
import inji.utils.InjiWalletUtil;
import inji.utils.IosUtil;
import inji.utils.TestDataReader;
import org.testng.annotations.Test;
import org.testng.asserts.SoftAssert;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

public class ChangeLanguageTest extends IosBaseTest {

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
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

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
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnLanguage();

        assertTrue(settingsPage.verifyLanguagesInLanguageFilter("IOS"), "Verify if all languages are shown in language filter");
    }

    @Test
    public void verifyTuvaliVersion() {
        SoftAssert softAssert = new SoftAssert();
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        softAssert.assertTrue(settingsPage.clickOnAboutInji().isTuvaliVersionPresent());
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
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        UnlockApplicationPage unlockApplicationPage = settingsPage.clickOnLanguage().clickOnArabicLanguageButton();

        assertTrue(unlockApplicationPage.isUnlockApplicationPageLoadedInArabic(), "Verify if language is changed to arabic");
        unlockApplicationPage.clickOnUnlockApplicationButton();
        setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);
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
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

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
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

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
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

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

        addNewCardPage.sendTextInIssuerSearchBar("राष्ट्रीय पहचान विभाग");
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
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

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
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

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
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

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
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

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
    @NeedsUIN
    public void DownladvcAndVerifyInArabicAndHindiLanguage() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        AddNewCardPage addNewCardPage = homePage.downloadCard();

        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();

        assertTrue(retrieveIdPage.isRetrieveIdPageLoaded(), "Verify if retrieve id page is displayed");
        OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(getUIN()).clickOnGenerateCardButton();

        assertTrue(otpVerification.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
        otpVerification.enterOtp(InjiWalletUtil.getOtp(), PlatformType.IOS);

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        UnlockApplicationPage unlockApplicationPage = settingsPage.clickOnLanguage().clickOnArabicLanguageButton();

        assertTrue(unlockApplicationPage.isUnlockApplicationPageLoadedInArabic(), "Verify if language is changed to arabic");
        unlockApplicationPage.clickOnUnlockApplicationButton();
        setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);
        DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();
        assertEquals(homePage.getFullNameTitleText(), "الاسم الكامل");
        detailedVcViewPage.clickOnBackArrow();

        homePage.clickOnSettingIcon();
        settingsPage.clickOnlanguageButtonInArabic();
        settingsPage.clickOnHindiLanguage();

        unlockApplicationPage.clickOnUnlockApplicationButton();
        setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);
        homePage.openDetailedVcView();
        assertEquals(homePage.getFullNameTitleText(), "पूरा नाम");
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
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        UnlockApplicationPage unlockApplicationPage = settingsPage.clickOnLanguage().clickOnArabicLanguageButton();

        assertTrue(unlockApplicationPage.isUnlockApplicationPageLoadedInArabic(), "Verify if language is changed to arabic");
        unlockApplicationPage.clickOnUnlockApplicationButton();
        setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);
        AddNewCardPage addNewCardPage = homePage.downloadCard();

        assertEquals(addNewCardPage.verifyLanguageForAddNewCardGuideMessage(), "يرجى اختيار جهة الإصدار المفضلة لديك من الخيارات أدناه لإضافة بطاقة جديدة.");
        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();
//        String uin = TestDataReader.readData("uin");
        OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(getUIN()).clickOnGenerateCardButton();

        assertTrue(otpVerification.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
        otpVerification.enterOtp(InjiWalletUtil.getOtp(), PlatformType.IOS);

        assertEquals(homePage.getFullNameValue(), "TEST_FULLNAMEara");

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
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        AddNewCardPage addNewCardPage = homePage.downloadCard();


        assertTrue(addNewCardPage.isDownloadViaSunbirdDisplayed(), "Verify if download sunbird displayed");
        SunbirdLoginPage sunbirdLoginPage = addNewCardPage.clickOnDownloadViaSunbird();
        addNewCardPage.clickOnCredentialTypeHeadingInsuranceCredential();
//        addNewCardPage.clickOnContinueButtonInSigninPopupIos();
        sunbirdLoginPage.enterPolicyNumber(getPolicyNumber());
        sunbirdLoginPage.enterFullName(getPolicyName());
        sunbirdLoginPage.enterDateOfBirth();
        IosUtil.scrollToElement(getDriver(), 100, 800, 100, 200);
        sunbirdLoginPage.clickOnLoginButton();

        assertTrue(sunbirdLoginPage.isSunbirdCardActive(), "Verify if download sunbird displayed active");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        homePage.clickOnCrossIconButton();
        settingsPage.clickOnLanguage().clickOnHindiLanguage();
        assertTrue(settingsPage.verifyHindiLanguage(), "Verify if language is changed to hindi");
        homePage.clickOnHomeButton();

        assertTrue(sunbirdLoginPage.isSunbirdCardLogoDisplayed(), "Verify if download sunbird logo displayed");
//        assertEquals(sunbirdLoginPage.getFullNameForSunbirdCard(),TestDataReader.readData("fullNameSunbird"));

        sunbirdLoginPage.openDetailedSunbirdVcView();

        assertEquals(sunbirdLoginPage.getFullNameForSunbirdCard(), getPolicyName());
        assertEquals(sunbirdLoginPage.getPolicyNameForSunbirdCard(), TestDataReader.readData("policyNameSunbird"));
        assertEquals(sunbirdLoginPage.getPhoneNumberForSunbirdCard(), TestDataReader.readData("phoneNumberSunbird"));
        assertTrue(sunbirdLoginPage.isDateOfBirthValueForSunbirdCardDisplayed());
        assertEquals(sunbirdLoginPage.getGenderValueForSunbirdCard(), TestDataReader.readData("genderValueSunbird"));
        assertEquals(sunbirdLoginPage.getEmailIdValueForSunbirdCard(), TestDataReader.readData("emailIdValueSunbird"));
        assertEquals(sunbirdLoginPage.getStatusValueForSunbirdCard(), "वैध");
        assertTrue(sunbirdLoginPage.isPolicyExpiresOnValueDisplayed(), "Verify if policy expireson value displayed");
        assertTrue(sunbirdLoginPage.isBenefitsValueDisplayed(), "Verify if policy expireson value displayed");
        assertEquals(sunbirdLoginPage.getIdTypeValueForSunbirdCard(), TestDataReader.readData("idTypeSunbirdHindi"));
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
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

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
        addNewCardPage.clickOnContinueButtonInSigninPopupIos();


        assertTrue(esignetLoginPage.verifyLoginHeader("HindiIos"), "verify login text in hindi");
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
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnLanguage().clickOnTamilLanguage();

        assertTrue(settingsPage.verifyTamilLanguage(), "Verify if language is changed to tamil");
        homePage.clickOnHomeButton();

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        AddNewCardPage addNewCardPage = homePage.downloadCard();

        ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();

        addNewCardPage.clickOnContinueButtonInSigninPopupIos();


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
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnLanguage().clickOnKannadaLanguage();

        assertTrue(settingsPage.verifyKannadaLanguage(), "Verify if language is changed to kannada");
        homePage.clickOnHomeButton();

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        AddNewCardPage addNewCardPage = homePage.downloadCard();

        ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();
        addNewCardPage.clickOnContinueButtonInSigninPopupIos();

        assertTrue(esignetLoginPage.verifyLoginHeader("Kannada"), "verify login text in kannada");
        assertTrue(esignetLoginPage.verifyLanguagePleaseEnterUinHeaderTextDisplayed("Kannada"), "verify if enter uin/vid header in kannada");
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
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnLanguage().clickOnArabicLanguageButton();

        UnlockApplicationPage unlockApplicationPage = new UnlockApplicationPage(getDriver());
        assertTrue(unlockApplicationPage.isUnlockApplicationPageLoadedInArabic(), "Verify if language is changed to arabic");
        unlockApplicationPage.clickOnUnlockApplicationButton();
        setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        AddNewCardPage addNewCardPage = homePage.downloadCard();

        ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();
        addNewCardPage.clickOnContinueButtonInSigninPopupIos();

        assertTrue(esignetLoginPage.verifyLoginHeader("Arabic"), "verify login text in Arabic");
        assertTrue(esignetLoginPage.verifyLanguagePleaseEnterUinHeaderTextDisplayed("Arabic"), "verify if enter uin/vid header in Arabic");
    }

    @Test
    public void changeLanguageToFillpinoAndVerifyEsignetPage() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnLanguage().clickOnKannadaLanguage();

        assertTrue(settingsPage.verifyKannadaLanguage(), "Verify if language is changed to kannada");
        homePage.clickOnHomeButton();

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        AddNewCardPage addNewCardPage = homePage.downloadCard();

        ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();
        addNewCardPage.clickOnContinueButtonInSigninPopupIos();

        assertTrue(esignetLoginPage.verifyLoginHeader("Kannada"), "verify login text in kannada");
        assertTrue(esignetLoginPage.verifyLanguagePleaseEnterUinHeaderTextDisplayed("Kannada"), "verify if enter uin/vid header in kannada");

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
        addNewCardPage.clickOnContinueButtonInSigninPopupIos();
        assertTrue(esignetLoginPage.verifyLoginHeader("Kannada"), "verify login text in kannada");
        assertTrue(esignetLoginPage.verifyLanguagePleaseEnterUinHeaderTextDisplayed("Kannada"), "verify if enter uin/vid header in kannada");
    }

    @Test
    public void changeLanguageToKannadaToEnglishAndVerifyEsignetPage() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnLanguage().clickOnKannadaLanguage();

        assertTrue(settingsPage.verifyKannadaLanguage(), "Verify if language is changed to kannada");
        homePage.clickOnHomeButton();

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        AddNewCardPage addNewCardPage = homePage.downloadCard();

        ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();
        addNewCardPage.clickOnContinueButtonInSigninPopupIos();

        assertTrue(esignetLoginPage.verifyLoginHeader("Kannada"), "verify login text in kannada");
        assertTrue(esignetLoginPage.verifyLanguagePleaseEnterUinHeaderTextDisplayed("Kannada"), "verify if enter uin/vid header in kannada");

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
        addNewCardPage.clickOnContinueButtonInSigninPopupIos();
        assertTrue(esignetLoginPage.verifyLoginHeader("English"), "verify login text in english");
        assertTrue(esignetLoginPage.verifyLanguagePleaseEnterUinHeaderTextDisplayed("English"), "verify if enter uin/vid header in english");
    }

    @Test
    public void verifyWelcomePagesFromInjiTourGuideEnglish() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnInjiTourGuide();

        assertTrue(homePage.verifyHelpFAQsHeader("English"), "Verify if help and frequently asked quations header displayed");
        assertTrue(homePage.verifyHelpFAQsDescription("English"), "Verify if help and frequently asked quations description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyDownloadCardHeader("English"), "Verify if download card header text displayed");
        assertTrue(homePage.verifyDownloadCardDescription("English"), "Verify if download card description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyShareCardHeader("English"), "Verify if share card header text displayed");
        assertTrue(homePage.verifyShareCardDescription("English"), "Verify if share card description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyAccessToHistoryHeader("English"), "Verify if access to history header text displayed");
        assertTrue(homePage.verifyAccessToHistoryDescription("English"), "Verify if access to history description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyAppSettingsHeader("English"), "Verify if app settings header text displayed");
        assertTrue(homePage.verifyAppSettingDescription("English"), "Verify if app settings description displayed");
        homePage.clickOnNextButton();
//        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");

    }

    @Test
    public void verifyWelcomePagesFromInjiTourGuideHindi() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
        chooseLanguagePage.clickOnHindiLanguage();
        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
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
//        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");

    }

    @Test
    public void verifyWelcomePagesFromInjiTourGuideKaanda() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
        chooseLanguagePage.clickOnKannadaLanguage();
        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
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
//        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");

    }

    @Test
    public void verifyWelcomePagesFromInjiTourGuideTamil() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
        chooseLanguagePage.clickOnTamilLanguage();
        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
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
//        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");

    }

    @Test
    public void verifyWelcomePagesFromInjiTourGuideWithFilipinoLangauge() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
        chooseLanguagePage.clickOnFilipinoLangauge();
        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
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
//        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");

    }

    @Test
    public void verifyWelcomePagesFromInjiTourGuideWithArabicLangauge() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
        chooseLanguagePage.clickOnArabicLanguage();
        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnInjiTourGuide();

        assertTrue(homePage.verifyHelpFAQsHeader("Arabic"), "Verify if help and frequently asked quations header displayed");
        assertTrue(homePage.verifyHelpFAQsDescription("Arabic"), "Verify if help and frequently asked quations description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyDownloadCardHeader("Arabic"), "Verify if download card header text displayed");
        assertTrue(homePage.verifyDownloadCardDescription("Arabic"), "Verify if download card description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyShareCardHeader("Arabic"), "Verify if share card header text displayed");
        assertTrue(homePage.verifyShareCardDescription("Arabic"), "Verify if share card description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyAccessToHistoryHeader("Arabic"), "Verify if access to history header text displayed");
        assertTrue(homePage.verifyAccessToHistoryDescription("Arabic"), "Verify if access to history description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyAppSettingsHeader("Arabic"), "Verify if app settings header text displayed");
        assertTrue(homePage.verifyAppSettingDescription("Arabic"), "Verify if app settings description displayed");
        homePage.clickOnNextButton();
        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");

    }
}
