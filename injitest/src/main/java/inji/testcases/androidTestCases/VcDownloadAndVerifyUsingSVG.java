package inji.testcases.androidTestCases;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertTrue;
import org.testng.annotations.Test;
import org.testng.asserts.SoftAssert;
import inji.annotations.NeedsSunbirdPolicy;
import inji.annotations.NeedsUIN;
import inji.constants.PlatformType;
import inji.pages.AddNewCardPage;
import inji.pages.AppUnlockMethodPage;
import inji.pages.ChooseLanguagePage;
import inji.pages.ConfirmPasscode;
import inji.pages.DetailedVcViewPage;
import inji.pages.ESignetLoginPage;
import inji.pages.HistoryPage;
import inji.pages.HomePage;
import inji.pages.MoreOptionsPage;
import inji.pages.OtpVerificationPage;
import inji.pages.PleaseConfirmPopupPage;
import inji.pages.RetrieveIdPage;
import inji.pages.SetPasscode;
import inji.pages.SettingsPage;
import inji.pages.SunbirdLoginPage;
import inji.pages.UnlockApplicationPage;
import inji.pages.WelcomePage;
import inji.testcases.BaseTest.AndroidBaseTest;
import inji.utils.AndroidUtil;
import inji.utils.InjiWalletUtil;
import inji.utils.IosUtil;
import inji.utils.TestDataReader;

public class VcDownloadAndVerifyUsingSVG extends AndroidBaseTest {
	@Test
	@NeedsUIN
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
//		OtpVerificationPage otpVerification = esignetLoginPage
//				.setEnterIdTextBox(TestDataReader.readData("SVGWithFace"));
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
	@NeedsUIN
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
//		OtpVerificationPage otpVerification = esignetLoginPage
//				.setEnterIdTextBox(TestDataReader.readData("SVGWithOutFace"));
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
	@NeedsUIN
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
		assertTrue(esignetLoginPage.isESignetLogoDisplayed(), "Verify if esignet logo is displayed");
		OtpVerificationPage otpVerification = esignetLoginPage
				.setEnterIdTextBox(TestDataReader.readData("InvalidLandRegistry"));
		esignetLoginPage.clickOnHideKeyboardAndGetOtpButton();
		assertTrue(otpVerification.isInvalidErrorMessageDisplayed(), "Verify if invalid individual id error displayed");
	}

	@Test
	@NeedsUIN
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
		assertTrue(esignetLoginPage.isESignetLogoDisplayed(), "Verify if esignet logo is displayed");
		OtpVerificationPage otpVerification = esignetLoginPage
				.setEnterIdTextBox(TestDataReader.readData("InvalidLandRegistry"));
		esignetLoginPage.clickOnHideKeyboardAndGetOtpButton();
		assertTrue(otpVerification.isInvalidErrorMessageDisplayed(), "Verify if invalid individual id error displayed");
	}

	@Test
	@NeedsUIN
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
		assertTrue(esignetLoginPage.isESignetLogoDisplayed(), "Verify if esignet logo is displayed");
//		OtpVerificationPage otpVerification = esignetLoginPage
//				.setEnterIdTextBox(TestDataReader.readData("SVGWithFace"));
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(AddNewCardPage.SVGWithFaceUIN);
		esignetLoginPage.clickOnHideKeyboardAndGetOtpButton();
		otpVerification.enterOtpForeSignet(TestDataReader.readData("invalidOtp"), PlatformType.ANDROID);
		esignetLoginPage.clickOnVerifyButton();
		assertTrue(otpVerification.isInvalidErrorMessageDisplayed(), "Verify if invalid OTP error displayed");
	}

	@Test
	@NeedsUIN
	public void downloadAndVerifyFarmerSVGVcWithOutFacUsingInvalidOtp() throws InterruptedException {
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
		assertTrue(esignetLoginPage.isESignetLogoDisplayed(), "Verify if esignet logo is displayed");
//		OtpVerificationPage otpVerification = esignetLoginPage
//				.setEnterIdTextBox(TestDataReader.readData("SVGWithOutFace"));
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(AddNewCardPage.SVGWithOutFaceUIN);
		esignetLoginPage.clickOnHideKeyboardAndGetOtpButton();
		otpVerification.enterOtpForeSignet(TestDataReader.readData("invalidOtp"), PlatformType.ANDROID);
		esignetLoginPage.clickOnVerifyButton();
		assertTrue(otpVerification.isInvalidErrorMessageDisplayed(), "Verify if invalid OTP error displayed");
	}

	@Test
	@NeedsUIN
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
		assertTrue(esignetLoginPage.isESignetLogoDisplayed(), "Verify if esignet logo is displayed");
//		OtpVerificationPage otpVerification = esignetLoginPage
//				.setEnterIdTextBox(TestDataReader.readData("SVGWithFace"));
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
	@NeedsUIN
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
		assertTrue(esignetLoginPage.isESignetLogoDisplayed(), "Verify if esignet logo is displayed");
//		OtpVerificationPage otpVerification = esignetLoginPage
//				.setEnterIdTextBox(TestDataReader.readData("SVGWithOutFace"));
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
	@NeedsUIN
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
		assertTrue(esignetLoginPage.isESignetLogoDisplayed(), "Verify if esignet logo is displayed");
//		OtpVerificationPage otpVerification = esignetLoginPage
//				.setEnterIdTextBox(TestDataReader.readData("SVGWithFace"));
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
		ESignetLoginPage esignetLoginPageAgain = addNewCardPageAgain.clickOnDownloadViaLandSdJwt();
		esignetLoginPageAgain.clickOnEsignetLoginWithOtpButton();
		esignetLoginPageAgain.clickOnLoginWithOtpButton();
//		OtpVerificationPage otpVerificationAgain = esignetLoginPage
//				.setEnterIdTextBox(TestDataReader.readData("SVGWithFace"));		
		OtpVerificationPage otpVerificationAgain = esignetLoginPage.setEnterIdTextBox(AddNewCardPage.SVGWithFaceUIN);
		esignetLoginPageAgain.clickOnHideKeyboardAndGetOtpButton();
		otpVerificationAgain.enterOtpForeSignet(InjiWalletUtil.getOtp(), PlatformType.ANDROID);
		esignetLoginPageAgain.clickOnVerifyButton();
	}

	@Test
	@NeedsUIN
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
		assertTrue(esignetLoginPage.isESignetLogoDisplayed(), "Verify if esignet logo is displayed");
//		OtpVerificationPage otpVerification = esignetLoginPage
//				.setEnterIdTextBox(TestDataReader.readData("SVGWithOutFace"));
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
//		OtpVerificationPage otpVerificationAgain = esignetLoginPage
//				.setEnterIdTextBox(TestDataReader.readData("SVGWithOutFace"));
		OtpVerificationPage otpVerificationAgain = esignetLoginPage.setEnterIdTextBox(AddNewCardPage.SVGWithOutFaceUIN);
		esignetLoginPageAgain.clickOnHideKeyboardAndGetOtpButton();
		otpVerificationAgain.enterOtpForeSignet(InjiWalletUtil.getOtp(), PlatformType.ANDROID);
		esignetLoginPageAgain.clickOnVerifyButton();
	}

}