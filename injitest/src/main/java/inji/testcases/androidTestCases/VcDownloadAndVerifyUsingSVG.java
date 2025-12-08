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

public class VcDownloadAndVerifyUsingSVG extends AndroidBaseTest {
	
	@Test
	public void downloadAndVerifyFarmerSVGVcWithFace() throws InterruptedException {
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
		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaLandSVGWithFace();
		esignetLoginPage.clickOnEsignetLoginWithOtpButton();
		esignetLoginPage.clickOnLoginWithOtpButton();
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(AddNewCardPage.SVGWithFaceUIN);
		esignetLoginPage.clickOnHideKeyboardAndGetOtpButton();
		otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtp(), PlatformType.ANDROID);
		esignetLoginPage.clickOnVerifyButton();
		addNewCardPage.clickOnDoneButton();
		assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
		DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();
		assertTrue(detailedVcViewPage.isDetailedVcViewPageLoaded(), "Verify if detailed Vc view page is displayed");

	}

	@Test
	public void downloadAndVerifyFarmerSVGVcWithoutFace() throws InterruptedException {
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
		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaLandSVGWithOutFace();
		esignetLoginPage.clickOnEsignetLoginWithOtpButton();
		esignetLoginPage.clickOnLoginWithOtpButton();
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(AddNewCardPage.SVGWithOutFaceUIN);
		esignetLoginPage.clickOnHideKeyboardAndGetOtpButton();
		otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtp(), PlatformType.ANDROID);
		esignetLoginPage.clickOnVerifyButton();
		addNewCardPage.clickOnDoneButton();
		assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
		DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();
		assertTrue(detailedVcViewPage.isDetailedVcViewPageLoaded(), "Verify if detailed Vc view page is displayed");

	}

	@Test
	public void downloadAndVerifyFarmerSVGVcWithFaceUsingInvalidCredential() throws InterruptedException {
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
		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaLandSVGWithFace();
		esignetLoginPage.clickOnEsignetLoginWithOtpButton();
		esignetLoginPage.clickOnLoginWithOtpButton();
		OtpVerificationPage otpVerification = esignetLoginPage
				.setEnterIdTextBox(TestDataReader.readData("invaliduin"));
		esignetLoginPage.clickOnHideKeyboardAndGetOtpButton();
		assertEquals(
			    ResourceBundleLoader.get(InjiWalletConstants.invalid_individual_id),
			    otpVerification.getInvalidIndividualErrorMessageForEsignet()
			);
	}

	@Test
	public void downloadAndVerifyFarmerSVGVcWithOutFaceUsingInvalidCredential() throws InterruptedException {
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
		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaLandSVGWithOutFace();
		esignetLoginPage.clickOnEsignetLoginWithOtpButton();
		esignetLoginPage.clickOnLoginWithOtpButton();
		OtpVerificationPage otpVerification = esignetLoginPage
				.setEnterIdTextBox(TestDataReader.readData("invaliduin"));
		esignetLoginPage.clickOnHideKeyboardAndGetOtpButton();
		assertEquals(
			    ResourceBundleLoader.get(InjiWalletConstants.invalid_individual_id),
			    otpVerification.getInvalidIndividualErrorMessageForEsignet()
			);
	}

	@Test
	public void downloadAndVerifyFarmerSVGVcWithFaceUsingInvalidOtp() throws InterruptedException {
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
		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaLandSVGWithFace();
		esignetLoginPage.clickOnEsignetLoginWithOtpButton();
		esignetLoginPage.clickOnLoginWithOtpButton();
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(AddNewCardPage.SVGWithFaceUIN);
		esignetLoginPage.clickOnHideKeyboardAndGetOtpButton();
		otpVerification.enterOtpForeSignet(TestDataReader.readData("invalidOtp"), PlatformType.ANDROID);
		esignetLoginPage.clickOnVerifyButton();
		assertEquals(ResourceBundleLoader.get(InjiWalletConstants.auth_failed), otpVerification.getInvalidOtpMessageForEsignetFarmer());

	}

	@Test
	public void downloadAndVerifyFarmerSVGVcWithOutFaceUsingInvalidOtp() throws InterruptedException {
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
		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaLandSVGWithOutFace();
		esignetLoginPage.clickOnEsignetLoginWithOtpButton();
		esignetLoginPage.clickOnLoginWithOtpButton();
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(AddNewCardPage.SVGWithOutFaceUIN);
		esignetLoginPage.clickOnHideKeyboardAndGetOtpButton();
		otpVerification.enterOtpForeSignet(TestDataReader.readData("invalidOtp"), PlatformType.ANDROID);
		esignetLoginPage.clickOnVerifyButton();
		assertEquals(ResourceBundleLoader.get(InjiWalletConstants.auth_failed), otpVerification.getInvalidOtpMessageForEsignetFarmer());

	}

	@Test
	public void downloadAndVerifyFarmerSVGVcWithFaceAndPinAndUnpin() throws InterruptedException {
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
		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaLandSVGWithFace();
		esignetLoginPage.clickOnEsignetLoginWithOtpButton();
		esignetLoginPage.clickOnLoginWithOtpButton();
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(AddNewCardPage.SVGWithFaceUIN);
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
	public void downloadAndVerifyFarmerSVGVcWithOutFaceAndPinAndUnpin() throws InterruptedException {
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
		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaLandSVGWithOutFace();
		esignetLoginPage.clickOnEsignetLoginWithOtpButton();
		esignetLoginPage.clickOnLoginWithOtpButton();
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(AddNewCardPage.SVGWithOutFaceUIN);
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
	public void downloadAndVerifyFarmerSVGVcWithFaceMultipleTime() throws InterruptedException {
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
		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaLandSVGWithFace();
		esignetLoginPage.clickOnEsignetLoginWithOtpButton();
		esignetLoginPage.clickOnLoginWithOtpButton();
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(AddNewCardPage.SVGWithFaceUIN);
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
		ESignetLoginPage esignetLoginPageAgain = addNewCardPageAgain.clickOnDownloadViaLandSVGWithFace();
		esignetLoginPageAgain.clickOnEsignetLoginWithOtpButton();
		esignetLoginPageAgain.clickOnLoginWithOtpButton();
		OtpVerificationPage otpVerificationAgain = esignetLoginPageAgain.setEnterIdTextBox(AddNewCardPage.SVGWithFaceUIN);
		esignetLoginPageAgain.clickOnHideKeyboardAndGetOtpButton();
		otpVerificationAgain.enterOtpForeSignet(InjiWalletUtil.getOtp(), PlatformType.ANDROID);
		esignetLoginPageAgain.clickOnVerifyButton();
	}

	@Test
	public void downloadAndVerifyFarmerSVGVcWithOutFaceMultipleTime() throws InterruptedException {
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
		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaLandSVGWithOutFace();
		esignetLoginPage.clickOnEsignetLoginWithOtpButton();
		esignetLoginPage.clickOnLoginWithOtpButton();
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(AddNewCardPage.SVGWithOutFaceUIN);
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
		ESignetLoginPage esignetLoginPageAgain = addNewCardPageAgain.clickOnDownloadViaLandSVGWithOutFace();
		esignetLoginPageAgain.clickOnEsignetLoginWithOtpButton();
		esignetLoginPageAgain.clickOnLoginWithOtpButton();
		OtpVerificationPage otpVerificationAgain = esignetLoginPageAgain.setEnterIdTextBox(AddNewCardPage.SVGWithOutFaceUIN);
		esignetLoginPageAgain.clickOnHideKeyboardAndGetOtpButton();
		otpVerificationAgain.enterOtpForeSignet(InjiWalletUtil.getOtp(), PlatformType.ANDROID);
		esignetLoginPageAgain.clickOnVerifyButton();
	}

}