package inji.testcases.androidTestCases;

import inji.annotations.NeedsSunbirdPolicy;
import inji.annotations.NeedsUIN;
import inji.constants.InjiWalletConstants;
import inji.constants.PlatformType;
import inji.pages.*;
import inji.testcases.BaseTest.AndroidBaseTest;
import inji.utils.TestDataReader;
import org.testng.annotations.Test;
import static org.testng.Assert.assertTrue;

public class MosipOtpAlternativeFlowForHistoryAndPinTest extends AndroidBaseTest {

	@Test
	@NeedsUIN
	public void pinVcInDetailedVcView() {
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

		DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();
		assertTrue(detailedVcViewPage.isDetailedVcViewPageLoaded(), "Verify if detailed Vc view page is displayed");

		detailedVcViewPage.clickOnMoreOptionsInDetails();

		MoreOptionsPage moreOptionsPage = new MoreOptionsPage(getDriver());
		assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");
		moreOptionsPage.clickOnPinOrUnPinCard();

		detailedVcViewPage.clickOnBackArrow();
		assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
		assertTrue(homePage.isPinIconDisplayed(), "Verify if pin icon on vc is displayed");

		homePage.openDetailedVcView();
		assertTrue(detailedVcViewPage.isDetailedVcViewPageLoaded(), "Verify if detailed Vc view page is displayed");

		detailedVcViewPage.clickOnMoreOptionsInDetails();
		assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");
		moreOptionsPage.clickOnPinOrUnPinCard();
	}

	@Test
	@NeedsUIN
	@NeedsSunbirdPolicy
	public void pinEsignetVcMultipleTimes() throws InterruptedException {

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
		assertTrue(addNewCardPage.isIssuerDescriptionEsignetDisplayed(),
				"Verify if issuer description  esignet displayed");
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

		homePage.clickOnDoneButton();

		homePage.downloadCard();

		assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();

		esignetLoginPage.clickOnEsignetLoginWithOtpButton();

		esignetLoginPage.setEnterIdTextBox(getUIN());

		esignetLoginPage.clickOnGetOtpButton();
		OtpVerificationPage otpVerification = new OtpVerificationPage(getDriver());

		otpVerification.enterOtpForeSignet(uinGetOtp(), PlatformType.ANDROID);
		esignetLoginPage.clickOnVerifyButton();

		MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();

		moreOptionsPage.clickOnPinOrUnPinCard();

		assertTrue(homePage.isPinIconDisplayed(), "Verify if pin icon on vc is displayed");

		homePage.clickOnMoreOptionsButton();

		moreOptionsPage.clickOnPinOrUnPinCard();
		homePage.clickOnSecondVcEllipsis();
		moreOptionsPage.clickOnPinOrUnPinCard();
		assertTrue(homePage.isPinIconDisplayed(), "Verify if pin icon on vc is displayed");

		homePage.clickOnSecondVcEllipsis();
		moreOptionsPage.clickOnPinOrUnPinCard();

		assertTrue(homePage.isPinIconDisplayed(), "Verify if pin icon on vc is displayed");
	}

	@Test
	@NeedsUIN
	@NeedsSunbirdPolicy
	public void pinSubirdVcMultipleTimes() throws InterruptedException {

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
		SunbirdLoginPage sunbirdLoginPage = addNewCardPage.clickOnDownloadViaSunbird();
		addNewCardPage.clickOnCredentialTypeHeadingInsuranceCredential();

		sunbirdLoginPage.enterPolicyNumber(getPolicyNumber());
		sunbirdLoginPage.enterFullName(getPolicyName());
		sunbirdLoginPage.enterDateOfBirth();
		sunbirdLoginPage.clickOnLoginButton();

		homePage.clickOnDoneButton();
		homePage.downloadCard();

		assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();

		esignetLoginPage.clickOnEsignetLoginWithOtpButton();

		esignetLoginPage.setEnterIdTextBox(getUIN());

		esignetLoginPage.clickOnGetOtpButton();

		OtpVerificationPage otpVerification = new OtpVerificationPage(getDriver());
		otpVerification.enterOtpForeSignet(uinGetOtp(), PlatformType.ANDROID);
		esignetLoginPage.clickOnVerifyButton();

		MoreOptionsPage moreOptionsPage = new MoreOptionsPage(getDriver());
		homePage.clickOnSecondVcEllipsis();
		moreOptionsPage.clickOnPinOrUnPinCard();
		assertTrue(homePage.isPinIconDisplayed(), "Verify if pin icon on vc is displayed");

		homePage.clickOnSecondVcEllipsis();
		moreOptionsPage.clickOnPinOrUnPinCard();
		assertTrue(homePage.isPinIconDisplayed(), "Verify if pin icon on vc is displayed");
		homePage.clickOnMoreOptionsButton();

		moreOptionsPage.clickOnPinOrUnPinCard();

		homePage.clickOnSecondVcEllipsis();
		moreOptionsPage.clickOnPinOrUnPinCard();
		assertTrue(homePage.isPinIconDisplayed(), "Verify if pin icon on vc is displayed");

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

		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();

		esignetLoginPage.clickOnEsignetLoginWithOtpButton();

		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getUIN());

		esignetLoginPage.clickOnGetOtpButton();

		otpVerification.enterOtpForeSignet(uinGetOtp(), PlatformType.ANDROID);
		esignetLoginPage.clickOnVerifyButton();

		addNewCardPage.clickOnDoneButton();
		MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();

		PleaseConfirmPopupPage pleaseConfirmPopupPage = moreOptionsPage.clickOnActivationPending();

		assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if pop up page is displayed");
		OtpVerificationPage otpVerificationPage = pleaseConfirmPopupPage.clickOnConfirmButton();

		assertTrue(otpVerificationPage.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
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

		assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();

		esignetLoginPage.clickOnEsignetLoginWithOtpButton();

		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getUIN());

		esignetLoginPage.clickOnGetOtpButton();

		otpVerification.enterOtpForeSignet(uinGetOtp(), PlatformType.ANDROID);
		esignetLoginPage.clickOnVerifyButton();

		addNewCardPage.clickOnDoneButton();
		DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();
		PleaseConfirmPopupPage pleaseConfirmPopupPage = detailedVcViewPage.clickOnActivateButtonAndroid();

		OtpVerificationPage otpVerificationPage = pleaseConfirmPopupPage.clickOnConfirmButton();

		otpVerificationPage.enterOtp(TestDataReader.readData("invalidOtp"), PlatformType.ANDROID);

		assertTrue(otpVerificationPage.somethingWetWrongInVcActivationDisplayed(),
				"Verify if Something is wrong. Please try again later displayed");
		assertTrue(otpVerificationPage.isCancelButtonDisplayed(), "Verify if cancel button is displayed");

		otpVerificationPage.clickOnCancelButton();
		HistoryPage historyPage = detailedVcViewPage.clickOnArrowleft().clickOnHistoryButton();
		assertTrue(historyPage.isHistoryPageLoaded(), "Verify if history page is displayed");
		assertTrue(historyPage.verifyActivationFailedRecordInHistory(getUIN(), PlatformType.ANDROID));
	}
}
