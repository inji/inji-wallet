package inji.testcases.androidTestCases;

import inji.annotations.NeedsMockUIN;
import inji.annotations.NeedsSunbirdPolicy;
import inji.annotations.NeedsUIN;
import inji.constants.InjiWalletConstants;
import inji.constants.PlatformType;
import inji.pages.*;
import inji.testcases.BaseTest.AndroidBaseTest;
import inji.utils.InjiWalletUtil;
import inji.utils.IosUtil;
import inji.utils.TestDataReader;
import org.testng.annotations.Test;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

public class VerifyHistoryTest extends AndroidBaseTest {
	@Test
	@NeedsUIN
	public void downloadVcAndVerifyHistory() {
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

		RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();

		assertTrue(retrieveIdPage.isRetrieveIdPageLoaded(), "Verify if retrieve id page is displayed");
		OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(getUIN()).clickOnGenerateCardButton();

		assertTrue(otpVerification.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
		otpVerification.enterOtp(uinGetOtp(), PlatformType.ANDROID);

		addNewCardPage.clickOnDoneButton();

		assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");

		HistoryPage historyPage = homePage.clickOnHistoryButton();

		assertTrue(historyPage.isHistoryPageLoaded(), "Verify if history page is displayed");
		assertTrue(historyPage.verifyHistory(getUIN(), PlatformType.ANDROID));

	}

	@Test
	@NeedsUIN
	public void verifyActivationFailedRecordInHistory() throws InterruptedException {
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

		assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
		RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();

		assertTrue(retrieveIdPage.isRetrieveIdPageLoaded(), "Verify if retrieve id page is displayed");
		OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(getUIN()).clickOnGenerateCardButton();

		assertTrue(otpVerification.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
		otpVerification.enterOtp(uinGetOtp(), PlatformType.ANDROID);

		addNewCardPage.clickOnDoneButton();
		assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
		MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();

		PleaseConfirmPopupPage pleaseConfirmPopupPage = moreOptionsPage.clickOnActivationPending();

		OtpVerificationPage otpVerificationPage = pleaseConfirmPopupPage.clickOnConfirmButton();

		otpVerificationPage.enterOtp(TestDataReader.readData("invalidOtp"), PlatformType.ANDROID);

		assertTrue(otpVerification.invalidOtpMessageDisplayed(), "Verify if OTP is invalid message is displayed");
		otpVerificationPage.enterOtp(TestDataReader.readData("invalidOtp"), PlatformType.ANDROID);

		assertTrue(otpVerificationPage.somethingWetWrongInVcActivationDisplayed(),
				"Verify if Something is wrong. Please try again later displayed");
		assertTrue(otpVerificationPage.isCancelButtonDisplayed(), "Verify if cancel button is displayed");

		HistoryPage historyPage = otpVerificationPage.clickOnCancelButton().clickOnCloseButton().clickOnHistoryButton();
		assertTrue(historyPage.isHistoryPageLoaded(), "Verify if history page is displayed");
		assertTrue(historyPage.verifyActivationFailedRecordInHistory(getUIN(), PlatformType.ANDROID));
	}

	@Test
	@NeedsUIN
	public void verifyActivationFailedRecordInHistoryFromDetailedView() {
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

		RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();

		assertTrue(retrieveIdPage.isRetrieveIdPageLoaded(), "Verify if retrieve id page is displayed");
		OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(getUIN()).clickOnGenerateCardButton();

		otpVerification.enterOtp(uinGetOtp(), PlatformType.ANDROID);

		addNewCardPage.clickOnDoneButton();
		DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();
		PleaseConfirmPopupPage pleaseConfirmPopupPage = detailedVcViewPage.clickOnActivateButtonAndroid();

		OtpVerificationPage otpVerificationPage = pleaseConfirmPopupPage.clickOnConfirmButton();

		assertTrue(otpVerificationPage.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
		otpVerificationPage.enterOtp(TestDataReader.readData("invalidOtp"), PlatformType.ANDROID);

		assertTrue(otpVerificationPage.somethingWetWrongInVcActivationDisplayed(),
				"Verify if Something is wrong. Please try again later displayed");
		assertTrue(otpVerificationPage.isCancelButtonDisplayed(), "Verify if cancel button is displayed");

		otpVerificationPage.clickOnCancelButton();
		HistoryPage historyPage = detailedVcViewPage.clickOnBackArrow().clickOnHistoryButton();
		assertTrue(historyPage.isHistoryPageLoaded(), "Verify if history page is displayed");
		assertTrue(historyPage.verifyActivationFailedRecordInHistory(getUIN(), PlatformType.ANDROID));
	}

	@Test
	@NeedsUIN
	public void activateVcAndVerifyInHistory() throws InterruptedException {
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

		RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();

		assertTrue(retrieveIdPage.isRetrieveIdPageLoaded(), "Verify if retrieve id page is displayed");
		OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(getUIN()).clickOnGenerateCardButton();

		otpVerification.enterOtp(uinGetOtp(), PlatformType.ANDROID);

		addNewCardPage.clickOnDoneButton();
		MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();

		PleaseConfirmPopupPage pleaseConfirmPopupPage = moreOptionsPage.clickOnActivationPending();

		OtpVerificationPage otpVerificationPage = pleaseConfirmPopupPage.clickOnConfirmButton();

		otpVerificationPage.enterOtp(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.ANDROID);

		assertTrue(moreOptionsPage.isVcActivatedForOnlineLogin(), "Verify if VC is activated");
		HistoryPage historyPage = homePage.clickOnHistoryButton();
		assertTrue(historyPage.isHistoryPageLoaded(), "Verify if history page is displayed");
		assertTrue(historyPage.verifyActivationSuccessfulRecordInHistory(getUIN(), PlatformType.ANDROID));

	}

	@Test
	@NeedsUIN
	public void downloadAndVerifyHistoryUsingUinViaEsignet() throws InterruptedException {
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

		assertTrue(esignetLoginPage.isESignetLogoDisplayed(), "Verify if Esignet Login page is landed");
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getUIN());

		esignetLoginPage.clickOnGetOtpButton();
		assertTrue(esignetLoginPage.isOtpHasSendMessageDisplayed(), "verify if otp page is displayed");

		otpVerification.enterOtpForeSignet(uinGetOtp(), PlatformType.ANDROID);
		esignetLoginPage.clickOnVerifyButton();

		addNewCardPage.clickOnDoneButton();
		DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();

		assertTrue(detailedVcViewPage.isActivateButtonDisplayed(), "Verify if activate vc button displayed");

		PleaseConfirmPopupPage pleaseConfirmPopupPage = detailedVcViewPage.clickOnActivateButtonAndroid();

		pleaseConfirmPopupPage.clickOnConfirmButton();
		assertTrue(otpVerification.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");

		otpVerification.enterOtp(uinGetOtp(), PlatformType.ANDROID);
		assertTrue(detailedVcViewPage.isProfileAuthenticatedDisplayed(), "Verify profile authenticated displayed");
		detailedVcViewPage.clickOnCrossIcon();
		detailedVcViewPage.clickOnBackArrow();

		MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();

		moreOptionsPage.clickOnRemoveFromWallet();

		pleaseConfirmPopupPage.clickOnConfirmButton();
		assertEquals(homePage.verifyLanguageForNoVCDownloadedPageLoaded(), "Bring your digital identity");

		HistoryPage historyPage = homePage.clickOnHistoryButton();
		assertTrue(historyPage.isHistoryPageLoaded(), "Verify if history page is displayed");
		assertTrue(historyPage.verifyActivationSuccessfulRecordInHistory(getUIN(), PlatformType.ANDROID));
		assertTrue(historyPage.verifyHistory(getUIN(), PlatformType.ANDROID),
				"verify if download history is displayed");
		assertTrue(historyPage.verifyDeleteHistory(getUIN(), PlatformType.ANDROID),
				"Verify if deleted history is displayed");
	}

	@Test
	public void downloadAndVerifyHistoryUsingVidViaEsignet() throws InterruptedException {
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

		String vid = TestDataReader.readData("vid");
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(vid);

		esignetLoginPage.clickOnGetOtpButton();

		otpVerification.enterOtpForeSignet(uinGetOtp(), PlatformType.ANDROID);
		esignetLoginPage.clickOnVerifyButton();

		addNewCardPage.clickOnDoneButton();
		DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();

		assertTrue(detailedVcViewPage.isActivateButtonDisplayed(), "Verify if activate vc button displayed");

		PleaseConfirmPopupPage pleaseConfirmPopupPage = detailedVcViewPage.clickOnActivateButtonAndroid();
		assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(),
				"Verify if confirm popup page is displayed");

		pleaseConfirmPopupPage.clickOnConfirmButton();
		assertTrue(otpVerification.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");

		otpVerification.enterOtp(uinGetOtp(), PlatformType.ANDROID);
		assertTrue(detailedVcViewPage.isProfileAuthenticatedDisplayed(), "Verify profile authenticated displayed");
		detailedVcViewPage.clickOnCrossIcon();
		detailedVcViewPage.clickOnBackArrow();

		MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();
		assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");

		moreOptionsPage.clickOnRemoveFromWallet();
		assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if pop up page is displayed");

		pleaseConfirmPopupPage.clickOnConfirmButton();

		HistoryPage historyPage = homePage.clickOnHistoryButton();
		assertTrue(historyPage.isHistoryPageLoaded(), "Verify if history page is displayed");
		assertTrue(historyPage.verifyActivationSuccessfulRecordInHistory(vid, PlatformType.ANDROID));
		assertTrue(historyPage.verifyHistory(vid, PlatformType.ANDROID), "verify if download history is displayed");
	}

	@Test
	@NeedsSunbirdPolicy
	public void downloadAndVerifyHistoryForSunbird() {
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

		assertTrue(addNewCardPage.isIssuerSearchBarDisplayed(), "Verify if issuer search bar displayed");
		assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
		assertTrue(addNewCardPage.isAddNewCardPageGuideMessageForEsignetDisplayed(),
				"Verify if add new card guide message displayed");
		assertTrue(addNewCardPage.isDownloadViaSunbirdDisplayed(), "Verify if download sunbird displayed");
		SunbirdLoginPage sunbirdLoginPage = addNewCardPage.clickOnDownloadViaSunbird();
		addNewCardPage.clickOnCredentialTypeHeadingInsuranceCredential();

		sunbirdLoginPage.enterPolicyNumber(getPolicyNumber());
		sunbirdLoginPage.enterFullName(getPolicyName());
		sunbirdLoginPage.enterDateOfBirth();
		sunbirdLoginPage.clickOnLoginButton();

		addNewCardPage.clickOnDoneButton();
		assertTrue(sunbirdLoginPage.isSunbirdCardLogoDisplayed(), "Verify if download sunbird logo displayed");

		sunbirdLoginPage.openDetailedSunbirdVcView();

		assertEquals(sunbirdLoginPage.getFullNameForSunbirdCardForDetailView(), getPolicyName());
		assertEquals(sunbirdLoginPage.getPhoneNumberForSunbirdCard(), TestDataReader.readData("phoneNumberSunbird"));
		assertTrue(sunbirdLoginPage.isDateOfBirthValueForSunbirdCardDisplayed());
		assertEquals(sunbirdLoginPage.getGenderValueForSunbirdCard(), TestDataReader.readData("genderValueSunbird"));
		assertEquals(sunbirdLoginPage.getEmailIdValueForSunbirdCard(), TestDataReader.readData("emailIdValueSunbird"));
		assertEquals(sunbirdLoginPage.getStatusValueForSunbirdCard(), TestDataReader.readData("statusValueSunbird"));
		assertEquals(sunbirdLoginPage.getIdTypeValueForSunbirdCard(), TestDataReader.readData("idTypeSunbird"));

		sunbirdLoginPage.clickOnBackArrow();
		HistoryPage historyPage = homePage.clickOnHistoryButton();

		assertTrue(historyPage.isHistoryPageLoaded(), "Verify if history page is displayed");
		assertTrue(historyPage.verifyHistoryForInsuranceCard(TestDataReader.readData("policyNumberSunbird"),
				PlatformType.ANDROID));
	}

	@Test
	@NeedsUIN
	public void downloadVcAndVerifyHistoryFromMoreOptions() throws InterruptedException {
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

		RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();

		assertTrue(retrieveIdPage.isRetrieveIdPageLoaded(), "Verify if retrieve id page is displayed");
		OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(getUIN()).clickOnGenerateCardButton();

		assertTrue(otpVerification.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
		otpVerification.enterOtp(uinGetOtp(), PlatformType.ANDROID);

		addNewCardPage.clickOnDoneButton();
		assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
		MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();

		moreOptionsPage.clickOnViewActivityLog();
		HistoryPage historyPage = new HistoryPage(getDriver());
		assertTrue(historyPage.verifyHistory(getUIN(), PlatformType.ANDROID));
	}

	@Test
	@NeedsMockUIN
	public void downloadAndVerifyVcUsingMdlDeleteAndVerifyHistory() throws InterruptedException {
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

		assertTrue(addNewCardPage.isIssuerDescriptionEsignetDisplayed(),
				"Verify if issuer description  esignet displayed");
		assertTrue(addNewCardPage.isIssuerSearchBarDisplayed(), "Verify if issuer search bar displayed");
		MockCertifyLoginPage mockCertifyLoginPage = addNewCardPage.clickOnDownloadViaMockCertify();
		addNewCardPage.clickOnContinueButton();

		assertTrue(mockCertifyLoginPage.isEnterYourVidTextDisplayed(), "Verify if Esignet Login page is landed");

		OtpVerificationPage otpVerification = mockCertifyLoginPage.setEnterIdTextBox(getMockUIN());

		mockCertifyLoginPage.clickOnGetOtpButton();

		otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtpForMock(), PlatformType.ANDROID);
		mockCertifyLoginPage.clickOnVerifyButton();

		addNewCardPage.clickOnDoneButton();
		MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();

		moreOptionsPage.clickOnViewActivityLog();
		HistoryPage historyPage = new HistoryPage(getDriver());
		assertTrue(historyPage.verifyHistory(PlatformType.ANDROID));
		homePage.clickOnCrossIconButton();

		homePage.clickOnMoreOptionsButton();
		assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");
		moreOptionsPage.clickOnViewActivityLog();
		assertTrue(historyPage.verifyHistory(PlatformType.ANDROID));
	}

	@Test
	public void downloadAndVerifyVcUsingMockDeleteAndVerifyHistory() throws InterruptedException {
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

		assertTrue(addNewCardPage.isAddNewCardPageGuideMessageForEsignetDisplayed(),
				"Verify if add new card guide message displayed");
		assertTrue(addNewCardPage.isDownloadViaEsignetDisplayed(), "Verify if download via uin displayed");
		MockCertifyLoginPage mockCertifyLoginPage = new MockCertifyLoginPage(getDriver());

		addNewCardPage.clickOnDownloadViaMock();
		mockCertifyLoginPage.clickOnEsignetLoginWithOtpButton();

		OtpVerificationPage otpVerification = mockCertifyLoginPage.setEnterIdTextBox(TestDataReader.readData("Mock"));

		mockCertifyLoginPage.clickOnGetOtpButton();

		otpVerification.enterOtpForeSignet(uinGetOtp(), PlatformType.ANDROID);
		mockCertifyLoginPage.clickOnVerifyButton();

		addNewCardPage.clickOnDoneButton();
		MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();

		moreOptionsPage.clickOnViewActivityLog();
		HistoryPage historyPage = new HistoryPage(getDriver());
		assertTrue(historyPage.verifyHistory(PlatformType.ANDROID));
		homePage.clickOnCrossIconButton();

		homePage.clickOnMoreOptionsButton();
		assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");
		moreOptionsPage.clickOnViewActivityLog();
		assertTrue(historyPage.verifyHistoryForMock(PlatformType.ANDROID));
	}
}
