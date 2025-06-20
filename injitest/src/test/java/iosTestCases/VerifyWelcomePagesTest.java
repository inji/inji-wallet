package iosTestCases;

import BaseTest.IosBaseTest;
import inji.api.BaseTestCase;
import inji.constants.Target;
import inji.pages.*;
import inji.utils.IosUtil;
import inji.utils.TestDataReader;
import org.testng.annotations.Test;

import static inji.api.BaseTestCase.uin;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

public class VerifyWelcomePagesTest extends IosBaseTest {

    @Test
    public void verifyWelcomePagesContent() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);
        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        assertTrue(welcomePage.getWelcomeDescription("English"), "Keep your digital credential with you at all times. Inji helps you manage and use them effectively. To get started, add cards to your profile.");
        welcomePage.clickOnNextButton();

        SecureSharingPage secureSharingPage = new SecureSharingPage(driver);
        assertTrue(secureSharingPage.verifyLanguageforSecureSharingPageLoaded("English"), "Secure Sharing");
        assertTrue(secureSharingPage.getSecureSharingDescription("English"), "Share your cards securely in a hassle free way and avail various services.");
        secureSharingPage.clickOnNextButton();

        TrustedDigitalWalletPage trustedDigitalWalletPage = new TrustedDigitalWalletPage(driver);
        assertTrue(trustedDigitalWalletPage.verifyLanguageforTrustedDigitalWalletPageLoaded("English"), "Trusted Digital Wallet");
        assertTrue(trustedDigitalWalletPage.getTrustedDigitalWalletDescription("English"), "Store and carry all your important cards in a single trusted wallet.");
        trustedDigitalWalletPage.clickOnNextButton();

        QuickAccessPage quickAccessPage = new QuickAccessPage(driver);
        assertTrue(quickAccessPage.verifyLanguageforQuickAccessTextPageLoaded("English"), "Quick Access");
        assertTrue(quickAccessPage.getQuickAccessDescription("English"), "Authenticate yourself with ease using the stored digital credential.");
        quickAccessPage.clickOnNextButton();

        BackupDataTourPage backupDataPage = new BackupDataTourPage(driver);
        assertTrue(backupDataPage.verifyLanguageforBackupDataPageLoaded("English"), "Backup & Restore");
        assertTrue(backupDataPage.getBackupDataPageDescription("English"), "Protect your data with ease using our Backup & Restore feature. Safely store your VCs against loss or accidents by creating regular backups and recover it effortlessly whenever needed for seamless continuity.");
    }
    @Test
    public void verifyWelcomePagesFromInjiTourGuide() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), Target.IOS);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), Target.IOS);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnInjiTourGuide();

        assertTrue(homePage.verifyLanguageForHelpAndFrequentlyAskedQuationsHeaderDisplayed("English"), "Verify if help and frequently asked quations header displayed");
        assertTrue(homePage.verifyLanguageForHelpAndFrequentlyAskedQuationsDescriptionDisplayed("English"), "Verify if help and frequently asked quations description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyLanguageForDownloadCardHeaderDisplayed("English"), "Verify if download card header text displayed");
        assertTrue(homePage.verifyLanguageForDownloadCardDescriptionDisplayed("English"), "Verify if download card description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyLanguageForShareCardHeaderDisplayed("English"), "Verify if share card header text displayed");
        assertTrue(homePage.verifyLanguageForShareCardDescriptionDisplayed("English"), "Verify if share card description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyLanguageForAccesstoHistoryHeaderDisplayed("English"), "Verify if access to history header text displayed");
        assertTrue(homePage.verifyLanguageForaccesstoHistoryDescriptionDisplayed("English"), "Verify if access to history description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyLanguageForAppSettingsHeaderDisplayed("English"), "Verify if app settings header text displayed");
        assertTrue(homePage.verifyLanguageForAppSettingsDescriptionDisplayed("English"), "Verify if app settings description displayed");
        homePage.clickOnNextButton();
        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");

    }

    @Test
    public void verifyGoBackFromInjiTourGuide() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), Target.IOS);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), Target.IOS);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnInjiTourGuide();

        assertTrue(homePage.verifyLanguageForHelpAndFrequentlyAskedQuationsHeaderDisplayed("English"), "Verify if help and frequently asked quations header displayed");
        assertTrue(homePage.verifyLanguageForHelpAndFrequentlyAskedQuationsDescriptionDisplayed("English"), "Verify if help and frequently asked quations description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyLanguageForDownloadCardHeaderDisplayed("English"), "Verify if download card header text displayed");
        assertTrue(homePage.verifyLanguageForDownloadCardDescriptionDisplayed("English"), "Verify if download card description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyLanguageForShareCardHeaderDisplayed("English"), "Verify if share card header text displayed");
        assertTrue(homePage.verifyLanguageForShareCardDescriptionDisplayed("English"), "Verify if share card description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyLanguageForAccesstoHistoryHeaderDisplayed("English"), "Verify if access to history header text displayed");
        assertTrue(homePage.verifyLanguageForaccesstoHistoryDescriptionDisplayed("English"), "Verify if access to history description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyLanguageForAppSettingsHeaderDisplayed("English"), "Verify if app settings header text displayed");
        assertTrue(homePage.verifyLanguageForAppSettingsDescriptionDisplayed("English"), "Verify if app settings description displayed");
        homePage.clickOnPreviousButton();

        assertTrue(homePage.verifyLanguageForAccesstoHistoryHeaderDisplayed("English"), "Verify if access to history header text displayed");
        assertTrue(homePage.verifyLanguageForaccesstoHistoryDescriptionDisplayed("English"), "Verify if access to history description displayed");
        homePage.clickOnPreviousButton();

        assertTrue(homePage.verifyLanguageForShareCardHeaderDisplayed("English"), "Verify if share card header text displayed");
        assertTrue(homePage.verifyLanguageForShareCardDescriptionDisplayed("English"), "Verify if share card description displayed");
        homePage.clickOnPreviousButton();

        assertTrue(homePage.verifyLanguageForDownloadCardHeaderDisplayed("English"), "Verify if download card header text displayed");
        assertTrue(homePage.verifyLanguageForDownloadCardDescriptionDisplayed("English"), "Verify if download card description displayed");
        homePage.clickOnPreviousButton();

        assertTrue(homePage.verifyLanguageForHelpAndFrequentlyAskedQuationsHeaderDisplayed("English"), "Verify if help and frequently asked quations header displayed");
        assertTrue(homePage.verifyLanguageForHelpAndFrequentlyAskedQuationsDescriptionDisplayed("English"), "Verify if help and frequently asked quations description displayed");
    }

    @Test
    public void verifyClickOnBackFromInjiTourGuide() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), Target.IOS);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), Target.IOS);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnInjiTourGuide();

        assertTrue(homePage.verifyLanguageForHelpAndFrequentlyAskedQuationsHeaderDisplayed("English"), "Verify if help and frequently asked quations header displayed");
        assertTrue(homePage.verifyLanguageForHelpAndFrequentlyAskedQuationsDescriptionDisplayed("English"), "Verify if help and frequently asked quations description displayed");

        IosUtil.scrollToElement(driver,58,712,160,129);
        assertEquals(homePage.verifyLanguageForNoVCDownloadedPageLoaded(), "Bring your digital identity");
    }

    @Test
    public void verifyWelcomePagesFromInjiTourGuideForFirstCard() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), Target.IOS);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), Target.IOS);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");

        AddNewCardPage addNewCardPage = homePage.downloadCard();
        EsignetLoginPage esignetLoginPage =  addNewCardPage.clickOnDownloadViaEsignet();


        addNewCardPage.clickOnContinueButtonInSigninPopupIos();
        esignetLoginPage.clickOnEsignetLoginWithOtpButton();

//        String uin=TestDataReader.readData("uin");
        OtpVerificationPage otpVerification= esignetLoginPage.setEnterIdTextBox(uin);

        esignetLoginPage.clickOnGetOtpButton();

        otpVerification.enterOtpForEsignet(BaseTestCase.getOtp(), Target.IOS);
        esignetLoginPage.clickOnVerifyButtonIos();

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");

        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnInjiTourGuide();

        assertTrue(homePage.verifyLanguageForHelpAndFrequentlyAskedQuationsHeaderDisplayed("English"), "Verify if help and frequently asked quations header displayed");
        assertTrue(homePage.verifyLanguageForHelpAndFrequentlyAskedQuationsDescriptionDisplayed("English"), "Verify if help and frequently asked quations description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyLanguageForDownloadCardHeaderDisplayed("English"), "Verify if download card header text displayed");
        assertTrue(homePage.verifyLanguageForDownloadCardDescriptionDisplayed("English"), "Verify if download card description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyLanguageForShareCardHeaderDisplayed("English"), "Verify if share card header text displayed");
        assertTrue(homePage.verifyLanguageForShareCardDescriptionDisplayed("English"), "Verify if share card description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyLanguageForAccesstoHistoryHeaderDisplayed("English"), "Verify if access to history header text displayed");
        assertTrue(homePage.verifyLanguageForaccesstoHistoryDescriptionDisplayed("English"), "Verify if access to history description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyLanguageForAppSettingsHeaderDisplayed("English"), "Verify if app settings header text displayed");
        assertTrue(homePage.verifyLanguageForAppSettingsDescriptionDisplayed("English"), "Verify if app settings description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyLanguageForCardViewTitleDisplayed("English"), "Verify if card header text displayed");
        assertTrue(homePage.verifyLanguageForCardViewDescriptionDisplayed("English"), "Verify if card description displayed");
        homePage.clickOnDoneButton();

        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");

        homePage.downloadCard();
        addNewCardPage.clickOnDownloadViaEsignet();

        addNewCardPage.clickOnContinueButtonInSigninPopupIos();
        esignetLoginPage.clickOnEsignetLoginWithOtpButton();

        esignetLoginPage.setEnterIdTextBox(uin);
        esignetLoginPage.clickOnGetOtpButton();

        otpVerification.enterOtpForEsignet(BaseTestCase.getOtp(), Target.IOS);
        esignetLoginPage.clickOnVerifyButtonIos();

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnInjiTourGuide();

        assertTrue(homePage.verifyLanguageForHelpAndFrequentlyAskedQuationsHeaderDisplayed("English"), "Verify if help and frequently asked quations header displayed");
        assertTrue(homePage.verifyLanguageForHelpAndFrequentlyAskedQuationsDescriptionDisplayed("English"), "Verify if help and frequently asked quations description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyLanguageForDownloadCardHeaderDisplayed("English"), "Verify if download card header text displayed");
        assertTrue(homePage.verifyLanguageForDownloadCardDescriptionDisplayed("English"), "Verify if download card description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyLanguageForShareCardHeaderDisplayed("English"), "Verify if share card header text displayed");
        assertTrue(homePage.verifyLanguageForShareCardDescriptionDisplayed("English"), "Verify if share card description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyLanguageForAccesstoHistoryHeaderDisplayed("English"), "Verify if access to history header text displayed");
        assertTrue(homePage.verifyLanguageForaccesstoHistoryDescriptionDisplayed("English"), "Verify if access to history description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyLanguageForAppSettingsHeaderDisplayed("English"), "Verify if app settings header text displayed");
        assertTrue(homePage.verifyLanguageForAppSettingsDescriptionDisplayed("English"), "Verify if app settings description displayed");
        homePage.clickOnDoneButton();

    }


    @Test
    public void verifyWelcomePagesFromInjiTourGuideAfterDeleteTheCard() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), Target.IOS);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), Target.IOS);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");

        AddNewCardPage addNewCardPage = homePage.downloadCard();

        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
        assertTrue(addNewCardPage.isIssuerDescriptionEsignetDisplayed(), "Verify if issuer description  esignet displayed");
        assertTrue(addNewCardPage.isIssuerSearchBarDisplayed(), "Verify if issuer search bar displayed");
        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
        assertTrue(addNewCardPage.isAddNewCardPageGuideMessageForEsignetDisplayed(), "Verify if add new card guide message displayed");
        assertTrue(addNewCardPage.isDownloadViaEsignetDisplayed(), "Verify if download via uin displayed");
        EsignetLoginPage esignetLoginPage =  addNewCardPage.clickOnDownloadViaEsignet();


        addNewCardPage.clickOnContinueButtonInSigninPopupIos();
        esignetLoginPage.clickOnEsignetLoginWithOtpButton();

//        String uin=TestDataReader.readData("uin");
        OtpVerificationPage otpVerification= esignetLoginPage.setEnterIdTextBox(uin);

        esignetLoginPage.clickOnGetOtpButton();

        otpVerification.enterOtpForEsignet(BaseTestCase.getOtp(), Target.IOS);
        esignetLoginPage.clickOnVerifyButtonIos();

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");

        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnInjiTourGuide();

        assertTrue(homePage.verifyLanguageForHelpAndFrequentlyAskedQuationsHeaderDisplayed("English"), "Verify if help and frequently asked quations header displayed");
        assertTrue(homePage.verifyLanguageForHelpAndFrequentlyAskedQuationsDescriptionDisplayed("English"), "Verify if help and frequently asked quations description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyLanguageForDownloadCardHeaderDisplayed("English"), "Verify if download card header text displayed");
        assertTrue(homePage.verifyLanguageForDownloadCardDescriptionDisplayed("English"), "Verify if download card description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyLanguageForShareCardHeaderDisplayed("English"), "Verify if share card header text displayed");
        assertTrue(homePage.verifyLanguageForShareCardDescriptionDisplayed("English"), "Verify if share card description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyLanguageForAccesstoHistoryHeaderDisplayed("English"), "Verify if access to history header text displayed");
        assertTrue(homePage.verifyLanguageForaccesstoHistoryDescriptionDisplayed("English"), "Verify if access to history description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyLanguageForAppSettingsHeaderDisplayed("English"), "Verify if app settings header text displayed");
        assertTrue(homePage.verifyLanguageForAppSettingsDescriptionDisplayed("English"), "Verify if app settings description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyLanguageForCardViewTitleDisplayed("English"), "Verify if card header text displayed");
        assertTrue(homePage.verifyLanguageForCardViewDescriptionDisplayed("English"), "Verify if card description displayed");
        homePage.clickOnDoneButton();

        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");

        MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();
        assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");

        PleaseConfirmPopupPage pleaseConfirmPopupPage = moreOptionsPage.clickOnRemoveFromWallet();
        assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if pop up page is displayed");

        pleaseConfirmPopupPage.clickOnConfirmButton();
        assertEquals(homePage.verifyLanguageForNoVCDownloadedPageLoaded(), "Bring your digital identity");

        HistoryPage historyPage = homePage.clickOnHistoryButton();
        assertTrue(historyPage.isHistoryPageLoaded(), "Verify if history page is displayed");
        historyPage.verifyHistory(uin + " Removed from wallet", Target.IOS);
        homePage.clickOnHomeButton();

        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnInjiTourGuide();

        assertTrue(homePage.verifyLanguageForHelpAndFrequentlyAskedQuationsHeaderDisplayed("English"), "Verify if help and frequently asked quations header displayed");
        assertTrue(homePage.verifyLanguageForHelpAndFrequentlyAskedQuationsDescriptionDisplayed("English"), "Verify if help and frequently asked quations description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyLanguageForDownloadCardHeaderDisplayed("English"), "Verify if download card header text displayed");
        assertTrue(homePage.verifyLanguageForDownloadCardDescriptionDisplayed("English"), "Verify if download card description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyLanguageForShareCardHeaderDisplayed("English"), "Verify if share card header text displayed");
        assertTrue(homePage.verifyLanguageForShareCardDescriptionDisplayed("English"), "Verify if share card description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyLanguageForAccesstoHistoryHeaderDisplayed("English"), "Verify if access to history header text displayed");
        assertTrue(homePage.verifyLanguageForaccesstoHistoryDescriptionDisplayed("English"), "Verify if access to history description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.verifyLanguageForAppSettingsHeaderDisplayed("English"), "Verify if app settings header text displayed");
        assertTrue(homePage.verifyLanguageForAppSettingsDescriptionDisplayed("English"), "Verify if app settings description displayed");
        homePage.clickOnNextButton();

        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
    }
}
