package inji.testcases.iosTestCases;

import inji.constants.InjiWalletConstants;
import inji.constants.PlatformType;
import inji.pages.*;
import inji.testcases.BaseTest.IosBaseTest;
import inji.utils.TestDataReader;
import org.testng.annotations.Test;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

public class UnlockWithPasscodeTest extends IosBaseTest {

    @Test
    public void logoutAndLoginWithPasscode() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        assertEquals(appUnlockMethodPage.getDescriptionText(), "To unlock the app securely, you can set up either biometric authentication, such as fingerprint or facial recognition or opt for a 6-digit Passcode for quick access.");
        assertEquals(appUnlockMethodPage.getPasswordTypeDescriptionText(), "Choose â€˜Use Biometricsâ€™ to enable biometric authentication or â€˜Iâ€™ll Do Laterâ€™ to set up a 6-digit passcode.");
        assertTrue(appUnlockMethodPage.isUseBiometricsButton(), "Verify if Usebiometrics button is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        assertTrue(settingsPage.isDataBackupAndRestoreDisplayed(), "Verify if backup & restore is displayed");
        UnlockApplicationPage unlockApplicationPage = settingsPage.clickOnLogoutButton();

        assertTrue(unlockApplicationPage.isUnlockApplicationPageLoaded(), "Verify if unlock application page is displayed");
        EnterYourPasscodePage enterYourPasscodePage = unlockApplicationPage.clickOnUnlockApplicationButton();

        assertTrue(enterYourPasscodePage.isEnterYourPasscodePageLoaded(), "Verify if enter your passcode page is displayed");
        enterYourPasscodePage.enterPasscodeOnPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);

        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");

    }

    @Test
    public void loginWithInvalidPasscode() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);

        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        UnlockApplicationPage unlockApplicationPage = settingsPage.clickOnLogoutButton();

        assertTrue(unlockApplicationPage.isUnlockApplicationPageLoaded(), "Verify if unlock application page is displayed");
        EnterYourPasscodePage enterYourPasscodePage = unlockApplicationPage.clickOnUnlockApplicationButton();

        assertTrue(enterYourPasscodePage.isEnterYourPasscodePageLoaded(), "Verify if enter your passcode page is displayed");
        enterYourPasscodePage.enterPasscodeOnPasscodePage(TestDataReader.readData("invalidpasscode"), PlatformType.IOS);

        assertTrue(confirmPasscode.isPasscodeInvalidMessageDisplayed(), "verify if invalid passcode is displayed");

    }
}
