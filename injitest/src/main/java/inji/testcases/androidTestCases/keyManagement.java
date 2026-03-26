package inji.testcases.androidTestCases;

import inji.annotations.NeedsSunbirdPolicy;
import inji.annotations.NeedsUIN;
import inji.constants.PlatformType;
import inji.pages.*;
import inji.testcases.BaseTest.AndroidBaseTest;
import inji.utils.InjiWalletUtil;
import inji.utils.IosUtil;
import inji.utils.TestDataReader;
import org.testng.annotations.Test;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

public class keyManagement extends AndroidBaseTest {
	@Test
	@NeedsSunbirdPolicy
	public void downloadAndVerifyVcUsingUinViaSunbird() throws InterruptedException {
		ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

		WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

		AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

		SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

		ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"),
				PlatformType.ANDROID);

		HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"),
				PlatformType.ANDROID);

		homePage.clickOnNextButtonForInjiTour();

		SettingsPage settingsPage = homePage.clickOnSettingIcon();
		settingsPage.clickOnKeyManagement();
		KeyManagementPage keyManagementPage = new KeyManagementPage(getDriver());
		keyManagementPage.clickOnDoneButton();

		IosUtil.dragAndDrop(getDriver(), keyManagementPage.getTheCoordinatesForRSA(),
				keyManagementPage.getTheCoordinatesED25519Text());
		keyManagementPage.clickOnSaveKeyOrderingPreferenceButton();

		assertTrue(keyManagementPage.iskeyOrderingSuccessTextMessageDisplayed(),
				"Verify if confirm passcode page is displayed");
		keyManagementPage.clickOnArrowleftButton();
		homePage.clickOnHomeButton();
		AddNewCardPage addNewCardPage = homePage.downloadCard();

		SunbirdLoginPage sunbirdLoginPage = addNewCardPage.clickOnDownloadViaSunbird();
		addNewCardPage.clickOnCredentialTypeHeadingInsuranceCredential();
		ESignetLoginPage esignetLoginPage = new ESignetLoginPage(getDriver());
		esignetLoginPage.clickOnEsignetLoginWithOtpButton();

		sunbirdLoginPage.enterPolicyNumber(getPolicyNumber());
		sunbirdLoginPage.enterFullName(getPolicyName());
		sunbirdLoginPage.enterDateOfBirth();
		sunbirdLoginPage.clickOnLoginButton();

		assertTrue(sunbirdLoginPage.isSunbirdCardActive(), "Verify if download sunbird displayed active");
		assertTrue(sunbirdLoginPage.isSunbirdCardLogoDisplayed(), "Verify if download sunbird logo displayed");
		sunbirdLoginPage.openDetailedSunbirdVcView();
		assertEquals(sunbirdLoginPage.getFullNameForSunbirdCard(), TestDataReader.readData("fullNameSunbird"));

	}

	@Test
	public void downloadAndVerifyVcUsingMockIdentity() throws InterruptedException {
		ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

		WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

		AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

		SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

		ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"),
				PlatformType.ANDROID);

		HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"),
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
		homePage.clickOnCrossIconButton();
		keyManagementPage.clickOnArrowleftButton();
		homePage.clickOnHomeButton();
		AddNewCardPage addNewCardPage = homePage.downloadCard();

		MockCertifyLoginPage mockCertifyLoginPage = addNewCardPage.clickOnDownloadViaMockCertify();

		addNewCardPage.clickOnContinueButton();

		OtpVerificationPage otpVerification = mockCertifyLoginPage.setEnterIdTextBox("9261481024");

		mockCertifyLoginPage.clickOnGetOtpButton();

		otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtpForMock(), PlatformType.ANDROID);
		mockCertifyLoginPage.clickOnVerifyButton();
		addNewCardPage.clickOnDoneButton();
		homePage.clickOnCrossIconButton();
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
		IosUtil.scrollToElement(getDriver(), 59, 755, 119, 20);
	}

	@Test
	@NeedsUIN
	public void downloadAndVerifyVcUsingEsignet() {
		ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

		WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

		AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

		SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

		ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"),
				PlatformType.ANDROID);

		HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"),
				PlatformType.ANDROID);

		homePage.clickOnNextButtonForInjiTour();

		SettingsPage settingsPage = homePage.clickOnSettingIcon();
		settingsPage.clickOnKeyManagement();
		KeyManagementPage keyManagementPage = new KeyManagementPage(getDriver());
		keyManagementPage.clickOnDoneButton();

		IosUtil.dragAndDrop(getDriver(), keyManagementPage.getTheCoordinatesForRSA(),
				keyManagementPage.getTheCoordinatesED25519Text());
		keyManagementPage.clickOnSaveKeyOrderingPreferenceButton();

		assertTrue(keyManagementPage.iskeyOrderingSuccessTextMessageDisplayed(),
				"Verify if confirm passcode page is displayed");
		keyManagementPage.clickOnArrowleftButton();

		homePage.clickOnHomeButton();
		AddNewCardPage addNewCardPage = homePage.downloadCard();

		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();
		esignetLoginPage.clickOnEsignetLoginWithOtpButton();

		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getUIN());
		esignetLoginPage.clickOnGetOtpButton();

		otpVerification.enterOtpForeSignet(uinGetOtp(), PlatformType.ANDROID);
		esignetLoginPage.clickOnVerifyButton();

		addNewCardPage.clickOnDoneButton();
		assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
		DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();

		assertTrue(detailedVcViewPage.isDetailedVcViewPageLoaded(), "Verify if detailed Vc view page is displayed");
	}

	@Test
	@NeedsSunbirdPolicy
	public void downloadAndVerifyVcUsingUinViaSunbirdWithEECK1DownloadAndDelete() throws InterruptedException {
		ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

		WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

		AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

		SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

		ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"),
				PlatformType.ANDROID);

		HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"),
				PlatformType.ANDROID);

		homePage.clickOnNextButtonForInjiTour();

		SettingsPage settingsPage = homePage.clickOnSettingIcon();
		settingsPage.clickOnKeyManagement();
		KeyManagementPage keyManagementPage = new KeyManagementPage(getDriver());
		keyManagementPage.clickOnDoneButton();

		IosUtil.dragAndDrop(getDriver(), keyManagementPage.getTheCoordinatesECCk1TextText(),
				keyManagementPage.getTheCoordinatesED25519Text());
		keyManagementPage.clickOnSaveKeyOrderingPreferenceButton();

		assertTrue(keyManagementPage.iskeyOrderingSuccessTextMessageDisplayed(),
				"Verify if confirm passcode page is displayed");
		keyManagementPage.clickOnArrowleftButton();

		homePage.clickOnHomeButton();
		AddNewCardPage addNewCardPage = homePage.downloadCard();

		SunbirdLoginPage sunbirdLoginPage = addNewCardPage.clickOnDownloadViaSunbird();
		addNewCardPage.clickOnCredentialTypeHeadingInsuranceCredential();
		ESignetLoginPage esignetLoginPage = new ESignetLoginPage(getDriver());
		esignetLoginPage.clickOnEsignetLoginWithOtpButton();

		sunbirdLoginPage.enterPolicyNumber(getPolicyNumber());
		sunbirdLoginPage.enterFullName(getPolicyName());
		sunbirdLoginPage.enterDateOfBirth();
		sunbirdLoginPage.clickOnLoginButton();

		addNewCardPage.clickOnDoneButton();

		MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();

		PleaseConfirmPopupPage pleaseConfirmPopupPage = moreOptionsPage.clickOnRemoveFromWallet();

		pleaseConfirmPopupPage.clickOnConfirmButton();
		assertEquals(homePage.verifyLanguageForNoVCDownloadedPageLoaded(), "Bring your digital identity");
		homePage.downloadCard();
		addNewCardPage.clickOnDownloadViaSunbird();
		addNewCardPage.clickOnCredentialTypeHeadingInsuranceCredential();
		esignetLoginPage.clickOnEsignetLoginWithOtpButton();

		sunbirdLoginPage.enterPolicyNumber(getPolicyNumber());
		sunbirdLoginPage.enterFullName(getPolicyName());
		sunbirdLoginPage.enterDateOfBirth();
		sunbirdLoginPage.clickOnLoginButton();

		addNewCardPage.clickOnDoneButton();
		assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");

	}

	@Test
	@NeedsSunbirdPolicy
	public void downloadAndVerifyVcUsingUinViaSunbirdWithEECR1() {
		ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

		WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

		AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

		SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

		ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"),
				PlatformType.ANDROID);

		HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"),
				PlatformType.ANDROID);

		homePage.clickOnNextButtonForInjiTour();

		SettingsPage settingsPage = homePage.clickOnSettingIcon();
		settingsPage.clickOnKeyManagement();
		KeyManagementPage keyManagementPage = new KeyManagementPage(getDriver());
		keyManagementPage.clickOnDoneButton();

		IosUtil.dragAndDrop(getDriver(), keyManagementPage.getTheCoordinatesECCR1TextText(),
				keyManagementPage.getTheCoordinatesED25519Text());
		keyManagementPage.clickOnSaveKeyOrderingPreferenceButton();

		keyManagementPage.clickOnArrowleftButton();

		homePage.clickOnHomeButton();
		AddNewCardPage addNewCardPage = homePage.downloadCard();

		SunbirdLoginPage sunbirdLoginPage = addNewCardPage.clickOnDownloadViaSunbird();
		addNewCardPage.clickOnCredentialTypeHeadingInsuranceCredential();
		ESignetLoginPage esignetLoginPage = new ESignetLoginPage(getDriver());
		esignetLoginPage.clickOnEsignetLoginWithOtpButton();

		sunbirdLoginPage.enterPolicyNumber(getPolicyNumber());
		sunbirdLoginPage.enterFullName(getPolicyName());
		sunbirdLoginPage.enterDateOfBirth();
		sunbirdLoginPage.clickOnLoginButton();

		assertTrue(sunbirdLoginPage.isSunbirdCardActive(), "Verify if download sunbird displayed active");
		assertTrue(sunbirdLoginPage.isSunbirdCardLogoDisplayed(), "Verify if download sunbird logo displayed");
		sunbirdLoginPage.openDetailedSunbirdVcView();
		assertEquals(sunbirdLoginPage.getFullNameForSunbirdCard(), TestDataReader.readData("fullNameSunbird"));

	}

	@Test
	@NeedsSunbirdPolicy
	public void downloadAndVerifyVcUsingUinViaMdlWithEECR1() {
		ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

		WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

		AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

		SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

		ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"),
				PlatformType.ANDROID);

		HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"),
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

		SunbirdLoginPage sunbirdLoginPage = addNewCardPage.clickOnDownloadViaSunbird();
		addNewCardPage.clickOnCredentialTypeHeadingInsuranceCredential();
		ESignetLoginPage esignetLoginPage = new ESignetLoginPage(getDriver());
		esignetLoginPage.clickOnEsignetLoginWithOtpButton();

		sunbirdLoginPage.enterPolicyNumber(getPolicyNumber());
		sunbirdLoginPage.enterFullName(getPolicyName());
		sunbirdLoginPage.enterDateOfBirth();
		sunbirdLoginPage.clickOnLoginButton();

		assertTrue(sunbirdLoginPage.isSunbirdCardActive(), "Verify if download sunbird displayed active");
		assertTrue(sunbirdLoginPage.isSunbirdCardLogoDisplayed(), "Verify if download sunbird logo displayed");
		sunbirdLoginPage.openDetailedSunbirdVcView();
		assertEquals(sunbirdLoginPage.getFullNameForSunbirdCard(), TestDataReader.readData("fullNameSunbird"));

	}

}
