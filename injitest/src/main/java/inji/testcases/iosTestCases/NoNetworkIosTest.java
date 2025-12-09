package inji.testcases.iosTestCases;

import inji.annotations.NeedsUIN;
import inji.constants.PlatformType;
import inji.pages.*;
import inji.testcases.BaseTest.IosBaseTest;
import inji.utils.InjiWalletUtil;
import inji.utils.IosUtil;
import inji.utils.TestDataReader;
import inji.utils.UpdateNetworkSettings;
import org.testng.annotations.Test;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

public class NoNetworkIosTest extends IosBaseTest {

    @Test
    public void setupPasscodeAndDownloadCardWithoutInternet() {
        String sessionId = getDriver().getSessionId().toString();
        UpdateNetworkSettings.setNoNetworkProfile(sessionId);

        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

//        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

//        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

//        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        AddNewCardPage addNewCardPage = homePage.downloadCard();

        assertTrue(homePage.verifyLanguageForNoInternetConnectionDisplayed("English"), "Verify if no internet connection is displayed");
        IosUtil.disableAirplaneMode();

        assertTrue(homePage.verifyLanguageForTryAgainButtonDisplayed("English"), "Verify if Try again button displayed");

        homePage.clickOnTryAgainButton();
        assertTrue(homePage.verifyLanguageForTryAgainButtonDisplayed("English"), "Verify if Try again button displayed");

    }

    @Test
    @NeedsUIN
    public void openCameraOnFlightMode() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

//        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

//        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

//        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

//        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

//        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
//        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        AddNewCardPage addNewCardPage = homePage.downloadCard();

//        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();

//        assertTrue(retrieveIdPage.isRetrieveIdPageLoaded(), "Verify if retrieve id page is displayed");
        OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(getUIN()).clickOnGenerateCardButton();

//        assertTrue(otpVerification.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
        otpVerification.enterOtp(InjiWalletUtil.getOtp(), PlatformType.IOS);

        addNewCardPage.clickOnDoneButton();
//        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");

        String sessionId = getDriver().getSessionId().toString();
        UpdateNetworkSettings.setNoNetworkProfile(sessionId);
        assertTrue(homePage.clickOnShareButton().acceptPermissionPopupBluetoothIos().acceptPermissionPopupBluetoothIos().isCameraOpen());
    }

    @Test
    @NeedsUIN
    public void activateVcWithoutInternet() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

//        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

//        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

//        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

//        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

//        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
//        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");

        AddNewCardPage addNewCardPage = homePage.downloadCard();

//        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();

//        assertTrue(retrieveIdPage.isRetrieveIdPageLoaded(), "Verify if retrieve id page is displayed");
        OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(getUIN()).clickOnGenerateCardButton();

//        assertTrue(otpVerification.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
        otpVerification.enterOtp(InjiWalletUtil.getOtp(), PlatformType.IOS);

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        String sessionId = getDriver().getSessionId().toString();
        UpdateNetworkSettings.setNoNetworkProfile(sessionId);

        MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();

        assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");
        PleaseConfirmPopupPage pleaseConfirmPopupPage = moreOptionsPage.clickOnActivationPending();

        assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if pop up page is displayed");
        OtpVerificationPage otpVerificationPage = pleaseConfirmPopupPage.clickOnConfirmButton();

        assertTrue(otpVerificationPage.somethingWetWrongInVcActivationDisplayed(), "Verify if Something is wrong. Please try again later! is displayed");

    }

    @Test
    public void verifyListOfLanguagesInOfflineMode() {
        String sessionId = getDriver().getSessionId().toString();
        UpdateNetworkSettings.setNoNetworkProfile(sessionId);
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

//        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

//        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

//        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

//        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

//        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
//        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnLanguage();

        assertTrue(settingsPage.verifyLanguagesInLanguageFilter("IOS"), "Verify if all languages are shown in language filter");
    }

    @Test
    public void verifyHelpPageOfflineMode() {
        String sessionId = getDriver().getSessionId().toString();
        UpdateNetworkSettings.setNoNetworkProfile(sessionId);

        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

//        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

//        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

//        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

//        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

//        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
//        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        HelpPage helpPage = homePage.clickOnHelpIcon();

        assertTrue(helpPage.isHelpPageLoaded(), "Verify if help page is displayed");
        helpPage.exitHelpPage();

//        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
    }

    @Test
    @NeedsUIN
    public void deleteDownloadedVcInOfflineMode() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

//        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

//        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

//        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

//        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

//        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
//        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        AddNewCardPage addNewCardPage = homePage.downloadCard();

//        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();

//        assertTrue(retrieveIdPage.isRetrieveIdPageLoaded(), "Verify if retrieve id page is displayed");
        OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(getUIN()).clickOnGenerateCardButton();

//        assertTrue(otpVerification.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
        otpVerification.enterOtp(InjiWalletUtil.getOtp(), PlatformType.IOS);

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        String sessionId = getDriver().getSessionId().toString();
        UpdateNetworkSettings.setNoNetworkProfile(sessionId);

        MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();
//        assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");

        PleaseConfirmPopupPage pleaseConfirmPopupPage = moreOptionsPage.clickOnRemoveFromWallet();
//        assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if pop up page is displayed");

        pleaseConfirmPopupPage.clickOnConfirmButton();

        UpdateNetworkSettings.resetNetworkProfile(sessionId);
        assertEquals(homePage.verifyLanguageForNoVCDownloadedPageLoaded(), "Bring your digital identity");

    }

    @Test
    @NeedsUIN
    public void openQrOffline() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

//        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

//        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

//        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

//        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

//        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
//        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");

        AddNewCardPage addNewCardPage = homePage.downloadCard();

//        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
        ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();
        addNewCardPage.clickOnContinueButtonInSigninPopupIos();

        OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getUIN());

        esignetLoginPage.clickOnGetOtpButton();
        otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtp(), PlatformType.IOS);
        esignetLoginPage.clickOnVerifyButtonIos();

        addNewCardPage.clickOnDoneButton();

        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        String sessionId = getDriver().getSessionId().toString();
        UpdateNetworkSettings.setNoNetworkProfile(sessionId);

        DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
    }

    @Test
    public void downloadCardWithoutInternetRetryWithInternet() throws InterruptedException {
        String sessionId = getDriver().getSessionId().toString();
        UpdateNetworkSettings.setNoNetworkProfile(sessionId);

        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

//        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

//        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

//        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

//        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

//        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
//        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        AddNewCardPage addNewCardPage = homePage.downloadCard();

        assertTrue(homePage.verifyLanguageForNoInternetConnectionDisplayed("English"), "Verify if no internet connection is displayed");
        assertTrue(homePage.verifyLanguageForTryAgainButtonDisplayed("English"), "Verify if try again button displayed");

        UpdateNetworkSettings.resetNetworkProfile(sessionId);
        homePage.clickOnTryAgainButton();
        assertTrue(homePage.isTryAgainButtonNotDisplayed(), "Wating for network come online");

        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
    }

    @Test
    public void DownloadVcWithUinWithoutNetwork() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

//        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

//        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

//        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

//        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

//        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
//        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");

        AddNewCardPage addNewCardPage = homePage.downloadCard();

//        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
        String sessionId = getDriver().getSessionId().toString();
        UpdateNetworkSettings.setNoNetworkProfile(sessionId);
        addNewCardPage.clickOnBack();

        homePage.downloadCard();
//        assertTrue(addNewCardPage.isIssuerDescriptionMosipDisplayed(), "Verify if issuer description  mosip displayed");
        assertTrue(addNewCardPage.isIssuerDescriptionEsignetDisplayed(), "Verify if issuer description  esignet displayed");

        addNewCardPage.clickOnDownloadViaUin();
        assertTrue(homePage.verifyLanguageForTryAgainButtonDisplayed("English"), "Verify if Try again button displayed");
        homePage.clickOnTryAgainButton();

        assertTrue(homePage.verifyLanguageForTryAgainButtonDisplayed("English"), "Verify if Try again button displayed");
    }

    @Test
    public void DownloadVcWithEsignetWithoutNetwork() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

//        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

//        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

//        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

//        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

//        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
//        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");

        AddNewCardPage addNewCardPage = homePage.downloadCard();

//        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
        String sessionId = getDriver().getSessionId().toString();
        UpdateNetworkSettings.setNoNetworkProfile(sessionId);
        addNewCardPage.clickOnBack();

        homePage.downloadCard();
//        assertTrue(addNewCardPage.isIssuerDescriptionMosipDisplayed(), "Verify if issuer description  mosip displayed");
//        assertTrue(addNewCardPage.isIssuerDescriptionEsignetDisplayed(), "Verify if issuer description  esignet displayed");

        addNewCardPage.clickOnMosipIssuer();
        assertTrue(homePage.verifyLanguageForTryAgainButtonDisplayed("English"), "Verify if Try again button displayed");
        homePage.clickOnTryAgainButton();

        assertTrue(homePage.verifyLanguageForTryAgainButtonDisplayed("English"), "Verify if Try again button displayed");
    }

    @Test
    public void verifyGetUinHeaderOffline() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

//        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

//        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

//        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

//        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

//        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
//        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        AddNewCardPage addNewCardPage = homePage.downloadCard();

//        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();

        assertTrue(retrieveIdPage.isRetrieveIdPageLoaded(), "Verify if retrieve id page is displayed");
        assertEquals(retrieveIdPage.verifyGetItTextDisplayed(), "Get it now using your AID.");
        GenerateUinOrVidPage generateUinOrVidPage = retrieveIdPage.clickOnGetItNowText();

        String sessionId = getDriver().getSessionId().toString();
        UpdateNetworkSettings.setNoNetworkProfile(sessionId);

        assertTrue(generateUinOrVidPage.isGenerateUinOrVidPageLoaded(), "Verify if generate uin or vid page page is displayed");
        assertEquals(generateUinOrVidPage.getRetrieveUinVidText(), "Get your UIN/VID");
    }
}
