package inji.testcases.iosTestCases;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

import org.testng.annotations.Test;

import inji.annotations.NeedsUIN;
import inji.constants.InjiWalletConstants;
import inji.constants.PlatformType;
import inji.pages.AddNewCardPage;
import inji.pages.AppUnlockMethodPage;
import inji.pages.ChooseLanguagePage;
import inji.pages.ConfirmPasscode;
import inji.pages.DetailedVcViewPage;
import inji.pages.ESignetLoginPage;
import inji.pages.HomePage;
import inji.pages.MoreOptionsPage;
import inji.pages.OtpVerificationPage;
import inji.pages.SetPasscode;
import inji.pages.WelcomePage;
import inji.testcases.BaseTest.IosBaseTest;
import inji.utils.InjiWalletUtil;
import inji.utils.ResourceBundleLoader;
import inji.utils.TestDataReader;

public class VcDownloadAndVerifyUsingSDJwt extends IosBaseTest {
	
	@Test
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
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(AddNewCardPage.LandRegistryUIN);
		esignetLoginPage.clickOnGetOtpButton();
		otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtp(), PlatformType.IOS);
		esignetLoginPage.clickOnVerifyButtonIos();
		addNewCardPage.clickOnDoneButton();
		assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
		DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();
		homePage.clickOnCrossIconButton();
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
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(TestDataReader.readData("invaliduin"));
		esignetLoginPage.clickOnGetOtpButton();
		assertEquals(ResourceBundleLoader.get(InjiWalletConstants.invalid_individual_id),
				otpVerification.getInvalidIndividualErrorMessageForEsignet());
	}

	@Test
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
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(AddNewCardPage.LandRegistryUIN);
		esignetLoginPage.clickOnGetOtpButton();
		otpVerification.enterOtpForeSignet(TestDataReader.readData("invalidOtp"), PlatformType.IOS);
		esignetLoginPage.clickOnVerifyButtonIos();
		assertEquals(ResourceBundleLoader.get(InjiWalletConstants.auth_failed),
				otpVerification.getInvalidOtpMessageForEsignetFarmer());

	}

	@Test
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
		OtpVerificationPage otpVerificationAgain = esignetLoginPageAgain
				.setEnterIdTextBox(AddNewCardPage.LandRegistryUIN);
		esignetLoginPageAgain.clickOnGetOtpButton();
		otpVerificationAgain.enterOtpForeSignet(InjiWalletUtil.getOtp(), PlatformType.IOS);
		esignetLoginPageAgain.clickOnVerifyButtonIos();
	}
}
