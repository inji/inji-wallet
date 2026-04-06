package inji.testcases.iosTestCases;

import inji.constants.PlatformType;
import inji.pages.*;
import inji.testcases.BaseTest.IosBaseTest;
import inji.utils.TestDataReader;
import org.testng.annotations.Test;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

public class AboutInjiTest extends IosBaseTest {
    @Test
    public void copyAppId() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
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
    public void verifyAppId() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        AboutInjiPage aboutInjiPage = settingsPage.clickOnAbouInji();

        assertTrue(aboutInjiPage.isAboutInjiHeaderDisplayed(), "Verify id about inji page displayed");
        assertTrue(aboutInjiPage.isAppIdVisible(), "Verify appID is displayed");

    }

    @Test
    public void verifyTuvaliVersion() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();

        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        AboutInjiPage aboutInjiPage = settingsPage.clickOnAbouInji();

        assertTrue(aboutInjiPage.isAboutInjiHeaderDisplayed(), "Verify id about inji page displayed");
        assertTrue(aboutInjiPage.isTuvaliVesionVisible(), "Verify appID is displayed");

    }
}
