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

public class VcDownloadAndVerifyUsingSVG extends IosBaseTest {
	@Test
	@NeedsUIN
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
//		OtpVerificationPage otpVerification = esignetLoginPage
//				.setEnterIdTextBox(TestDataReader.readData("SVGWithFace"));
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(AddNewCardPage.SVGWithFaceUIN);
		esignetLoginPage.clickOnGetOtpButton();
		otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtp(), PlatformType.IOS);
		esignetLoginPage.clickOnVerifyButtonIos();
		addNewCardPage.clickOnDoneButton();
		assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
		DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();

	}

	@Test
	@NeedsUIN
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
//		OtpVerificationPage otpVerification = esignetLoginPage
//				.setEnterIdTextBox(TestDataReader.readData("SVGWithOutFace"));
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(AddNewCardPage.SVGWithOutFaceUIN);
		esignetLoginPage.clickOnGetOtpButton();
		otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtp(), PlatformType.IOS);
		esignetLoginPage.clickOnVerifyButtonIos();
		addNewCardPage.clickOnDoneButton();
		assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
		DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();

	}

	@Test
	@NeedsUIN
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
				.setEnterIdTextBox(TestDataReader.readData("InvalidLandRegistry"));
		esignetLoginPage.clickOnGetOtpButton();
		assertTrue(otpVerification.isInvalidIndividualErrorMessageDisplayed(),
				"Verify if invalid individual id error displayed");
	}

	@Test
	@NeedsUIN
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
				.setEnterIdTextBox(TestDataReader.readData("InvalidLandRegistry"));
		esignetLoginPage.clickOnGetOtpButton();
		assertTrue(otpVerification.isInvalidIndividualErrorMessageDisplayed(),
				"Verify if invalid individual id error displayed");
	}

	@Test
	@NeedsUIN
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
//		OtpVerificationPage otpVerification = esignetLoginPage
//				.setEnterIdTextBox(TestDataReader.readData("SVGWithFace"));
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(AddNewCardPage.SVGWithFaceUIN);
		esignetLoginPage.clickOnGetOtpButton();
		otpVerification.enterOtpForeSignet(TestDataReader.readData("invalidOtp"), PlatformType.IOS);
		esignetLoginPage.clickOnVerifyButtonIos();
		assertTrue(otpVerification.isInvalidOTPErrorMessageDisplayed(), "Verify if invalid OTP error displayed");
	}

	@Test
	@NeedsUIN
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
//		OtpVerificationPage otpVerification = esignetLoginPage
//				.setEnterIdTextBox(TestDataReader.readData("SVGWithOutFace"));
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(AddNewCardPage.SVGWithOutFaceUIN);
		esignetLoginPage.clickOnGetOtpButton();
		otpVerification.enterOtpForeSignet(TestDataReader.readData("invalidOtp"), PlatformType.IOS);
		esignetLoginPage.clickOnVerifyButtonIos();
		assertTrue(otpVerification.isInvalidOTPErrorMessageDisplayed(), "Verify if invalid OTP error displayed");
	}

	@Test
	@NeedsUIN
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
//		OtpVerificationPage otpVerification = esignetLoginPage
//				.setEnterIdTextBox(TestDataReader.readData("SVGWithFace"));
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
	@NeedsUIN
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
//		OtpVerificationPage otpVerification = esignetLoginPage
//				.setEnterIdTextBox(TestDataReader.readData("SVGWithOutFace"));
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
	@NeedsUIN
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
//		OtpVerificationPage otpVerification = esignetLoginPage
//				.setEnterIdTextBox(TestDataReader.readData("SVGWithFace"));
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
//		OtpVerificationPage otpVerificationAgain = esignetLoginPageAgain
//				.setEnterIdTextBox(TestDataReader.readData("SVGWithFace"));		
		OtpVerificationPage otpVerificationAgain = esignetLoginPageAgain.setEnterIdTextBox(AddNewCardPage.SVGWithFaceUIN);
		esignetLoginPageAgain.clickOnGetOtpButton();
		otpVerificationAgain.enterOtpForeSignet(InjiWalletUtil.getOtp(), PlatformType.IOS);
		esignetLoginPageAgain.clickOnVerifyButtonIos();
		assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
	}

	@Test
	@NeedsUIN
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
//		OtpVerificationPage otpVerification = esignetLoginPage
//				.setEnterIdTextBox(TestDataReader.readData("SVGWithOutFace"));
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
//		OtpVerificationPage otpVerificationAgain = esignetLoginPageAgain
//				.setEnterIdTextBox(TestDataReader.readData("SVGWithOutFace"));
		OtpVerificationPage otpVerificationAgain = esignetLoginPageAgain.setEnterIdTextBox(AddNewCardPage.SVGWithOutFaceUIN);
		esignetLoginPageAgain.clickOnGetOtpButton();
		otpVerificationAgain.enterOtpForeSignet(InjiWalletUtil.getOtp(), PlatformType.IOS);
		esignetLoginPageAgain.clickOnVerifyButtonIos();
		assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
	}
}
