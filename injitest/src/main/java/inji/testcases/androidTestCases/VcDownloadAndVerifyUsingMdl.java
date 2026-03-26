package inji.testcases.androidTestCases;

import inji.annotations.NeedsMockUIN;
import inji.annotations.NeedsUIN;
import inji.constants.InjiWalletConstants;
import inji.constants.PlatformType;
import inji.pages.*;
import inji.testcases.BaseTest.AndroidBaseTest;
import inji.utils.InjiWalletUtil;
import inji.utils.IosUtil;
import inji.utils.ResourceBundleLoader;
import inji.utils.TestDataReader;
import org.testng.annotations.Test;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

public class VcDownloadAndVerifyUsingMdl extends AndroidBaseTest {
	@Test
	@NeedsMockUIN
	public void downloadAndVerifyVcUsingUinViaMockIdentity() {
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
		keyManagementPage.clickOnArrowleftButton();
		homePage.clickOnHomeButton();

		AddNewCardPage addNewCardPage = homePage.downloadCard();

		assertTrue(addNewCardPage.isDownloadViaEsignetDisplayed(), "Verify if download via uin displayed");
		MockCertifyLoginPage mockCertifyLoginPage = addNewCardPage.clickOnDownloadViaMockCertify();

		mockCertifyLoginPage.clickOnEsignetLoginWithOtpButton();

		assertTrue(mockCertifyLoginPage.isEnterYourVidTextDisplayed(), "");

		OtpVerificationPage otpVerification = mockCertifyLoginPage.setEnterIdTextBox(getMockUIN());

		mockCertifyLoginPage.clickOnGetOtpButton();
		assertTrue(mockCertifyLoginPage.isOtpHasSendMessageDisplayed(), "verify if otp page is displayed");

		otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtpForMock(), PlatformType.ANDROID);
		mockCertifyLoginPage.clickOnVerifyButton();

		addNewCardPage.clickOnDoneButton();
		assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
		DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();

		detailedVcViewPage.clickOnQrCodeButton();
		assertTrue(detailedVcViewPage.isQrCodeDisplayed(), "Verify if QR Code header is displayed");

		detailedVcViewPage.clickOnQrCrossIcon();
		assertTrue(detailedVcViewPage.isEsignetLogoDisplayed(), "Verify if detailed Vc esignet logo is displayed");
		assertTrue(detailedVcViewPage.isDetailedVcViewPageLoaded(), "Verify if detailed Vc view page is displayed");
		assertEquals(detailedVcViewPage.getIdTypeValueInDetailedVcView(),
				TestDataReader.readData("idTypeForMobileDrivingLicense"), "Verify if id type is displayed");
		assertEquals(detailedVcViewPage.getStatusInDetailedVcView(), TestDataReader.readData("status"),
				"Verify if status is displayed");
		detailedVcViewPage.clickOnBackArrow();
		assertTrue(detailedVcViewPage.isEsignetLogoDisplayed(), "Verify if detailed Vc esignet logo is displayed");
	}

	@Test
	@NeedsUIN
	public void downloadAndVerifyVcUsingInvalidCredentials() {
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

		assertTrue(addNewCardPage.isDownloadViaEsignetDisplayed(), "Verify if download via uin displayed");
		MockCertifyLoginPage mockCertifyLoginPage = addNewCardPage.clickOnDownloadViaMockCertify();

		addNewCardPage.clickOnContinueButton();

		assertTrue(mockCertifyLoginPage.isEnterYourVidTextDisplayed(), "");

		mockCertifyLoginPage.setEnterIdTextBox(getUIN());

		mockCertifyLoginPage.clickOnGetOtpButton();
		assertEquals(ResourceBundleLoader.get(InjiWalletConstants.invalid_individual_id),
				mockCertifyLoginPage.getInvalidIndividualIdMessage());
	}

	@Test
	@NeedsMockUIN
	public void downloadAndVerifyVcUsingInvalidOtp() {
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

		assertTrue(addNewCardPage.isDownloadViaEsignetDisplayed(), "Verify if download via uin displayed");
		MockCertifyLoginPage mockCertifyLoginPage = addNewCardPage.clickOnDownloadViaMockCertify();

		addNewCardPage.clickOnContinueButton();

		assertTrue(mockCertifyLoginPage.isEnterYourVidTextDisplayed(), "");

		OtpVerificationPage otpVerification = mockCertifyLoginPage.setEnterIdTextBox(getMockUIN());

		mockCertifyLoginPage.clickOnGetOtpButton();

		otpVerification.enterOtpForeSignet(TestDataReader.readData("invalidOtp"), PlatformType.ANDROID);
		mockCertifyLoginPage.clickOnVerifyButton();
		assertEquals(ResourceBundleLoader.get(InjiWalletConstants.auth_failed),
				mockCertifyLoginPage.getInvalidOtpMessage());
	}

	@Test
	@NeedsMockUIN
	public void downloadAndVerifyVcUsingViaMdlAndPinAndUnpin() throws InterruptedException {
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
		keyManagementPage.clickOnArrowleftButton();
		homePage.clickOnHomeButton();

		AddNewCardPage addNewCardPage = homePage.downloadCard();

		assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
		assertTrue(addNewCardPage.isAddNewCardPageGuideMessageForEsignetDisplayed(),
				"Verify if add new card guide message displayed");
		assertTrue(addNewCardPage.isDownloadViaEsignetDisplayed(), "Verify if download via uin displayed");
		MockCertifyLoginPage mockCertifyLoginPage = addNewCardPage.clickOnDownloadViaMockCertify();

		addNewCardPage.clickOnContinueButton();

		assertTrue(mockCertifyLoginPage.isEnterYourVidTextDisplayed(), "");

		OtpVerificationPage otpVerification = mockCertifyLoginPage.setEnterIdTextBox(getMockUIN());

		mockCertifyLoginPage.clickOnGetOtpButton();

		otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtpForMock(), PlatformType.ANDROID);
		mockCertifyLoginPage.clickOnVerifyButton();

		addNewCardPage.clickOnDoneButton();
		assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
		MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();

		moreOptionsPage.clickOnPinOrUnPinCard();

		assertTrue(homePage.isPinIconDisplayed(), "Verify if pin icon on vc is displayed");
		homePage.clickOnMoreOptionsButton();
		assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");
		moreOptionsPage.clickOnPinOrUnPinCard();
	}

	@Test
	@NeedsMockUIN
	public void downloadAndVerifyVcUsingUinViaMdlMultipleTime() {
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
		keyManagementPage.clickOnArrowleftButton();
		homePage.clickOnHomeButton();

		AddNewCardPage addNewCardPage = homePage.downloadCard();

		assertTrue(addNewCardPage.isDownloadViaEsignetOptionDisplayed(), "Verify if download via uin displayed");
		MockCertifyLoginPage mockCertifyLoginPage = addNewCardPage.clickOnDownloadViaMockCertify();

		addNewCardPage.clickOnContinueButton();

		assertTrue(mockCertifyLoginPage.isEnterYourVidTextDisplayed(), "");

		OtpVerificationPage otpVerification = mockCertifyLoginPage.setEnterIdTextBox(getMockUIN());

		mockCertifyLoginPage.clickOnGetOtpButton();

		otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtpForMock(), PlatformType.ANDROID);
		mockCertifyLoginPage.clickOnVerifyButton();

		addNewCardPage.clickOnDoneButton();
		assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");

		homePage.downloadCard();

		addNewCardPage.clickOnDownloadViaMockCertify();

		addNewCardPage.clickOnContinueButton();

		assertTrue(mockCertifyLoginPage.isEnterYourVidTextDisplayed(), "");

		mockCertifyLoginPage.setEnterIdTextBox(getMockUIN());

		mockCertifyLoginPage.clickOnGetOtpButton();

		otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtpForMock(), PlatformType.ANDROID);
		mockCertifyLoginPage.clickOnVerifyButton();
		assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
	}
}
