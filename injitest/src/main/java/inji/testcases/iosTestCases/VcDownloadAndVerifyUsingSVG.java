package inji.testcases.iosTestCases;

import inji.annotations.NeedsSvgWithFaceUIN;
import inji.annotations.NeedsSvgWithOutFaceUIN;
import inji.constants.InjiWalletConstants;
import inji.constants.PlatformType;
import inji.pages.*;
import inji.testcases.BaseTest.IosBaseTest;
import inji.utils.InjiWalletUtil;
import inji.utils.ResourceBundleLoader;
import inji.utils.TestDataReader;
import org.testng.annotations.Test;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;


public class VcDownloadAndVerifyUsingSVG extends IosBaseTest {

	@Test
	@NeedsSvgWithFaceUIN
	public void downloadAndVerifyFarmerSVGVcWithFace() {
		ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
		WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
		AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
		SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
		ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.IOS);
		HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.IOS);
		homePage.clickOnNextButtonForInjiTour();
		AddNewCardPage addNewCardPage = homePage.downloadCard();
		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaLandSVGWithFace();
		addNewCardPage.clickOnContinueButtonInSigninPopupIos();
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getsvgWithFaceUIN());
		esignetLoginPage.clickOnGetOtpButton();
		otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtpForMock(), PlatformType.IOS);
		esignetLoginPage.clickOnVerifyButtonIos();
		addNewCardPage.clickOnDoneButton();
		assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
		DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();
    assertTrue(detailedVcViewPage.isDetailedVcViewPageLoaded(), "Verify if detailed Vc view page is displayed");
  }

	@Test
	@NeedsSvgWithOutFaceUIN
	public void downloadAndVerifyFarmerSVGVcWithoutFace() {
		ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
		WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
		AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
		SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
		ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.IOS);
		HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.IOS);
		homePage.clickOnNextButtonForInjiTour();
		AddNewCardPage addNewCardPage = homePage.downloadCard();
		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaLandSVGWithOutFace();
		addNewCardPage.clickOnContinueButtonInSigninPopupIos();
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getsvgWithOutFacedUIN());
		esignetLoginPage.clickOnGetOtpButton();
		otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtpForMock(), PlatformType.IOS);
		esignetLoginPage.clickOnVerifyButtonIos();
		addNewCardPage.clickOnDoneButton();
		assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
		DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();
    assertTrue(detailedVcViewPage.isDetailedVcViewPageLoaded(), "Verify if detailed Vc view page is displayed");

  }

	@Test
	public void downloadAndVerifyFarmerSVGVcWithFaceUsingInvalidCredential() {
		ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
		WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
		AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
		SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
		ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.IOS);
		HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.IOS);
		homePage.clickOnNextButtonForInjiTour();
		AddNewCardPage addNewCardPage = homePage.downloadCard();
		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaLandSVGWithFace();
		addNewCardPage.clickOnContinueButtonInSigninPopupIos();
		OtpVerificationPage otpVerification = esignetLoginPage
				.setEnterIdTextBox(TestDataReader.readData("invaliduin"));
		esignetLoginPage.clickOnGetOtpButton();
		assertEquals(
			    ResourceBundleLoader.get(InjiWalletConstants.invalid_individual_id),
			    otpVerification.getInvalidIndividualErrorMessageForEsignet()
			);
	}

	@Test
	public void downloadAndVerifyFarmerSVGVcWithOutFaceUsingInvalidCredential() {
		ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
		WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
		AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
		SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
		ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.IOS);
		HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.IOS);
		homePage.clickOnNextButtonForInjiTour();
		AddNewCardPage addNewCardPage = homePage.downloadCard();
		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaLandSVGWithOutFace();
		addNewCardPage.clickOnContinueButtonInSigninPopupIos();
		OtpVerificationPage otpVerification = esignetLoginPage
				.setEnterIdTextBox(TestDataReader.readData("invaliduin"));
		esignetLoginPage.clickOnGetOtpButton();
		assertEquals(
			    ResourceBundleLoader.get(InjiWalletConstants.invalid_individual_id),
			    otpVerification.getInvalidIndividualErrorMessageForEsignet()
			);
	}

	@Test
	@NeedsSvgWithFaceUIN
	public void downloadAndVerifyFarmerSVGVcWithFaceUsingInvalidOtp() {
		ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
		WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
		AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
		SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
		ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.IOS);
		HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.IOS);
		homePage.clickOnNextButtonForInjiTour();
		AddNewCardPage addNewCardPage = homePage.downloadCard();
		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaLandSVGWithFace();
		addNewCardPage.clickOnContinueButtonInSigninPopupIos();
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getsvgWithFaceUIN());
		esignetLoginPage.clickOnGetOtpButton();
		otpVerification.enterOtpForeSignet(TestDataReader.readData("invalidOtp"), PlatformType.IOS);
		esignetLoginPage.clickOnVerifyButtonIos();
		assertEquals(ResourceBundleLoader.get(InjiWalletConstants.auth_failed), otpVerification.getInvalidOtpMessageForEsignetFarmer());

	}

	@Test
	@NeedsSvgWithOutFaceUIN
	public void downloadAndVerifyFarmerSVGVcWithOutFaceUsingInvalidOtp() {
		ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
		WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
		AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
		SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
		ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.IOS);
		HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.IOS);
		homePage.clickOnNextButtonForInjiTour();
		AddNewCardPage addNewCardPage = homePage.downloadCard();
		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaLandSVGWithOutFace();
		addNewCardPage.clickOnContinueButtonInSigninPopupIos();
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getsvgWithOutFacedUIN());
		esignetLoginPage.clickOnGetOtpButton();
		otpVerification.enterOtpForeSignet(TestDataReader.readData("invalidOtp"), PlatformType.IOS);
		esignetLoginPage.clickOnVerifyButtonIos();
		assertEquals(ResourceBundleLoader.get(InjiWalletConstants.auth_failed), otpVerification.getInvalidOtpMessageForEsignetFarmer());

	}

	@Test
	@NeedsSvgWithFaceUIN
	public void downloadAndVerifyFarmerSVGVcWithFaceAndPinAndUnpin() throws InterruptedException {
		ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
		WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
		AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
		SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
		ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.IOS);
		HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.IOS);
		homePage.clickOnNextButtonForInjiTour();
		AddNewCardPage addNewCardPage = homePage.downloadCard();
		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaLandSVGWithFace();
		addNewCardPage.clickOnContinueButtonInSigninPopupIos();
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getsvgWithFaceUIN());
		esignetLoginPage.clickOnGetOtpButton();
		otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtpForMock(), PlatformType.IOS);
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
	@NeedsSvgWithOutFaceUIN
	public void downloadAndVerifyFarmerSVGVcWithOutFaceAndPinAndUnpin() throws InterruptedException {
		ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
		WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
		AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
		SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
		ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.IOS);
		HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.IOS);
		homePage.clickOnNextButtonForInjiTour();
		AddNewCardPage addNewCardPage = homePage.downloadCard();
		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaLandSVGWithOutFace();
		addNewCardPage.clickOnContinueButtonInSigninPopupIos();
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getsvgWithOutFacedUIN());
		esignetLoginPage.clickOnGetOtpButton();
		otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtpForMock(), PlatformType.IOS);
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
	@NeedsSvgWithFaceUIN
	public void downloadAndVerifyFarmerSVGVcWithFaceMultipleTime() {
		ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
		WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
		AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
		SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
		ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.IOS);
		HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.IOS);
		homePage.clickOnNextButtonForInjiTour();
		AddNewCardPage addNewCardPage = homePage.downloadCard();
		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaLandSVGWithFace();
		addNewCardPage.clickOnContinueButtonInSigninPopupIos();
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getsvgWithFaceUIN());
		esignetLoginPage.clickOnGetOtpButton();
		otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtpForMock(), PlatformType.IOS);
		esignetLoginPage.clickOnVerifyButtonIos();
		addNewCardPage.clickOnDoneButton();
		assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
		AddNewCardPage addNewCardPageAgain = homePage.downloadCard();
		ESignetLoginPage esignetLoginPageAgain = addNewCardPageAgain.clickOnDownloadViaLandSVGWithFace();
		addNewCardPageAgain.clickOnContinueButtonInSigninPopupIos();
		OtpVerificationPage otpVerificationAgain = esignetLoginPageAgain.setEnterIdTextBox(getsvgWithFaceUIN());
		esignetLoginPageAgain.clickOnGetOtpButton();
		otpVerificationAgain.enterOtpForeSignet(InjiWalletUtil.getOtpForMock(), PlatformType.IOS);
		esignetLoginPageAgain.clickOnVerifyButtonIos();
		assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
	}

	@Test
	@NeedsSvgWithOutFaceUIN
	public void downloadAndVerifyFarmerSVGVcWithOutFaceMultipleTime() {
		ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
		WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
		AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
		SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
		ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.IOS);
		HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.IOS);
		homePage.clickOnNextButtonForInjiTour();
		AddNewCardPage addNewCardPage = homePage.downloadCard();
		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaLandSVGWithOutFace();
		addNewCardPage.clickOnContinueButtonInSigninPopupIos();
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getsvgWithOutFacedUIN());
		esignetLoginPage.clickOnGetOtpButton();
		otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtpForMock(), PlatformType.IOS);
		esignetLoginPage.clickOnVerifyButtonIos();
		addNewCardPage.clickOnDoneButton();
		assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
		AddNewCardPage addNewCardPageAgain = homePage.downloadCard();
		ESignetLoginPage esignetLoginPageAgain = addNewCardPageAgain.clickOnDownloadViaLandSVGWithOutFace();
		addNewCardPageAgain.clickOnContinueButtonInSigninPopupIos();
		OtpVerificationPage otpVerificationAgain = esignetLoginPageAgain.setEnterIdTextBox(getsvgWithOutFacedUIN());
		esignetLoginPageAgain.clickOnGetOtpButton();
		otpVerificationAgain.enterOtpForeSignet(InjiWalletUtil.getOtpForMock(), PlatformType.IOS);
		esignetLoginPageAgain.clickOnVerifyButtonIos();
		assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
	}
}
