package inji.testcases.androidTestCases;

import inji.annotations.NeedsUIN;
import inji.constants.InjiWalletConstants;
import inji.constants.PlatformType;
import inji.pages.*;
import inji.testcases.BaseTest.AndroidBaseTest;
import inji.utils.InjiWalletUtil;
import inji.utils.TestDataReader;
import org.testng.annotations.Test;

import static org.testng.Assert.assertTrue;

public class ShareVcTest extends AndroidBaseTest {

	@Test
	public void noCardsAvailableToShare() {
		ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

		WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

		AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

		SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

		ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.ANDROID);

		HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.ANDROID);

		homePage.clickOnNextButtonForInjiTour();
		SharePage scanPage = homePage.clickOnShareButton();
		assertTrue(scanPage.isNoShareableCardsMessageDisplayed(),
				"Verify if no shareable cards are available message is displayed");
	}

	@Test
	public void verifyReceivedCardTabPresent() {
		ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

		WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

		AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

		SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

		ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.ANDROID);

		HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.ANDROID);

		homePage.clickOnNextButtonForInjiTour();
		SettingsPage settingsPage = homePage.clickOnSettingIcon();

		assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
		assertTrue(settingsPage.isReceivedCardsPresent(), "Verify if received cards tab is displayed");

	}

	@Test
	@NeedsUIN
	public void verifyPopupsForShareWithSelfie() throws InterruptedException {
		ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

		assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
		WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

		assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
		AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

		assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
		SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

		assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
		ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.ANDROID);

		assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
		HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.ANDROID);

		homePage.clickOnNextButtonForInjiTour();
		assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
		AddNewCardPage addNewCardPage = homePage.downloadCard();

		assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
		assertTrue(addNewCardPage.isIssuerDescriptionEsignetDisplayed(),
				"Verify if issuer description  esignet displayed");

		assertTrue(addNewCardPage.isAddNewCardPageGuideMessageForEsignetDisplayed(),
				"Verify if add new card guide message displayed");
		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();
		esignetLoginPage.clickOnEsignetLoginWithOtpButton();
		assertTrue(esignetLoginPage.isESignetLogoDisplayed(), "");
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getUIN());
		esignetLoginPage.clickOnGetOtpButton();

		otpVerification.enterOtpForeSignet(uinGetOtp(), PlatformType.ANDROID);
		esignetLoginPage.clickOnVerifyButton();

		addNewCardPage.clickOnDoneButton();

		assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
		MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();

		moreOptionsPage.clickOnShareVcWithSelfieFromKebabButton();

		SharePage sharePage = new SharePage(getDriver());

		sharePage.acceptPermissionPopupBluetooth();
		sharePage.acceptPermissionPopupCamera();
		assertTrue(sharePage.isCameraPageLoaded(), "Verify camera page is displayed");
		assertTrue(sharePage.isFlipCameraClickable(), "Verify if flip camera is enabled");
	}

	@Test
	@NeedsUIN
	public void rejectingCameraAccessesOnShareScreen() {
		ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

		assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
		WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

		assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
		AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

		assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
		SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

		assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
		ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.ANDROID);

		assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
		HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.ANDROID);

		homePage.clickOnNextButtonForInjiTour();
		assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
		AddNewCardPage addNewCardPage = homePage.downloadCard();

		assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");

		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();

		esignetLoginPage.clickOnEsignetLoginWithOtpButton();

		assertTrue(esignetLoginPage.isESignetLogoDisplayed(), "");
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getUIN());

		esignetLoginPage.clickOnGetOtpButton();
		assertTrue(esignetLoginPage.isOtpHasSendMessageDisplayed(), "verify if otp page is displayed");

		otpVerification.enterOtpForeSignet(uinGetOtp(), PlatformType.ANDROID);
		esignetLoginPage.clickOnVerifyButton();
		addNewCardPage.clickOnDoneButton();
		assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");

		SharePage sharePage = homePage.clickOnShareButton();

		sharePage.clickOnAllowLocationPopupButton();
		sharePage.acceptPermissionPopupBluetooth();

		sharePage.clickOnDontAllowCameraAccessButton();

		assertTrue(sharePage.isCameraDisabledToasterLoaded(), "Verify camera disabled toaster displayed");
		sharePage.clickOnCameraDisabledToasterClose();
		assertTrue(sharePage.isCameraAccessLostPageLoaded(), "Verify Proper error message is shown");
	}

}
