package inji.testcases.androidTestCases;

import inji.annotations.NeedsMockUIN;
import inji.annotations.NeedsUIN;
import inji.constants.InjiWalletConstants;
import inji.constants.PlatformType;
import inji.pages.*;
import inji.testcases.BaseTest.AndroidBaseTest;
import inji.utils.InjiWalletUtil;
import inji.utils.ResourceBundleLoader;
import inji.utils.TestDataReader;
import inji.utils.UpdateNetworkSettings;
import org.testng.Assert;
import org.testng.annotations.Test;

import static org.testng.Assert.assertTrue;
import static org.testng.AssertJUnit.assertEquals;

public class MosipOtpAlternativeFlow extends AndroidBaseTest {
	@Test
	@NeedsUIN
	public void verifyInvalidOtpMessage() {
		ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

		WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

		AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

		SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

		ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.ANDROID);

		HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.ANDROID);

		homePage.clickOnNextButtonForInjiTour();

		AddNewCardPage addNewCardPage = homePage.downloadCard();

		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();

		esignetLoginPage.clickOnEsignetLoginWithOtpButton();

		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getUIN());

		esignetLoginPage.clickOnGetOtpButton();

		otpVerification.enterOtpForeSignet(TestDataReader.readData("invalidOtp"), PlatformType.ANDROID);
		esignetLoginPage.clickOnVerifyButton();

		assertEquals(ResourceBundleLoader.get(InjiWalletConstants.invalidOtpErrorMessage),
				otpVerification.getInvalidOtpMessageForEsignet());
	}

	@Test
	@NeedsUIN
	public void activateVcFromDetailedViewPage() {
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

		assertTrue(esignetLoginPage.isESignetLogoDisplayed(), "Verify if Esignet Login page is landed");
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getUIN());

		esignetLoginPage.clickOnGetOtpButton();
		assertTrue(esignetLoginPage.isOtpHasSendMessageDisplayed(), "verify if otp page is displayed");

		otpVerification.enterOtpForeSignet(uinGetOtp(), PlatformType.ANDROID);
		esignetLoginPage.clickOnVerifyButton();

		addNewCardPage.clickOnDoneButton();
		assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");

		DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();
		assertTrue(detailedVcViewPage.isDetailedVcViewPageLoaded(), "Verify if detailed Vc view page is displayed");

		detailedVcViewPage.clickOnMoreOptionsInDetails();

		MoreOptionsPage moreOptionsPage = new MoreOptionsPage(getDriver());

		moreOptionsPage.clickOnDetailsViewActivationButton();
		PleaseConfirmPopupPage pleaseConfirmPopupPage = new PleaseConfirmPopupPage(getDriver());

		assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if pop up page is displayed");
		OtpVerificationPage otpVerificationPage = pleaseConfirmPopupPage.clickOnConfirmButton();

		assertTrue(otpVerificationPage.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
		otpVerificationPage.enterOtp(uinGetOtp(), PlatformType.ANDROID);

		assertTrue(detailedVcViewPage.isProfileAuthenticatedDisplayed(), "Verify if VC is activated");
	}

	@Test
	@NeedsUIN
	public void verifyActiveVcAndWaitForOtpTimeOut() throws InterruptedException {
		ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

		WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

		AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

		SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

		ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.ANDROID);

		HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.ANDROID);

		homePage.clickOnNextButtonForInjiTour();
		AddNewCardPage addNewCardPage = homePage.downloadCard();

		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();

		esignetLoginPage.clickOnEsignetLoginWithOtpButton();

		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getUIN());

		esignetLoginPage.clickOnGetOtpButton();

		otpVerification.enterOtpForeSignet(uinGetOtp(), PlatformType.ANDROID);
		esignetLoginPage.clickOnVerifyButton();

		addNewCardPage.clickOnDoneButton();
		MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();

		assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");
		PleaseConfirmPopupPage pleaseConfirmPopupPage = moreOptionsPage.clickOnActivationPending();

		assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if pop up page is displayed");
		pleaseConfirmPopupPage.clickOnConfirmButton();

		assertTrue(otpVerification.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
		assertTrue(otpVerification.verifyOtpVerificationDescriptionDisplayed(),
				"Verify if otp verification description displayed");

		otpVerification.WaitingTimeForVerificationTimerComplete();
		assertTrue(otpVerification.verifyResendCodeButtonDisplayedEnabled(), "Verify if resend code is enabled");
		otpVerification.clickOnResendButton();
		otpVerification.clickOnResendButton();
		assertTrue(otpVerification.verifyOtpVerificationTimerDisplayedAfterClickOnResend(),
				"verify is You can resend the code displayed again after click on resend button ");
	}

	@Test
	@NeedsUIN
	public void cancelDeleteVc() throws InterruptedException {
		ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

		WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

		AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

		SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

		ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.ANDROID);

		HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.ANDROID);

		homePage.clickOnNextButtonForInjiTour();
		AddNewCardPage addNewCardPage = homePage.downloadCard();

		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();

		esignetLoginPage.clickOnEsignetLoginWithOtpButton();

		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getUIN());

		esignetLoginPage.clickOnGetOtpButton();

		otpVerification.enterOtpForeSignet(uinGetOtp(), PlatformType.ANDROID);
		esignetLoginPage.clickOnVerifyButton();

		addNewCardPage.clickOnDoneButton();

		MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();

		PleaseConfirmPopupPage pleaseConfirmPopupPage = moreOptionsPage.clickOnRemoveFromWallet();
		assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if pop up page is displayed");

		pleaseConfirmPopupPage.clickOnNoButton();

		assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
	}

	@Test
	@NeedsUIN
	public void downloadingDeletedVc() throws InterruptedException {
		ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

		WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

		AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

		SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

		ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.ANDROID);

		HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.ANDROID);

		homePage.clickOnNextButtonForInjiTour();
		AddNewCardPage addNewCardPage = homePage.downloadCard();

		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();

		esignetLoginPage.clickOnEsignetLoginWithOtpButton();

		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getUIN());

		esignetLoginPage.clickOnGetOtpButton();

		otpVerification.enterOtpForeSignet(uinGetOtp(), PlatformType.ANDROID);
		esignetLoginPage.clickOnVerifyButton();

		addNewCardPage.clickOnDoneButton();

		MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();

		PleaseConfirmPopupPage pleaseConfirmPopupPage = moreOptionsPage.clickOnRemoveFromWallet();
		assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if pop up page is displayed");

		pleaseConfirmPopupPage.clickOnConfirmButton();

		Assert.assertEquals(homePage.verifyLanguageForNoVCDownloadedPageLoaded(), "Bring your digital identity");
		homePage.downloadCard();
		addNewCardPage.clickOnDownloadViaEsignet();

		esignetLoginPage.clickOnEsignetLoginWithOtpButton();

		esignetLoginPage.setEnterIdTextBox(getUIN());

		esignetLoginPage.clickOnGetOtpButton();

		otpVerification.enterOtpForeSignet(uinGetOtp(), PlatformType.ANDROID);
		esignetLoginPage.clickOnVerifyButton();

		HistoryPage historyPage = homePage.clickOnHistoryButton();
		assertTrue(historyPage.isHistoryPageLoaded(), "Verify if history page is displayed");

		assertTrue(historyPage.verifyHistory(getUIN(), PlatformType.ANDROID));

		assertEquals(2, (historyPage.getNumberOfRecordsInHistory(getUIN(), PlatformType.ANDROID)));
		assertTrue(historyPage.verifyDeleteHistory(getUIN(), PlatformType.ANDROID),
				"Verify if deleted history is displayed");
	}

	@Test
	@NeedsUIN
	public void deleteDownloadedVcInOfflineMode() throws InterruptedException {
		ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

		WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

		AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

		SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

		ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.ANDROID);

		HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.ANDROID);

		homePage.clickOnNextButtonForInjiTour();
		AddNewCardPage addNewCardPage = homePage.downloadCard();

		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();

		esignetLoginPage.clickOnEsignetLoginWithOtpButton();

		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getUIN());

		esignetLoginPage.clickOnGetOtpButton();

		otpVerification.enterOtpForeSignet(uinGetOtp(), PlatformType.ANDROID);
		esignetLoginPage.clickOnVerifyButton();

		addNewCardPage.clickOnDoneButton();
		String sessionId = getDriver().getSessionId().toString();
		UpdateNetworkSettings.setNoNetworkProfile(sessionId);

		MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();

		PleaseConfirmPopupPage pleaseConfirmPopupPage = moreOptionsPage.clickOnRemoveFromWallet();

		pleaseConfirmPopupPage.clickOnConfirmButton();

		UpdateNetworkSettings.resetNetworkProfile(sessionId);
		assertEquals("Bring your digital identity", homePage.verifyLanguageForNoVCDownloadedPageLoaded());
	}

	@Test
	@NeedsMockUIN
	public void openQrOffline() {
		ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

		WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

		AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

		SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

		ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.ANDROID);

		HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.ANDROID);

		homePage.clickOnNextButtonForInjiTour();

		AddNewCardPage addNewCardPage = homePage.downloadCard();

		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();

		esignetLoginPage.clickOnEsignetLoginWithOtpButton();

		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getMockUIN());

		esignetLoginPage.clickOnGetOtpButton();

		otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtpForMock(), PlatformType.ANDROID);
		esignetLoginPage.clickOnVerifyButton();

		addNewCardPage.clickOnDoneButton();
		String sessionId = getDriver().getSessionId().toString();
		UpdateNetworkSettings.setNoNetworkProfile(sessionId);

		DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();
		detailedVcViewPage.clickOnQrCodeButton();
		assertTrue(detailedVcViewPage.isQrCodeDisplayed(), "Verify if QR Code header is displayed");

		detailedVcViewPage.clickOnQrCrossIcon();
	}

	@Test
	public void verifyVcIssuerListWithoutNetwork() {
		ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

		WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

		AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

		SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

		ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.ANDROID);

		HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.ANDROID);

		homePage.clickOnNextButtonForInjiTour();

		AddNewCardPage addNewCardPage = homePage.downloadCard();

		String sessionId = getDriver().getSessionId().toString();
		UpdateNetworkSettings.setNoNetworkProfile(sessionId);

		addNewCardPage.clickOnBack();

		homePage.downloadCard();
		assertTrue(addNewCardPage.isDownloadViaSunbirdDisplayed(), "Verify if issuer sunbird displayed");
		assertTrue(addNewCardPage.isIssuerDescriptionEsignetDisplayed(),
				"Verify if issuer description  esignet displayed");
	}

	@Test
	@NeedsUIN
	public void verifyCameraOpenAfterPinVc() throws InterruptedException {
		ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

		WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

		AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

		SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

		ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.ANDROID);

		HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.ANDROID);

		homePage.clickOnNextButtonForInjiTour();
		AddNewCardPage addNewCardPage = homePage.downloadCard();

		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();

		esignetLoginPage.clickOnEsignetLoginWithOtpButton();

		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getUIN());

		esignetLoginPage.clickOnGetOtpButton();

		otpVerification.enterOtpForeSignet(uinGetOtp(), PlatformType.ANDROID);
		esignetLoginPage.clickOnVerifyButton();

		addNewCardPage.clickOnDoneButton();
		MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();

		moreOptionsPage.clickOnPinOrUnPinCard();

		assertTrue(homePage.isPinIconDisplayed(), "Verify if pin icon on vc is displayed");
		SharePage scanPage = homePage.clickOnShareButton();

		scanPage.acceptPermissionPopupBluetooth();
		scanPage.acceptPermissionPopupCamera();
		scanPage.clickOnAllowLocationPopupButton();
		scanPage.clickOnAllowGallaryAccessButton();

		assertTrue(scanPage.isCameraPageLoaded(), "Verify camera page is displayed");
		assertTrue(scanPage.isFlipCameraClickable(), "Verify if flip camera is enabled");
	}

	@Test
	@NeedsUIN
	public void verifyMessageAfterDenyBluetoothPopup() throws InterruptedException {
		ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

		WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

		AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

		SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

		ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.ANDROID);

		HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.ANDROID);

		homePage.clickOnNextButtonForInjiTour();
		AddNewCardPage addNewCardPage = homePage.downloadCard();

		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();

		esignetLoginPage.clickOnEsignetLoginWithOtpButton();

		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getUIN());

		esignetLoginPage.clickOnGetOtpButton();

		otpVerification.enterOtpForeSignet(uinGetOtp(), PlatformType.ANDROID);
		esignetLoginPage.clickOnVerifyButton();

		addNewCardPage.clickOnDoneButton();
		MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();

		moreOptionsPage.clickOnPinOrUnPinCard();

		assertTrue(homePage.isPinIconDisplayed(), "Verify if pin icon on vc is displayed");
		SharePage scanPage = homePage.clickOnShareButton();

		scanPage.denyPermissionPopupBluetooth();
		assertTrue(scanPage.isAllowNearbyDevicesButtonDisplayed(), "Verify if allow nearby devices displayed");

	}
}
