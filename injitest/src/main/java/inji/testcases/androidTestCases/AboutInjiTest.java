package inji.testcases.androidTestCases;

import inji.constants.PlatformType;
import inji.pages.*;
import inji.testcases.BaseTest.AndroidBaseTest;
import inji.utils.TestDataReader;
import org.testng.annotations.Test;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

public class AboutInjiTest extends AndroidBaseTest {
    @Test
    public void copyAppId() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

//        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

//        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

//        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

//        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

//        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);
        homePage.clickOnNextButtonForInjiTour();

//        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        AboutInjiPage aboutInjiPage = settingsPage.clickOnAbouInji();

        assertTrue(aboutInjiPage.isAboutInjiHeaderDisplayed(), "Verify id about inji page displayed");
        assertEquals(aboutInjiPage.getAboutInjiHeader(), "About Inji Wallet");
        aboutInjiPage.clickOnCopyText();
        assertTrue(aboutInjiPage.isAppIdCopiedTextDisplayed(), "verify if app id is copied");

        aboutInjiPage.clickOnBackButton();
        assertTrue(aboutInjiPage.isCopyTextDisplayed(), "verify if copy text displayed");

        aboutInjiPage.clickOnClickHereButton();
        assertTrue(aboutInjiPage.isMosipUrlDisplayedInChrome(), "verify if mosip url is displayed in chrome");
    }


    @Test
    public void verifyAppId() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

//        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

//        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

//        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

//        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

//        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);
        homePage.clickOnNextButtonForInjiTour();

//        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

//        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        AboutInjiPage aboutInjiPage = settingsPage.clickOnAbouInji();

        assertTrue(aboutInjiPage.isAboutInjiHeaderDisplayed(), "Verify id about inji page displayed");
        assertTrue(aboutInjiPage.isAppIdVisible(), "Verify appID is displayed");

    }

    @Test
    public void verifyTuvaliVersion() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

//        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

//        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

//        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

//        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

//        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);
        homePage.clickOnNextButtonForInjiTour();

//        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

//        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        AboutInjiPage aboutInjiPage = settingsPage.clickOnAbouInji();

        assertTrue(aboutInjiPage.isAboutInjiHeaderDisplayed(), "Verify id about inji page displayed");
        assertTrue(aboutInjiPage.isTuvaliVesionVisible(), "Verify appID is displayed");

    }
}