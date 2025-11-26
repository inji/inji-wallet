package inji.testcases.iosTestCases;

import inji.annotations.NeedsUIN;
import inji.annotations.NeedsVID;
import inji.constants.PlatformType;
import inji.pages.*;
import inji.testcases.BaseTest.IosBaseTest;
import inji.utils.InjiWalletUtil;
import inji.utils.TestDataReader;
import org.testng.annotations.Test;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

public class VcDownloadAndVerifyUsingSDJwt extends IosBaseTest {
	@Test
	@NeedsUIN
	public void downloadAndVerifyLandSdJwtVc() throws InterruptedException {
		ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
		WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
		AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
		SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
		ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"),
				PlatformType.IOS);
		HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"),
				PlatformType.IOS);
		homePage.clickOnNextButtonForInjiTour();
		AddNewCardPage addNewCardPage = homePage.downloadCard();
		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaLandSdJwt();
		addNewCardPage.clickOnContinueButtonInSigninPopupIos();
		esignetLoginPage.clickOnLoginWithOtpButton();
//		OtpVerificationPage otpVerification = esignetLoginPage
//				.setEnterIdTextBox(TestDataReader.readData("LandRegistry"));
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(AddNewCardPage.LandRegistryUIN);
		esignetLoginPage.clickOnGetOtpButton();
		otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtp(), PlatformType.IOS);
		esignetLoginPage.clickOnVerifyButtonIos();
		addNewCardPage.clickOnDoneButton();
		assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
		DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();
		assertTrue(detailedVcViewPage.isDetailedVcViewPageLoaded(), "Verify if detailed Vc view page is displayed");
		assertTrue(esignetLoginPage.isviewSharableInformationSdJwtVcDisplayed(),
				"Verify if Sharbale inforamtion link is displayed");
		assertTrue(esignetLoginPage.isInformationForSharedOptionsOnSdJwtDisplayed(),
				"Verify if Information for shared on SdJwt is displayed");
		esignetLoginPage.clickOnviewSharableInformationOnSdJwt();
		assertTrue(esignetLoginPage.isInformationMessageHadingSdJwtVcDisplayed(),
				"Verify if Sharbale inforamtion Heading is displayed");
		assertTrue(esignetLoginPage.isConsentOnInformationMessageSdJwtVcDisplayed(),
				"Verify if Consnet on the Sharbale inforamtion page is displayed");
		esignetLoginPage.clickOnCloseviewSharableInformationOnSdJwt();

	}

	@Test
	@NeedsUIN
	public void downloadAndVerifyLandSdJwtVcUsingInvalidCredential() throws InterruptedException {
		ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
		WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
		AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
		SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
		ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"),
				PlatformType.IOS);
		HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"),
				PlatformType.IOS);
		homePage.clickOnNextButtonForInjiTour();
		AddNewCardPage addNewCardPage = homePage.downloadCard();
		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaLandSdJwt();
		addNewCardPage.clickOnContinueButtonInSigninPopupIos();
		esignetLoginPage.clickOnLoginWithOtpButton();
		OtpVerificationPage otpVerification = esignetLoginPage
				.setEnterIdTextBox(TestDataReader.readData("InvalidLandRegistry"));
		esignetLoginPage.clickOnGetOtpButton();
		assertTrue(otpVerification.isInvalidIndividualErrorMessageDisplayed(),
				"Verify if invalid individual id error displayed");
	}

	@Test
	@NeedsUIN
	public void downloadAndVerifyLandSdJwtVcUsingInvalidOtp() throws InterruptedException {
		ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
		WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
		AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
		SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
		ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"),
				PlatformType.IOS);
		HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"),
				PlatformType.IOS);
		homePage.clickOnNextButtonForInjiTour();
		AddNewCardPage addNewCardPage = homePage.downloadCard();
		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaLandSdJwt();
		addNewCardPage.clickOnContinueButtonInSigninPopupIos();
		esignetLoginPage.clickOnLoginWithOtpButton();
//		OtpVerificationPage otpVerification = esignetLoginPage
//				.setEnterIdTextBox(TestDataReader.readData("LandRegistry"));
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(AddNewCardPage.LandRegistryUIN);
		esignetLoginPage.clickOnGetOtpButton();
		otpVerification.enterOtpForeSignet(TestDataReader.readData("invalidOtp"), PlatformType.IOS);
		esignetLoginPage.clickOnVerifyButtonIos();
		assertTrue(otpVerification.isInvalidOTPErrorMessageDisplayed(), "Verify if invalid OTP error displayed");
	}

	@Test
	@NeedsUIN
	public void downloadAndVerifyLandSdJwtVcAndPinAndUnpin() throws InterruptedException {
		ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
		WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
		AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
		SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
		ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"),
				PlatformType.IOS);
		HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"),
				PlatformType.IOS);
		homePage.clickOnNextButtonForInjiTour();
		AddNewCardPage addNewCardPage = homePage.downloadCard();
		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaLandSdJwt();
		addNewCardPage.clickOnContinueButtonInSigninPopupIos();
		esignetLoginPage.clickOnLoginWithOtpButton();
//		OtpVerificationPage otpVerification = esignetLoginPage
//				.setEnterIdTextBox(TestDataReader.readData("LandRegistry"));
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(AddNewCardPage.LandRegistryUIN);
		esignetLoginPage.clickOnGetOtpButton();
		otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtp(), PlatformType.IOS);
		esignetLoginPage.clickOnVerifyButtonIos();
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
	@NeedsUIN
	public void downloadAndVerifyLandSdJwtVcMultipleTime() throws InterruptedException {
		ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
		WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
		AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
		SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
		ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"),
				PlatformType.IOS);
		HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"),
				PlatformType.IOS);
		homePage.clickOnNextButtonForInjiTour();
		AddNewCardPage addNewCardPage = homePage.downloadCard();
		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaLandSdJwt();
		addNewCardPage.clickOnContinueButtonInSigninPopupIos();
		esignetLoginPage.clickOnLoginWithOtpButton();
//		OtpVerificationPage otpVerification = esignetLoginPage
//				.setEnterIdTextBox(TestDataReader.readData("LandRegistry"));
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(AddNewCardPage.LandRegistryUIN);
		esignetLoginPage.clickOnGetOtpButton();
		otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtp(), PlatformType.IOS);
		esignetLoginPage.clickOnVerifyButtonIos();
		addNewCardPage.clickOnDoneButton();
		assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
		AddNewCardPage addNewCardPageAgain = homePage.downloadCard();
		ESignetLoginPage esignetLoginPageAgain = addNewCardPageAgain.clickOnDownloadViaLandSdJwt();
		addNewCardPageAgain.clickOnContinueButtonInSigninPopupIos();
		esignetLoginPageAgain.clickOnLoginWithOtpButton();
//		OtpVerificationPage otpVerificationAgain = esignetLoginPageAgain
//				.setEnterIdTextBox(TestDataReader.readData("LandRegistry"));
		OtpVerificationPage otpVerificationAgain = esignetLoginPageAgain.setEnterIdTextBox(AddNewCardPage.LandRegistryUIN);
		esignetLoginPageAgain.clickOnGetOtpButton();
		otpVerificationAgain.enterOtpForeSignet(InjiWalletUtil.getOtp(), PlatformType.IOS);
		esignetLoginPageAgain.clickOnVerifyButtonIos();
	}
}
