package inji.testcases.androidTestCases;

import inji.annotations.NeedsUIN;
import inji.annotations.NeedsVID;
import inji.constants.InjiWalletConstants;
import inji.constants.PlatformType;
import inji.pages.*;
import inji.testcases.BaseTest.AndroidBaseTest;
import inji.utils.InjiWalletUtil;
import inji.utils.TestDataReader;
import org.testng.annotations.Test;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

public class VcDownloadAndVerifyUsingEsignetTest extends AndroidBaseTest {
	@Test
	@NeedsUIN
	public void downloadAndVerifyVcUsingUinViaEsignet() {
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

		assertTrue(addNewCardPage.isIssuerDescriptionEsignetDisplayed(),
				"Verify if issuer description  esignet displayed");
		assertTrue(addNewCardPage.isAddNewCardPageGuideMessageForEsignetDisplayed(),
				"Verify if add new card guide message displayed");
		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();

		esignetLoginPage.clickOnEsignetLoginWithOtpButton();

		assertTrue(esignetLoginPage.isESignetLogoDisplayed(), "");
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getUIN());

		esignetLoginPage.clickOnGetOtpButton();
		otpVerification.enterOtpForeSignet(uinGetOtp(), PlatformType.ANDROID);
		esignetLoginPage.clickOnVerifyButton();

		addNewCardPage.clickOnDoneButton();
		assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
		DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();

		assertTrue(detailedVcViewPage.isDetailedVcViewPageLoaded(), "Verify if detailed Vc view page is displayed");
		assertEquals(detailedVcViewPage.getNameInDetailedVcView(), TestDataReader.readData("fullName"),
				"Verify if full name is displayed");
		assertEquals(detailedVcViewPage.getGenderInDetailedVcView(), TestDataReader.readData("gender"),
				"Verify if gender is displayed");
		assertEquals(detailedVcViewPage.getIdTypeValueInDetailedVcView(), TestDataReader.readData("idType"),
				"Verify if id type is displayed");
		assertEquals(detailedVcViewPage.getStatusInDetailedVcView(), TestDataReader.readData("status"),
				"Verify if status is displayed");
		assertEquals(detailedVcViewPage.getUinInDetailedVcView(), getUIN(), "Verify if uin is displayed");
		assertEquals(detailedVcViewPage.getPhoneInDetailedVcView(), getPhone(), "Verify if phone number is displayed");
		assertEquals(detailedVcViewPage.getEmailInDetailedVcView(), getEmail(), "Verify if email is displayed");
		assertTrue(detailedVcViewPage.isActivateButtonDisplayed(), "Verify if activate vc button displayed");

		PleaseConfirmPopupPage pleaseConfirmPopupPage = detailedVcViewPage.clickOnActivateButtonAndroid();

		pleaseConfirmPopupPage.clickOnConfirmButton();

		otpVerification.enterOtp(uinGetOtp(), PlatformType.ANDROID);
		assertTrue(detailedVcViewPage.isProfileAuthenticatedDisplayed(), "Verify profile authenticated displayed");

		detailedVcViewPage.clickOnBackArrow();
		assertTrue(detailedVcViewPage.isEsignetLogoDisplayed(), "Verify if detailed Vc esignet logo is displayed");
	}

	@Test
	@NeedsVID
	public void downloadAndVerifyVcUsingVidViaEsignet() {
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
		addNewCardPage.clickOnContinueButton();

		assertTrue(esignetLoginPage.isESignetLogoDisplayed(), "");
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getVID());
		esignetLoginPage.clickOnGetOtpButton();
		otpVerification.enterOtpForeSignet(vidGetOtp(), PlatformType.ANDROID);
		esignetLoginPage.clickOnVerifyButton();
		homePage.clickOnDoneButton();
		DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();
		assertTrue(detailedVcViewPage.isDetailedVcViewPageLoaded(), "Verify if detailed Vc view page is displayed");
		assertEquals(detailedVcViewPage.getNameInDetailedVcView(), TestDataReader.readData("fullName"),
				"Verify if full name is displayed");
		assertEquals(detailedVcViewPage.getStatusInDetailedVcView(), TestDataReader.readData("status"),
				"Verify if status is displayed");

		assertEquals(detailedVcViewPage.getPhoneInDetailedVcView(), getVidPhone(),
				"Verify if phone number is displayed");
		assertEquals(detailedVcViewPage.getEmailInDetailedVcView(), getVidEmail(), "Verify if email is displayed");
		assertTrue(detailedVcViewPage.isActivateButtonDisplayed(), "Verify if activate vc button displayed");

		PleaseConfirmPopupPage pleaseConfirmPopupPage = detailedVcViewPage.clickOnActivateButtonAndroid();
		assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(),
				"Verify if confirm popup page is displayed");

		pleaseConfirmPopupPage.clickOnConfirmButton();
		assertTrue(otpVerification.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");

		otpVerification.enterOtp(vidGetOtp(), PlatformType.ANDROID);
		assertTrue(detailedVcViewPage.isProfileAuthenticatedDisplayed(), "Verify profile authenticated displayed");

	}

	@Test
	@NeedsUIN
	public void downloadMultipleVcViaEsignet() {
		ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

		WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

		AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

		SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

		ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.ANDROID);

		HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.ANDROID);

		AddNewCardPage addNewCardPage = homePage.downloadCard();

		assertTrue(addNewCardPage.isIssuerDescriptionMosipDisplayed(), "Verify if issuer description  mosip displayed");
		assertTrue(addNewCardPage.isIssuerDescriptionEsignetDisplayed(),
				"Verify if issuer description  esignet displayed");
		assertTrue(addNewCardPage.isIssuerSearchBarDisplayed(), "Verify if issuer search bar displayed");
		addNewCardPage.sendTextInIssuerSearchBar("Download MOSIP Credentials");
		assertTrue(addNewCardPage.isAddNewCardPageGuideMessageForEsignetDisplayed(),
				"Verify if add new card guide message displayed");
		assertTrue(addNewCardPage.isDownloadViaEsignetDisplayed(), "Verify if download via uin displayed");
		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();

		esignetLoginPage.clickOnEsignetLoginWithOtpButton();

		assertTrue(esignetLoginPage.isESignetLogoDisplayed(), "");
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getUIN());

		esignetLoginPage.clickOnGetOtpButton();

		otpVerification.enterOtpForeSignet(uinGetOtp(), PlatformType.ANDROID);
		esignetLoginPage.clickOnVerifyButton();

		addNewCardPage.clickOnDoneButton();
		assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
		DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();

		PleaseConfirmPopupPage pleaseConfirmPopupPage = detailedVcViewPage.clickOnActivateButtonAndroid();

		pleaseConfirmPopupPage.clickOnConfirmButton();

		otpVerification.enterOtp(uinGetOtp(), PlatformType.ANDROID);
		assertTrue(detailedVcViewPage.isProfileAuthenticatedDisplayed(), "Verify profile authenticated displayed");

		detailedVcViewPage.clickOnBackArrow();
		assertTrue(detailedVcViewPage.isEsignetLogoDisplayed(), "Verify if detailed Vc esignet logo is displayed");

		homePage.downloadCard();

		addNewCardPage.clickOnDownloadViaEsignet();

		esignetLoginPage.clickOnEsignetLoginWithOtpButton();

		assertTrue(esignetLoginPage.isESignetLogoDisplayed(), "");
		String vid = TestDataReader.readData("vid");
		esignetLoginPage.setEnterIdTextBox(vid);

		esignetLoginPage.clickOnGetOtpButton();

		otpVerification.enterOtpForeSignet(uinGetOtp(), PlatformType.ANDROID);
		esignetLoginPage.clickOnVerifyButton();

		addNewCardPage.clickOnDoneButton();
		assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
		homePage.openDetailedVcView();
	}

	@Test
	@NeedsUIN
	public void downloadAndVerifyVcUsingUinViaEsignetWithInvalidOtp() {
		ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

		WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

		AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

		SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

		ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.ANDROID);

		HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE),
				PlatformType.ANDROID);

		AddNewCardPage addNewCardPage = homePage.downloadCard();

		assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
		assertTrue(addNewCardPage.isIssuerDescriptionMosipDisplayed(), "Verify if issuer description  mosip displayed");
		assertTrue(addNewCardPage.isIssuerDescriptionEsignetDisplayed(),
				"Verify if issuer description  esignet displayed");
		assertTrue(addNewCardPage.isIssuerSearchBarDisplayed(), "Verify if issuer search bar displayed");
		addNewCardPage.sendTextInIssuerSearchBar("Download MOSIP Credentials");
		assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
		assertTrue(addNewCardPage.isAddNewCardPageGuideMessageForEsignetDisplayed(),
				"Verify if add new card guide message displayed");
		assertTrue(addNewCardPage.isDownloadViaEsignetDisplayed(), "Verify if download via uin displayed");
		ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();

		esignetLoginPage.clickOnEsignetLoginWithOtpButton();

		assertTrue(esignetLoginPage.isESignetLogoDisplayed(), "");
		OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getUIN());

		esignetLoginPage.clickOnGetOtpButton();

		otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtpForMock(), PlatformType.ANDROID);
		esignetLoginPage.clickOnVerifyButton();

		assertTrue(esignetLoginPage.isInvalidOtpMessageDisplayed(), "verify if invalid otp message is displayed");

	}

}
