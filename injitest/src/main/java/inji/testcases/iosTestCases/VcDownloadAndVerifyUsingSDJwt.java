package inji.testcases.iosTestCases;

import inji.annotations.NeedsLandUIN;
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

public class VcDownloadAndVerifyUsingSDJwt extends IosBaseTest {

	@Test
	@NeedsLandUIN
	public void downloadAndVerifySdJwtVc() {
		ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
		WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
		AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
		SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
    ConfirmPasscode confirmPasscode =
        setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);
    HomePage homePage =
        confirmPasscode.enterPasscodeInConfirmPasscodePage(
            TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);
		homePage.clickOnNextButtonForInjiTour();
		AddNewCardPage addNewCardPage = homePage.downloadCard();
    ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaMockSdJwt();
		addNewCardPage.clickOnContinueButtonInSigninPopupIos();
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getLandUIN());
		esignetLoginPage.clickOnGetOtpButton();
		otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtpForMock(), PlatformType.IOS);
		esignetLoginPage.clickOnVerifyButtonIos();
		addNewCardPage.clickOnDoneButton();
    assertTrue(
        homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
		DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();
		homePage.clickOnCrossIconButton();
    assertTrue(
        detailedVcViewPage.isDetailedVcViewPageLoaded(),
        "Verify if detailed Vc view page is displayed");
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
	public void downloadAndVerifySdJwtVcUsingInvalidCredential() {
		ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
		WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
		AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
		SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
    ConfirmPasscode confirmPasscode =
        setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);
    HomePage homePage =
        confirmPasscode.enterPasscodeInConfirmPasscodePage(
            TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);
		homePage.clickOnNextButtonForInjiTour();
		AddNewCardPage addNewCardPage = homePage.downloadCard();
    ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaMockSdJwt();
		addNewCardPage.clickOnContinueButtonInSigninPopupIos();
    OtpVerificationPage otpVerification =
        esignetLoginPage.setEnterIdTextBox(TestDataReader.readData("invaliduin"));
		esignetLoginPage.clickOnGetOtpButton();
		assertEquals(ResourceBundleLoader.get(InjiWalletConstants.invalid_individual_id),
				otpVerification.getInvalidIndividualErrorMessageForEsignet());
	}

	@Test
	@NeedsLandUIN
	public void downloadAndVerifySdJwtVcUsingInvalidOtp() {
		ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
		WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
		AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
		SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
    ConfirmPasscode confirmPasscode =
        setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);
    HomePage homePage =
        confirmPasscode.enterPasscodeInConfirmPasscodePage(
            TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);
		homePage.clickOnNextButtonForInjiTour();
		AddNewCardPage addNewCardPage = homePage.downloadCard();
    ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaMockSdJwt();
		addNewCardPage.clickOnContinueButtonInSigninPopupIos();
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getLandUIN());
		esignetLoginPage.clickOnGetOtpButton();
    otpVerification.enterOtpForeSignet(TestDataReader.readData("invalidOtp"), PlatformType.IOS);
		esignetLoginPage.clickOnVerifyButtonIos();
		assertEquals(ResourceBundleLoader.get(InjiWalletConstants.auth_failed),
				otpVerification.getInvalidOtpMessageForEsignetFarmer());

	}

	@Test
	@NeedsLandUIN
	public void downloadAndVerifySdJwtVcAndPinAndUnpin() throws InterruptedException {
		ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
		WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
		AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
		SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
    ConfirmPasscode confirmPasscode =
        setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);
    HomePage homePage =
        confirmPasscode.enterPasscodeInConfirmPasscodePage(
            TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);
		homePage.clickOnNextButtonForInjiTour();
		AddNewCardPage addNewCardPage = homePage.downloadCard();
    ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaMockSdJwt();
		addNewCardPage.clickOnContinueButtonInSigninPopupIos();
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getLandUIN());
		esignetLoginPage.clickOnGetOtpButton();
		otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtpForMock(), PlatformType.IOS);
		esignetLoginPage.clickOnVerifyButtonIos();
		addNewCardPage.clickOnDoneButton();
    assertTrue(
        homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
		MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();
		moreOptionsPage.clickOnPinOrUnPinCard();
		assertTrue(homePage.isPinIconDisplayed(), "Verify if pin icon on vc is displayed");
		homePage.clickOnMoreOptionsButton();
    assertTrue(
        moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");
		moreOptionsPage.clickOnPinOrUnPinCard();
	}

	@Test
	@NeedsLandUIN
	public void downloadAndVerifySdJwtVcMultipleTime() {
		ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
		WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
		AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
		SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
    ConfirmPasscode confirmPasscode =
        setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);
    HomePage homePage =
        confirmPasscode.enterPasscodeInConfirmPasscodePage(
            TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);
		homePage.clickOnNextButtonForInjiTour();
		AddNewCardPage addNewCardPage = homePage.downloadCard();
    ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaMockSdJwt();
		addNewCardPage.clickOnContinueButtonInSigninPopupIos();
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getLandUIN());
		esignetLoginPage.clickOnGetOtpButton();
		otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtpForMock(), PlatformType.IOS);
		esignetLoginPage.clickOnVerifyButtonIos();
		addNewCardPage.clickOnDoneButton();
    assertTrue(
        homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
		AddNewCardPage addNewCardPageAgain = homePage.downloadCard();
    ESignetLoginPage esignetLoginPageAgain = addNewCardPageAgain.clickOnDownloadViaMockSdJwt();
		addNewCardPageAgain.clickOnContinueButtonInSigninPopupIos();
		OtpVerificationPage otpVerificationAgain = esignetLoginPageAgain
				.setEnterIdTextBox(getLandUIN());
		esignetLoginPageAgain.clickOnGetOtpButton();
		otpVerificationAgain.enterOtpForeSignet(InjiWalletUtil.getOtpForMock(), PlatformType.IOS);
		esignetLoginPageAgain.clickOnVerifyButtonIos();
	}
}
