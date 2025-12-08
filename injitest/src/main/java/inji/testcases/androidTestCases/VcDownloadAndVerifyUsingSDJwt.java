package inji.testcases.androidTestCases;

import inji.annotations.NeedsUIN;
import inji.constants.InjiWalletConstants;
import inji.constants.PlatformType;
import inji.pages.*;
import inji.testcases.BaseTest.AndroidBaseTest;
import inji.utils.InjiWalletUtil;
import inji.utils.ResourceBundleLoader;
import inji.utils.TestDataReader;
import org.testng.annotations.Test;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

public class VcDownloadAndVerifyUsingSDJwt extends AndroidBaseTest {
	
	@Test
	public void downloadAndVerifyLandSdJwtVc() throws InterruptedException {
		ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
		WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
		AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
		SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
		ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"),
				PlatformType.ANDROID);
		HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"),
				PlatformType.ANDROID);
		homePage.clickOnNextButtonForInjiTour();
		AddNewCardPage addNewCardPage = homePage.downloadCard();
		assertTrue(addNewCardPage.isIssuerDescriptionEsignetDisplayed(),
				"Verify if issuer description  esignet displayed");
		assertTrue(addNewCardPage.isAddNewCardPageGuideMessageForEsignetDisplayed(),
				"Verify if add new card guide message displayed");
		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaLandSdJwt();
		esignetLoginPage.clickOnEsignetLoginWithOtpButton();
		esignetLoginPage.clickOnLoginWithOtpButton();
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(AddNewCardPage.LandRegistryUIN);
		esignetLoginPage.clickOnHideKeyboardAndGetOtpButton();
		otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtp(), PlatformType.ANDROID);
		esignetLoginPage.clickOnVerifyButton();
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
	public void downloadAndVerifyLandSdJwtVcUsingInvalidCredential() throws InterruptedException {
		ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
		WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
		AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
		SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
		ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"),
				PlatformType.ANDROID);
		HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"),
				PlatformType.ANDROID);
		homePage.clickOnNextButtonForInjiTour();
		AddNewCardPage addNewCardPage = homePage.downloadCard();
		assertTrue(addNewCardPage.isIssuerDescriptionEsignetDisplayed(),
				"Verify if issuer description  esignet displayed");
		assertTrue(addNewCardPage.isAddNewCardPageGuideMessageForEsignetDisplayed(),
				"Verify if add new card guide message displayed");
		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaLandSdJwt();
		esignetLoginPage.clickOnEsignetLoginWithOtpButton();
		esignetLoginPage.clickOnLoginWithOtpButton();
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(TestDataReader.readData("invaliduin"));
		esignetLoginPage.clickOnHideKeyboardAndGetOtpButton();
		assertTrue(otpVerification.isInvalidIndividualErrorMessageDisplayed(),
				"Verify if invalid individual id error displayed");
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
				PlatformType.ANDROID);
		HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"),
				PlatformType.ANDROID);
		homePage.clickOnNextButtonForInjiTour();
		AddNewCardPage addNewCardPage = homePage.downloadCard();
		assertTrue(addNewCardPage.isIssuerDescriptionEsignetDisplayed(),
				"Verify if issuer description  esignet displayed");
		assertTrue(addNewCardPage.isAddNewCardPageGuideMessageForEsignetDisplayed(),
				"Verify if add new card guide message displayed");
		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaLandSdJwt();
		esignetLoginPage.clickOnEsignetLoginWithOtpButton();
		esignetLoginPage.clickOnLoginWithOtpButton();
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(AddNewCardPage.LandRegistryUIN);
		esignetLoginPage.clickOnHideKeyboardAndGetOtpButton();
		otpVerification.enterOtpForeSignet(TestDataReader.readData("invalidOtp"), PlatformType.ANDROID);
		esignetLoginPage.clickOnVerifyButton();
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
				PlatformType.ANDROID);
		HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"),
				PlatformType.ANDROID);
		homePage.clickOnNextButtonForInjiTour();
		AddNewCardPage addNewCardPage = homePage.downloadCard();
		assertTrue(addNewCardPage.isIssuerDescriptionEsignetDisplayed(),
				"Verify if issuer description  esignet displayed");
		assertTrue(addNewCardPage.isAddNewCardPageGuideMessageForEsignetDisplayed(),
				"Verify if add new card guide message displayed");
		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaLandSdJwt();
		esignetLoginPage.clickOnEsignetLoginWithOtpButton();
		esignetLoginPage.clickOnLoginWithOtpButton();
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(AddNewCardPage.LandRegistryUIN);
		esignetLoginPage.clickOnHideKeyboardAndGetOtpButton();
		otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtp(), PlatformType.ANDROID);
		esignetLoginPage.clickOnVerifyButton();
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
				PlatformType.ANDROID);
		HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"),
				PlatformType.ANDROID);
		homePage.clickOnNextButtonForInjiTour();
		AddNewCardPage addNewCardPage = homePage.downloadCard();
		assertTrue(addNewCardPage.isIssuerDescriptionEsignetDisplayed(),
				"Verify if issuer description esignet displayed");
		assertTrue(addNewCardPage.isAddNewCardPageGuideMessageForEsignetDisplayed(),
				"Verify if add new card guide message displayed");
		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaLandSdJwt();
		esignetLoginPage.clickOnEsignetLoginWithOtpButton();
		esignetLoginPage.clickOnLoginWithOtpButton();
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(AddNewCardPage.LandRegistryUIN);
		esignetLoginPage.clickOnHideKeyboardAndGetOtpButton();
		otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtp(), PlatformType.ANDROID);
		esignetLoginPage.clickOnVerifyButton();
		addNewCardPage.clickOnDoneButton();
		assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
		AddNewCardPage addNewCardPageAgain = homePage.downloadCard();
		assertTrue(addNewCardPageAgain.isIssuerDescriptionEsignetDisplayed(),
				"Verify if issuer description esignet displayed");
		assertTrue(addNewCardPageAgain.isAddNewCardPageGuideMessageForEsignetDisplayed(),
				"Verify if add new card guide message displayed");
		ESignetLoginPage esignetLoginPageAgain = addNewCardPageAgain.clickOnDownloadViaLandSdJwt();
		esignetLoginPageAgain.clickOnEsignetLoginWithOtpButton();
		esignetLoginPageAgain.clickOnLoginWithOtpButton();
		OtpVerificationPage otpVerificationAgain = esignetLoginPageAgain
				.setEnterIdTextBox(AddNewCardPage.LandRegistryUIN);
		esignetLoginPageAgain.clickOnHideKeyboardAndGetOtpButton();
		otpVerificationAgain.enterOtpForeSignet(InjiWalletUtil.getOtp(), PlatformType.ANDROID);
		esignetLoginPageAgain.clickOnVerifyButton();
	}

}