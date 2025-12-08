package inji.testcases.iosTestCases;

import inji.annotations.NeedsUIN;
import inji.annotations.NeedsVID;
import inji.constants.InjiWalletConstants;
import inji.constants.PlatformType;
import inji.pages.*;
import inji.testcases.BaseTest.IosBaseTest;
import inji.utils.InjiWalletUtil;
import inji.utils.TestDataReader;
import org.testng.annotations.Test;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;
import inji.utils.ResourceBundleLoader;

public class VcDownloadAndVerifyUsingSVG extends IosBaseTest {
	
	@Test
	public void downloadAndVerifyFarmerSVGVcWithFace() throws InterruptedException {
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
		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaLandSVGWithFace();
		addNewCardPage.clickOnContinueButtonInSigninPopupIos();
		esignetLoginPage.clickOnLoginWithOtpButton();
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(AddNewCardPage.SVGWithFaceUIN);
		esignetLoginPage.clickOnGetOtpButton();
		otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtp(), PlatformType.IOS);
		esignetLoginPage.clickOnVerifyButtonIos();
		addNewCardPage.clickOnDoneButton();
		assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
		DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();

	}

	@Test
	public void downloadAndVerifyFarmerSVGVcWithoutFace() throws InterruptedException {
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
		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaLandSVGWithOutFace();
		addNewCardPage.clickOnContinueButtonInSigninPopupIos();
		esignetLoginPage.clickOnLoginWithOtpButton();
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(AddNewCardPage.SVGWithOutFaceUIN);
		esignetLoginPage.clickOnGetOtpButton();
		otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtp(), PlatformType.IOS);
		esignetLoginPage.clickOnVerifyButtonIos();
		addNewCardPage.clickOnDoneButton();
		assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
		DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();

	}

	@Test
	public void downloadAndVerifyFarmerSVGVcWithFaceUsingInvalidCredential() throws InterruptedException {
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
		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaLandSVGWithFace();
		addNewCardPage.clickOnContinueButtonInSigninPopupIos();
		esignetLoginPage.clickOnLoginWithOtpButton();
		OtpVerificationPage otpVerification = esignetLoginPage
				.setEnterIdTextBox(TestDataReader.readData("invaliduin"));
		esignetLoginPage.clickOnGetOtpButton();
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
				PlatformType.IOS);
		HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"),
				PlatformType.IOS);
		homePage.clickOnNextButtonForInjiTour();
		AddNewCardPage addNewCardPage = homePage.downloadCard();
		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaLandSVGWithOutFace();
		addNewCardPage.clickOnContinueButtonInSigninPopupIos();
		esignetLoginPage.clickOnLoginWithOtpButton();
		OtpVerificationPage otpVerification = esignetLoginPage
				.setEnterIdTextBox(TestDataReader.readData("invaliduin"));
		esignetLoginPage.clickOnGetOtpButton();
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
				PlatformType.IOS);
		HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"),
				PlatformType.IOS);
		homePage.clickOnNextButtonForInjiTour();
		AddNewCardPage addNewCardPage = homePage.downloadCard();
		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaLandSVGWithFace();
		addNewCardPage.clickOnContinueButtonInSigninPopupIos();
		esignetLoginPage.clickOnLoginWithOtpButton();
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(AddNewCardPage.SVGWithFaceUIN);
		esignetLoginPage.clickOnGetOtpButton();
		otpVerification.enterOtpForeSignet(TestDataReader.readData("invalidOtp"), PlatformType.IOS);
		esignetLoginPage.clickOnVerifyButtonIos();
		assertEquals(ResourceBundleLoader.get(InjiWalletConstants.auth_failed), otpVerification.getInvalidOtpMessageForEsignetFarmer());

	}

	@Test
	public void downloadAndVerifyFarmerSVGVcWithOutFaceUsingInvalidOtp() throws InterruptedException {
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
		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaLandSVGWithOutFace();
		addNewCardPage.clickOnContinueButtonInSigninPopupIos();
		esignetLoginPage.clickOnLoginWithOtpButton();
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(AddNewCardPage.SVGWithOutFaceUIN);
		esignetLoginPage.clickOnGetOtpButton();
		otpVerification.enterOtpForeSignet(TestDataReader.readData("invalidOtp"), PlatformType.IOS);
		esignetLoginPage.clickOnVerifyButtonIos();
		assertEquals(ResourceBundleLoader.get(InjiWalletConstants.auth_failed), otpVerification.getInvalidOtpMessageForEsignetFarmer());

	}

	@Test
	public void downloadAndVerifyFarmerSVGVcWithFaceAndPinAndUnpin() throws InterruptedException {
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
		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaLandSVGWithFace();
		addNewCardPage.clickOnContinueButtonInSigninPopupIos();
		esignetLoginPage.clickOnLoginWithOtpButton();
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(AddNewCardPage.SVGWithFaceUIN);
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
	public void downloadAndVerifyFarmerSVGVcWithOutFaceAndPinAndUnpin() throws InterruptedException {
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
		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaLandSVGWithOutFace();
		addNewCardPage.clickOnContinueButtonInSigninPopupIos();
		esignetLoginPage.clickOnLoginWithOtpButton();
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(AddNewCardPage.SVGWithOutFaceUIN);
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
	public void downloadAndVerifyFarmerSVGVcWithFaceMultipleTime() throws InterruptedException {
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
		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaLandSVGWithFace();
		addNewCardPage.clickOnContinueButtonInSigninPopupIos();
		esignetLoginPage.clickOnLoginWithOtpButton();
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(AddNewCardPage.SVGWithFaceUIN);
		esignetLoginPage.clickOnGetOtpButton();
		otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtp(), PlatformType.IOS);
		esignetLoginPage.clickOnVerifyButtonIos();
		addNewCardPage.clickOnDoneButton();
		assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
		AddNewCardPage addNewCardPageAgain = homePage.downloadCard();
		ESignetLoginPage esignetLoginPageAgain = addNewCardPageAgain.clickOnDownloadViaLandSVGWithFace();
		addNewCardPageAgain.clickOnContinueButtonInSigninPopupIos();
		esignetLoginPageAgain.clickOnLoginWithOtpButton();
		OtpVerificationPage otpVerificationAgain = esignetLoginPageAgain.setEnterIdTextBox(AddNewCardPage.SVGWithFaceUIN);
		esignetLoginPageAgain.clickOnGetOtpButton();
		otpVerificationAgain.enterOtpForeSignet(InjiWalletUtil.getOtp(), PlatformType.IOS);
		esignetLoginPageAgain.clickOnVerifyButtonIos();
		assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
	}

	@Test
	public void downloadAndVerifyFarmerSVGVcWithOutFaceMultipleTime() throws InterruptedException {
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
		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaLandSVGWithOutFace();
		addNewCardPage.clickOnContinueButtonInSigninPopupIos();
		esignetLoginPage.clickOnLoginWithOtpButton();
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(AddNewCardPage.SVGWithOutFaceUIN);
		esignetLoginPage.clickOnGetOtpButton();
		otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtp(), PlatformType.IOS);
		esignetLoginPage.clickOnVerifyButtonIos();
		addNewCardPage.clickOnDoneButton();
		assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
		AddNewCardPage addNewCardPageAgain = homePage.downloadCard();
		ESignetLoginPage esignetLoginPageAgain = addNewCardPageAgain.clickOnDownloadViaLandSVGWithOutFace();
		addNewCardPageAgain.clickOnContinueButtonInSigninPopupIos();
		esignetLoginPageAgain.clickOnLoginWithOtpButton();
		OtpVerificationPage otpVerificationAgain = esignetLoginPageAgain.setEnterIdTextBox(AddNewCardPage.SVGWithOutFaceUIN);
		esignetLoginPageAgain.clickOnGetOtpButton();
		otpVerificationAgain.enterOtpForeSignet(InjiWalletUtil.getOtp(), PlatformType.IOS);
		esignetLoginPageAgain.clickOnVerifyButtonIos();
		assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
	}
}
