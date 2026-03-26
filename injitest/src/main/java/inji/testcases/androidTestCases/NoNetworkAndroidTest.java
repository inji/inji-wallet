package inji.testcases.androidTestCases;

import inji.annotations.NeedsMockUIN;
import inji.annotations.NeedsUIN;
import inji.constants.InjiWalletConstants;
import inji.constants.PlatformType;
import inji.pages.*;
import inji.testcases.BaseTest.AndroidBaseTest;
import inji.utils.InjiWalletUtil;
import inji.utils.IosUtil;
import inji.utils.TestDataReader;
import inji.utils.UpdateNetworkSettings;
import org.testng.Assert;
import org.testng.annotations.Test;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

public class NoNetworkAndroidTest extends AndroidBaseTest {

	@Test
	public void setupPasscodeAndDownloadCardWithoutInternet() {
		String sessionId = getDriver().getSessionId().toString();
		UpdateNetworkSettings.setNoNetworkProfile(sessionId);

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
    Assert.assertFalse(addNewCardPage.isIssuerDescriptionEsignetDisplayed());

    //Below lines are commented as scan feature is required
//    addNewCardPage.clickOnScanAndDownloadCardButton();
//    SharePage scanPage = new SharePage(getDriver());
//    scanPage.acceptPermissionPopupCamera();
//
//		assertTrue(homePage.verifyLanguageForNoInternetConnectionDisplayed("English"),
//				"Verify if no internet connection is displayed");
//		assertTrue(homePage.verifyLanguageForTryAgainButtonDisplayed("English"),
//				"Verify if Try again button displayed");
//
//		assertTrue(homePage.verifyLanguageForNoInternetConnectionDisplayed("English"),
//				"Verify if no internet connection is displayed");
//
//		homePage.clickOnTryAgainButton();
//		assertTrue(homePage.verifyLanguageForNoInternetConnectionDisplayed("English"),
//				"Verify if no internet connection is displayed");

	}

	@Test
	@NeedsUIN
	public void openCameraOnFlightMode() {
		ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

		assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
		WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

		assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
		AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

		assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
		SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

		assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
		ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"),
				PlatformType.ANDROID);

		assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
		HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"),
				PlatformType.ANDROID);

		homePage.clickOnNextButtonForInjiTour();
		assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
		AddNewCardPage addNewCardPage = homePage.downloadCard();

		assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
		RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();

		assertTrue(retrieveIdPage.isRetrieveIdPageLoaded(), "Verify if retrieve id page is displayed");
		OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(getUIN()).clickOnGenerateCardButton();

		assertTrue(otpVerification.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
		otpVerification.enterOtp(uinGetOtp(), PlatformType.ANDROID);

		addNewCardPage.clickOnDoneButton();
		assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");

		String sessionId = getDriver().getSessionId().toString();
		UpdateNetworkSettings.setNoNetworkProfile(sessionId);
		homePage.clickOnShareButton().acceptPermissionPopupBluetooth().clickOnAllowLocationPopupButton();
		SharePage SharePage = new SharePage(getDriver());
		SharePage.clickOnAllowGallaryAccessButton();

		assertTrue(SharePage.isCameraPageLoaded(), "Verify camera page is displayed");
	}

	@Test
	@NeedsUIN
	public void activateVcWithoutInternet() throws InterruptedException {
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
		RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();

		assertTrue(retrieveIdPage.isRetrieveIdPageLoaded(), "Verify if retrieve id page is displayed");
		OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(getUIN()).clickOnGenerateCardButton();

		assertTrue(otpVerification.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
		otpVerification.enterOtp(uinGetOtp(), PlatformType.ANDROID);

		addNewCardPage.clickOnDoneButton();
		assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
		String sessionId = getDriver().getSessionId().toString();
		UpdateNetworkSettings.setNoNetworkProfile(sessionId);
		MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();

		assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");
		PleaseConfirmPopupPage pleaseConfirmPopupPage = moreOptionsPage.clickOnActivationPending();

		assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if pop up page is displayed");
		OtpVerificationPage otpVerificationPage = pleaseConfirmPopupPage.clickOnConfirmButton();

		assertTrue(otpVerificationPage.somethingWetWrongInVcActivationDisplayed(),
				"Verify if Something is wrong. Please try again later! is displayed");

	}

	@Test
	public void verifyListOfLanguagesInOfflineMode() {
		String sessionId = getDriver().getSessionId().toString();
		UpdateNetworkSettings.setNoNetworkProfile(sessionId);
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

		settingsPage.clickOnLanguage();

		assertTrue(settingsPage.verifyLanguagesInLanguageFilter("ANDROID"),
				"Verify if all languages are shown in language filter");
	}

	@Test
	public void verifyHelpPageOfflineMode() {
		String sessionId = getDriver().getSessionId().toString();
		UpdateNetworkSettings.setNoNetworkProfile(sessionId);

		ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

		WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

		AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

		SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

		ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.ANDROID);

		HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.ANDROID);

		homePage.clickOnNextButtonForInjiTour();
		HelpPage helpPage = homePage.clickOnHelpIcon();

		assertTrue(helpPage.isHelpPageLoaded(), "Verify if help page is displayed");
		helpPage.exitHelpPage();

		assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
	}

	@Test
	@NeedsUIN
	public void deleteDownloadedVcInOfflineMode() throws InterruptedException {
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
		RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();

		assertTrue(retrieveIdPage.isRetrieveIdPageLoaded(), "Verify if retrieve id page is displayed");
		OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(getUIN()).clickOnGenerateCardButton();

		assertTrue(otpVerification.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
		otpVerification.enterOtp(uinGetOtp(), PlatformType.ANDROID);

		addNewCardPage.clickOnDoneButton();
		assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
		String sessionId = getDriver().getSessionId().toString();
		UpdateNetworkSettings.setNoNetworkProfile(sessionId);

		MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();
		assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");

		PleaseConfirmPopupPage pleaseConfirmPopupPage = moreOptionsPage.clickOnRemoveFromWallet();
		assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if pop up page is displayed");

		pleaseConfirmPopupPage.clickOnConfirmButton();

		UpdateNetworkSettings.resetNetworkProfile(sessionId);
		assertEquals(homePage.verifyLanguageForNoVCDownloadedPageLoaded(), "Bring your digital identity");
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

		SettingsPage settingsPage = homePage.clickOnSettingIcon();
		settingsPage.clickOnKeyManagement();
		KeyManagementPage keyManagementPage = new KeyManagementPage(getDriver());
		keyManagementPage.clickOnDoneButton();

		IosUtil.dragAndDrop(getDriver(), keyManagementPage.getTheCoordinatesECCR1TextText(),
				keyManagementPage.getTheCoordinatesED25519Text());
		keyManagementPage.clickOnSaveKeyOrderingPreferenceButton();
		assertTrue(keyManagementPage.iskeyOrderingSuccessTextMessageDisplayed(),
				"Verify if confirm passcode page is displayed");
		homePage.clickPopupCloseButtonButton();
		keyManagementPage.clickOnArrowleftButton();
		homePage.clickOnHomeButton();
		AddNewCardPage addNewCardPage = homePage.downloadCard();
		MockCertifyLoginPage mockCertifyLoginPage = addNewCardPage.clickOnDownloadViaMockCertify();
		addNewCardPage.clickOnContinueButton();

		OtpVerificationPage otpVerification = mockCertifyLoginPage.setEnterIdTextBox(getMockUIN());
		mockCertifyLoginPage.clickOnGetOtpButton();

		otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtpForMock(), PlatformType.ANDROID);
		mockCertifyLoginPage.clickOnVerifyButton();

		addNewCardPage.clickOnDoneButton();
		homePage.clickOnCrossIconButton();
		assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");

		String sessionId = getDriver().getSessionId().toString();
		UpdateNetworkSettings.setNoNetworkProfile(sessionId);

		DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();
		detailedVcViewPage.clickOnQrCodeButton();
		assertTrue(detailedVcViewPage.isQrCodeDisplayed(), "Verify if QR Code header is displayed");

		detailedVcViewPage.clickOnQrCrossIcon();
		assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
	}

	@Test
	public void verifyReceivedCardOffline() {
		String sessionId = getDriver().getSessionId().toString();
		UpdateNetworkSettings.setNoNetworkProfile(sessionId);
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

		ReceiveCardPage receiveCardPage = settingsPage.clickOnReceiveCard();
		receiveCardPage.clickOnAllowButton();

		assertTrue(receiveCardPage.isReceiveCardHeaderDisplayed(), "Verify if QR code  header is displayed");

		assertTrue(receiveCardPage.isWaitingForConnectionDisplayed(), "Verify if waiting for connection displayed");

	}

	@Test
	public void downloadCardWithoutInternetRetryWithInternet() {
		String sessionId = getDriver().getSessionId().toString();
		UpdateNetworkSettings.setNoNetworkProfile(sessionId);
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

    Assert.assertFalse(addNewCardPage.isIssuerDescriptionEsignetDisplayed());

		UpdateNetworkSettings.resetNetworkProfile(sessionId);
    addNewCardPage.clickOnBack();
		homePage.downloadCard();
		assertTrue(homePage.isTryAgainButtonNotDisplayed(), "Wating for network come online");

		assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
	}

	@Test
	public void downloadVcUsingUinViaEsignetWithoutInternet() {
		String sessionId = getDriver().getSessionId().toString();
		UpdateNetworkSettings.setNoNetworkProfile(sessionId);
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

    Assert.assertFalse(addNewCardPage.isIssuerDescriptionEsignetDisplayed());

    //Below lines are commented as scan feature is required
//		assertTrue(homePage.verifyLanguageForNoInternetConnectionDisplayed("English"),
//				"Verify if no internet connection is displayed");
//		assertTrue(homePage.verifyLanguageForTryAgainButtonDisplayed("English"),
//				"Verify if Try again button displayed");
//
//		homePage.clickOnTryAgainButton();
//		assertTrue(homePage.verifyLanguageForNoInternetConnectionDisplayed("English"),
//				"Verify if no internet connection is displayed");
//		assertTrue(homePage.verifyLanguageForTryAgainButtonDisplayed("English"),
//				"Verify if Try again button displayed");

	}

	@Test
	@NeedsUIN
	public void downloadVcUsingUinViaEsignetNoInternateWhileDownloading() {
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

		String sessionId = getDriver().getSessionId().toString();

		assertTrue(homePage.verifyLanguageForNoInternetConnectionDisplayed("English"),
				"Verify if no internet connection is displayed");
		addNewCardPage.clickOnBack();

		UpdateNetworkSettings.resetNetworkProfile(sessionId);
		assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
	}

	@Test
	@NeedsUIN
	public void downloadVcViaEsignetAndPinUnpinWithNoNetwork() throws InterruptedException {
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
		assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
		String sessionId = getDriver().getSessionId().toString();
		UpdateNetworkSettings.setNoNetworkProfile(sessionId);

		MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();

		moreOptionsPage.clickOnPinOrUnPinCard();

		assertTrue(homePage.isPinIconDisplayed(), "Verify if pin icon on vc is displayed");
		homePage.clickOnMoreOptionsButton();

		assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");
		moreOptionsPage.clickOnPinOrUnPinCard();

	}

	@Test
	@NeedsUIN
	public void downloadVcUsingUinViaEsignetNoInternateOpenScan() {
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
		assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
		String sessionId = getDriver().getSessionId().toString();
		UpdateNetworkSettings.setNoNetworkProfile(sessionId);

		homePage.clickOnShareButton().acceptPermissionPopupBluetooth();
		SharePage sharePage = new SharePage(getDriver());
		sharePage.clickOnAllowGallaryAccessButton();

		assertTrue(sharePage.isCameraPageLoaded(), "Verify camera page is displayed");

	}

	@Test
	@NeedsUIN
	public void downloadVcInOtherLanguageViaEsignetWithoutInternet() {
		String sessionId = getDriver().getSessionId().toString();
		UpdateNetworkSettings.setNoNetworkProfile(sessionId);
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

		settingsPage.clickOnLanguage().clickOnFilipinoLanguage();

		assertTrue(settingsPage.verifyFilipinoLanguage(), "Verify if language is changed to filipino");
		homePage.clickOnHomeButton();

		AddNewCardPage addNewCardPage = homePage.downloadCard();
    Assert.assertFalse(addNewCardPage.isIssuerDescriptionEsignetDisplayed());

		UpdateNetworkSettings.resetNetworkProfile(sessionId);

    addNewCardPage.clickOnBack();
    homePage.downloadCard();
		assertEquals(addNewCardPage.verifyLanguageForAddNewCardGuideMessage(),
				"Mangyaring piliin ang iyong gustong tagabigay mula sa mga opsyon sa ibaba upang magdagdag ng bagong card.");
		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();
		esignetLoginPage.clickOnEsignetLoginWithOtpButton();

		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getUIN());

		esignetLoginPage.clickOnGetOtpButton();

		otpVerification.enterOtpForeSignet(uinGetOtp(), PlatformType.ANDROID);
		esignetLoginPage.clickOnVerifyButton();

		addNewCardPage.clickOnDoneButton();
		assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
	}

	@Test
	public void changeLanguageToTamilWithoutNetwork() {
		String sessionId = getDriver().getSessionId().toString();
		UpdateNetworkSettings.setNoNetworkProfile(sessionId);
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

		settingsPage.clickOnLanguage().clickOnTamilLanguage();

		assertTrue(settingsPage.verifyTamilLanguage(), "Verify if language is changed to tamil");
		homePage.clickOnHomeButton();

		AddNewCardPage addNewCardPage = homePage.downloadCard();
    Assert.assertFalse(addNewCardPage.isIssuerDescriptionEsignetDisplayed());

    //Below lines are commented as scan feature is required
//		assertTrue(homePage.verifyLanguageForNoInternetConnectionDisplayed("Tamil"),
//				"Verify if try again in tamil is displayed");
	}

	@Test
	public void verifyVcIssuerListWithoutNetwork() {
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
		String sessionId = getDriver().getSessionId().toString();
		UpdateNetworkSettings.setNoNetworkProfile(sessionId);

		addNewCardPage.clickOnBack();

		homePage.downloadCard();
		assertTrue(addNewCardPage.isIssuerDescriptionMosipDisplayed(), "Verify if issuer description  mosip displayed");
		assertTrue(addNewCardPage.isIssuerDescriptionEsignetDisplayed(),
				"Verify if issuer description  esignet displayed");

	}

	@Test
	public void VerifyGenerateUinOrVidUsingAidHeader() {
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
		RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();

		assertTrue(retrieveIdPage.isRetrieveIdPageLoaded(), "Verify if retrieve id page is displayed");
		assertEquals(retrieveIdPage.verifyGetItTextDisplayed(), "Get it now using your AID.");
		GenerateUinOrVidPage generateUinOrVidPage = retrieveIdPage.clickOnGetItNowText();

		String sessionId = getDriver().getSessionId().toString();
		UpdateNetworkSettings.setNoNetworkProfile(sessionId);

		assertTrue(generateUinOrVidPage.isGenerateUinOrVidPageLoaded(),
				"Verify if generate uin or vid page page is displayed");
		assertEquals(generateUinOrVidPage.getGenerateUinOrVidPageTextloaded(), "Get your UIN/VID");

		String aid = TestDataReader.readData("aid");
		generateUinOrVidPage.enterApplicationID(aid).clickOnGetUinOrVidButton();

		assertTrue(generateUinOrVidPage.isNetworkRequesFailedDisplayed(),
				"Verify if no internet connection is displayed");
	}

}
