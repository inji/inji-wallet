package inji.testcases.iosTestCases;

import inji.annotations.NeedsUIN;
import inji.constants.InjiWalletConstants;
import inji.constants.PlatformType;
import inji.pages.*;
import inji.testcases.BaseTest.IosBaseTest;
import inji.utils.InjiWalletUtil;
import inji.utils.TestDataReader;
import org.testng.annotations.Test;

import static org.testng.Assert.assertTrue;

public class ShareVcTest extends IosBaseTest {

    @Test
    public void noCardsAvailableToShare() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SharePage scanPage = homePage.clickOnShareButton();
        scanPage.acceptPermissionPopupBluetoothIos();
        assertTrue(scanPage.isNoShareableCardsMessageDisplayed(), "Verify if no shareable cards are available message is displayed");
    }

    @Test
    public void verifyReceivedCardTabPresent() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
        SettingsPage settingsPage = homePage.clickOnSettingIcon();
        assertTrue(settingsPage.isReceivedCardsPresent(), "Verify if received cards tab is displayed");

    }

    @Test
    @NeedsUIN
    public void rejectingCameraAccessesOnShareScreen() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
        AddNewCardPage addNewCardPage = homePage.downloadCard();

        ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();
        addNewCardPage.clickOnContinueButtonInSigninPopupIos();

        esignetLoginPage.clickOnEsignetLoginWithOtpButton();
        OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getUIN());

        esignetLoginPage.clickOnGetOtpButton();

        otpVerification.enterOtpForeSignet(uinGetOtp(), PlatformType.IOS);
        esignetLoginPage.clickOnVerifyButtonIos();

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");

        SharePage SharePage = homePage.clickOnShareButton();

        SharePage.acceptPermissionPopupBluetooth();
        SharePage.clickOnDontAllowCameraAccessButton();

        assertTrue(SharePage.isCameraDisabledToasterLoaded(), "Verify camera disabled toaster displayed");
        SharePage.clickOnCameraDisabledToasterClose();
        assertTrue(SharePage.isCameraAccessLostPageLoaded(), "Verify Proper error message is shown");
    }
}
