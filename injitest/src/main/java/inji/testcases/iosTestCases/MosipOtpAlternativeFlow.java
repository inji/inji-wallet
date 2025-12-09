package inji.testcases.iosTestCases;

import inji.annotations.NeedsUIN;
import inji.constants.InjiWalletConstants;
import inji.constants.PlatformType;
import inji.pages.*;
import inji.testcases.BaseTest.IosBaseTest;
import inji.utils.*;
import org.testng.annotations.Test;
import org.testng.asserts.SoftAssert;

import static org.testng.Assert.assertTrue;
import static org.testng.AssertJUnit.assertEquals;

public class MosipOtpAlternativeFlow extends IosBaseTest {
    @Test
    @NeedsUIN
    public void verifyInvalidOtpMessage() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        //assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        //assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        //assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        //assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

        //assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
        //assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");

        AddNewCardPage addNewCardPage = homePage.downloadCard();

        ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();
        addNewCardPage.clickOnContinueButtonInSigninPopupIos();

//        esignetLoginPage.clickOnEsignetLoginWithOtpButton();
        OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getUIN());

        esignetLoginPage.clickOnGetOtpButton();
        otpVerification.enterOtpForeSignet(TestDataReader.readData("invalidOtp"), PlatformType.IOS);
        esignetLoginPage.clickOnVerifyButtonIos();

        assertEquals(ResourceBundleLoader.get(InjiWalletConstants.invalidOtpErrorMessage), otpVerification.getInvalidOtpMessageForEsignet());
    }

    @Test
    @NeedsUIN
    public void activateVcFromDetailedViewPage() throws InterruptedException {
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

        ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();
        addNewCardPage.clickOnContinueButtonInSigninPopupIos();

//        esignetLoginPage.clickOnEsignetLoginWithOtpButton();
        OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getUIN());

        esignetLoginPage.clickOnGetOtpButton();
        otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtp(), PlatformType.IOS);
        esignetLoginPage.clickOnVerifyButtonIos();

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");

        DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();
        assertTrue(detailedVcViewPage.isDetailedVcViewPageLoaded(), "Verify if detailed Vc view page is displayed");
        IosUtil.scrollToElement(getDriver(), 100, 800, 100, 200);
        PleaseConfirmPopupPage pleaseConfirmPopupPage = detailedVcViewPage.clickOnActivateButtonIos();

        assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if pop up page is displayed");
        OtpVerificationPage otpVerificationPage = pleaseConfirmPopupPage.clickOnConfirmButton();

        assertTrue(otpVerificationPage.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
        otpVerificationPage.enterOtp(TestDataReader.readData("passcode"), PlatformType.IOS);

        assertTrue(detailedVcViewPage.isProfileAuthenticatedDisplayed(), "Verify if VC is activated");
    }

    @Test
    @NeedsUIN
    public void verifyActiveVcAndWaitForOtpTimeOut() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        //assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        //assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        //assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        //assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

        //assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
        //assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");

        AddNewCardPage addNewCardPage = homePage.downloadCard();

        ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();
        addNewCardPage.clickOnContinueButtonInSigninPopupIos();

//        esignetLoginPage.clickOnEsignetLoginWithOtpButton();
        OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getUIN());

        esignetLoginPage.clickOnGetOtpButton();
        otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtp(), PlatformType.IOS);
        esignetLoginPage.clickOnVerifyButtonIos();

        addNewCardPage.clickOnDoneButton();
        //assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();

        assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");
        PleaseConfirmPopupPage pleaseConfirmPopupPage = moreOptionsPage.clickOnActivationPending();

        //assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if pop up page is displayed");
        OtpVerificationPage otpVerificationPage = pleaseConfirmPopupPage.clickOnConfirmButton();

        assertTrue(otpVerification.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
        assertTrue(otpVerification.verifyOtpVerificationDescriptionDisplayed(), "Verify if otp verification description displayed");

        otpVerification.WaitingTimeForVerificationTimerComplete();
        assertTrue(otpVerification.verifyResendCodeButtonDisplayedEnabled(), "Verify if resend code is enabled");
        otpVerification.clickOnResendButton();
        assertTrue(otpVerification.verifyOtpVerificationTimerDisplayedAfterClickOnResend(), "verify is You can resend the code displayed again after click on resend button ");
    }

    @Test
    @NeedsUIN
    public void cancelDeleteVc() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        //assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        //assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        //assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        //assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

        //assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
        //assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        AddNewCardPage addNewCardPage = homePage.downloadCard();

        ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();
        addNewCardPage.clickOnContinueButtonInSigninPopupIos();

//        esignetLoginPage.clickOnEsignetLoginWithOtpButton();
        OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getUIN());

        esignetLoginPage.clickOnGetOtpButton();
        otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtp(), PlatformType.IOS);
        esignetLoginPage.clickOnVerifyButtonIos();

        addNewCardPage.clickOnDoneButton();
        //assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");

        MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();
        //assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");

        PleaseConfirmPopupPage pleaseConfirmPopupPage = moreOptionsPage.clickOnRemoveFromWallet();
        assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if pop up page is displayed");

        pleaseConfirmPopupPage.clickOnNoButton();
//        assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");

//        moreOptionsPage.clickOnCloseButton();
//        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
    }

    @Test
    @NeedsUIN
    public void DownloadingDeletedVc() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        //assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        //assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        //assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        //assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

        //assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
        //assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        AddNewCardPage addNewCardPage = homePage.downloadCard();

        ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();
        addNewCardPage.clickOnContinueButtonInSigninPopupIos();

//        esignetLoginPage.clickOnEsignetLoginWithOtpButton();
        OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getUIN());

        esignetLoginPage.clickOnGetOtpButton();
        otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtp(), PlatformType.IOS);
        esignetLoginPage.clickOnVerifyButtonIos();

        addNewCardPage.clickOnDoneButton();
        //assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");

        MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();
        //assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");

        PleaseConfirmPopupPage pleaseConfirmPopupPage = moreOptionsPage.clickOnRemoveFromWallet();
        //assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if pop up page is displayed");

        pleaseConfirmPopupPage.clickOnConfirmButton();
//        addNewCardPage.clickOnDoneButton();
//        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");

        homePage.downloadCard();

        addNewCardPage.clickOnDownloadViaEsignet();
        addNewCardPage.clickOnContinueButtonInSigninPopupIos();

//        esignetLoginPage.clickOnEsignetLoginWithOtpButton();
        esignetLoginPage.setEnterIdTextBox(getUIN());

        esignetLoginPage.clickOnGetOtpButton();
        otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtp(), PlatformType.IOS);
        esignetLoginPage.clickOnVerifyButtonIos();

//        addNewCardPage.clickOnDoneButton();
        //assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");

        HistoryPage historyPage = homePage.clickOnHistoryButton();
        assertTrue(historyPage.isHistoryPageLoaded(), "Verify if history page is displayed");

        assertTrue(historyPage.verifyHistory(getUIN(), PlatformType.IOS));

//        assertEquals(historyPage.getNumberOfRecordsInHistory(getUIN(), Target.IOS), 2,"Verify two download records in history page");
        assertTrue(historyPage.verifyDeleteHistory(getUIN(), PlatformType.IOS), "Verify if deleted history is displayed");
    }

    @Test
    @NeedsUIN
    public void deleteDownloadedVcInOfflineMode() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        //assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        //assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        //assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        //assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

        //assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
        //assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        AddNewCardPage addNewCardPage = homePage.downloadCard();

        ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();
        addNewCardPage.clickOnContinueButtonInSigninPopupIos();

//        esignetLoginPage.clickOnEsignetLoginWithOtpButton();
        OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getUIN());

        esignetLoginPage.clickOnGetOtpButton();
        otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtp(), PlatformType.IOS);
        esignetLoginPage.clickOnVerifyButtonIos();

        addNewCardPage.clickOnDoneButton();
        //assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        String sessionId = getDriver().getSessionId().toString();
        UpdateNetworkSettings.setNoNetworkProfile(sessionId);

        MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();
        //assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");

        PleaseConfirmPopupPage pleaseConfirmPopupPage = moreOptionsPage.clickOnRemoveFromWallet();
        //assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if pop up page is displayed");

        pleaseConfirmPopupPage.clickOnConfirmButton();

        UpdateNetworkSettings.resetNetworkProfile(sessionId);
        assertEquals(homePage.verifyLanguageForNoVCDownloadedPageLoaded(), "Bring your digital identity");
    }

    @Test
    @NeedsUIN
    public void openQrOffline() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        //assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        //assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        //assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        //assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

        //assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
        //assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        AddNewCardPage addNewCardPage = homePage.downloadCard();

        ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();
        addNewCardPage.clickOnContinueButtonInSigninPopupIos();

//        esignetLoginPage.clickOnEsignetLoginWithOtpButton();
        OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getUIN());

        esignetLoginPage.clickOnGetOtpButton();
        otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtp(), PlatformType.IOS);
        esignetLoginPage.clickOnVerifyButtonIos();

        addNewCardPage.clickOnDoneButton();
        //assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        String sessionId = getDriver().getSessionId().toString();
        UpdateNetworkSettings.setNoNetworkProfile(sessionId);

        DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();
        detailedVcViewPage.clickOnQrCodeButton();
        SoftAssert softAssert = new SoftAssert();
        softAssert.assertTrue(detailedVcViewPage.isQrCodeDisplayed(), "Verify if QR Code header is displayed");

        detailedVcViewPage.clickOnQrCrossIcon();
        addNewCardPage.clickOnDoneButton();
//        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
    }

    @Test
    public void verifyVcIssuerListWithoutNetwork() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        //assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        //assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        //assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        //assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

        //assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
        //assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");

        AddNewCardPage addNewCardPage = homePage.downloadCard();

        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
        String sessionId = getDriver().getSessionId().toString();
        UpdateNetworkSettings.setNoNetworkProfile(sessionId);

        addNewCardPage.clickOnBack();

        homePage.downloadCard();
        assertTrue(addNewCardPage.isDownloadViaSunbirdDisplayed(), "Verify if issuer sunbird displayed");
        assertTrue(addNewCardPage.isIssuerDescriptionEsignetDisplayed(), "Verify if issuer description  esignet displayed");
    }

    @Test
    @NeedsUIN
    public void VerifyCameraOpenAfterPinVc() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        //assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        //assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        //assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        //assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

        //assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
        //assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        AddNewCardPage addNewCardPage = homePage.downloadCard();

        ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();
        addNewCardPage.clickOnContinueButtonInSigninPopupIos();

//        esignetLoginPage.clickOnEsignetLoginWithOtpButton();
        OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getUIN());

        esignetLoginPage.clickOnGetOtpButton();
        otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtp(), PlatformType.IOS);
        esignetLoginPage.clickOnVerifyButtonIos();

        addNewCardPage.clickOnDoneButton();
        //assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();

        //assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");
        moreOptionsPage.clickOnPinOrUnPinCard();

        assertTrue(homePage.isPinIconDisplayed(), "Verify if pin icon on vc is displayed");
        SharePage scanPage = homePage.clickOnShareButton();
        scanPage.acceptPermissionPopupBluetoothIos();
        scanPage.acceptPermissionPopupCameraIos();

        assertTrue(scanPage.isCameraPageLoaded(), "Verify camera page is displayed");
        assertTrue(scanPage.isFlipCameraClickable(), "Verify if flip camera is enabled");
        assertTrue(scanPage.isCameraOpen(), "Verify if camera is displayed");
    }
}