package inji.testcases.androidTestCases;

import inji.constants.InjiWalletConstants;
import inji.constants.PlatformType;
import inji.pages.*;
import inji.testcases.BaseTest.AndroidBaseTest;
import inji.utils.IosUtil;
import inji.utils.TestDataReader;
import org.testng.annotations.Test;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

public class VerifyWelcomePagesTest extends AndroidBaseTest {

    @Test
    public void verifyWelcomePagesContent() {

        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        assertTrue(welcomePage.getWelcomeDescription("English"), "Keep your digital credential with you at all times. Inji helps you manage and use them effectively. To get started, add cards to your profile.");
        welcomePage.clickOnNextButton();

        SecureSharingPage secureSharingPage = new SecureSharingPage(getDriver());
        assertTrue(secureSharingPage.verifyLanguageForSecureSharingPageLoaded("English"), "Secure Sharing");
        assertTrue(secureSharingPage.getSecureSharingDescription("English"), "Share your cards securely in a hassle free way and avail various services.");
        secureSharingPage.clickOnNextButton();

        TrustedDigitalWalletPage trustedDigitalWalletPage = new TrustedDigitalWalletPage(getDriver());
        assertTrue(trustedDigitalWalletPage.verifyLanguageforTrustedDigitalWalletPageLoaded("English"), "Trusted Digital Wallet");
        assertTrue(trustedDigitalWalletPage.getTrustedDigitalWalletDescription("English"), "Store and carry all your important cards in a single trusted wallet.");
        trustedDigitalWalletPage.clickOnNextButton();

        QuickAccessPage quickAccessPage = new QuickAccessPage(getDriver());
        assertTrue(quickAccessPage.verifyQuickAccessTitle("English"), "Quick Access");
        assertTrue(quickAccessPage.VerifyQuickAccessDescription("English"), "Authenticate yourself with ease using the stored digital credential.");
        quickAccessPage.clickOnNextButton();

        BackupDataTourPage backupDataPage = new BackupDataTourPage(getDriver());
        assertTrue(backupDataPage.verifyBackupDataAndRestoreTitle("English"), "Backup & Restore");
        assertTrue(backupDataPage.verifyBackupDataDescription("English"), "Protect your data with ease using our Backup & Restore feature. Safely store your VCs against loss or accidents by creating regular backups and recover it effortlessly whenever needed for seamless continuity.");
    }

    @Test
    public void verifyWelcomePagesFromInjiTourGuide() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.ANDROID);

        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

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

        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
    }

    @Test
    public void verifyGoBackFromInjiTourGuide() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.ANDROID);

        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
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
        homePage.clickOnPreviousButton();

        assertTrue(homePage.verifyAccessToHistoryHeader("English"), "Verify if access to history header text displayed");
        assertTrue(homePage.verifyAccessToHistoryDescription("English"), "Verify if access to history description displayed");
        homePage.clickOnPreviousButton();

        assertTrue(homePage.verifyShareCardHeader("English"), "Verify if share card header text displayed");
        assertTrue(homePage.verifyShareCardDescription("English"), "Verify if share card description displayed");
        homePage.clickOnPreviousButton();

        assertTrue(homePage.verifyDownloadCardHeader("English"), "Verify if download card header text displayed");
        assertTrue(homePage.verifyDownloadCardDescription("English"), "Verify if download card description displayed");
        homePage.clickOnPreviousButton();

        assertTrue(homePage.verifyHelpFAQsHeader("English"), "Verify if help and frequently asked quations header displayed");
        assertTrue(homePage.verifyHelpFAQsDescription("English"), "Verify if help and frequently asked quations description displayed");
    }

    @Test
    public void verifyClickOnBackFromInjiTourGuide() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.ANDROID);

        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        settingsPage.clickOnInjiTourGuide();

        assertTrue(homePage.verifyHelpFAQsHeader("English"), "Verify if help and frequently asked quations header displayed");
        assertTrue(homePage.verifyHelpFAQsDescription("English"), "Verify if help and frequently asked quations description displayed");

        IosUtil.scrollToElement(getDriver(), 100, 800, 100, 200);
        assertEquals(homePage.verifyLanguageForNoVCDownloadedPageLoaded(), "Bring your digital identity");
    }
}
