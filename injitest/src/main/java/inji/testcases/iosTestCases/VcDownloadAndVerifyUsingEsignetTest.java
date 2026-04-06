package inji.testcases.iosTestCases;

import inji.annotations.NeedsUIN;
import inji.annotations.NeedsVID;
import inji.constants.InjiWalletConstants;
import inji.constants.PlatformType;
import inji.pages.*;
import inji.testcases.BaseTest.IosBaseTest;
import inji.utils.TestDataReader;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.testng.annotations.Test;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

public class VcDownloadAndVerifyUsingEsignetTest extends IosBaseTest {

	private static final Logger logger = LogManager.getLogger(VcDownloadAndVerifyUsingEsignetTest.class);

    @Test
    @NeedsUIN
    public void downloadAndVerifyVcUsingUinViaEsignet() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);

        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
        AddNewCardPage addNewCardPage = homePage.downloadCard();

        ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();
        addNewCardPage.clickOnContinueButtonInSigninPopupIos();

        OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getUIN());


        esignetLoginPage.clickOnGetOtpButton();

        otpVerification.enterOtpForeSignet(uinGetOtp(), PlatformType.IOS);
        esignetLoginPage.clickOnVerifyButtonIos();

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");


        DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();

        assertTrue(detailedVcViewPage.isEsignetLogoDisplayed(), "Verify if detailed Vc esignet logo is displayed");
        assertTrue(detailedVcViewPage.isDetailedVcViewPageLoaded(), "Verify if detailed Vc view page is displayed");
        assertEquals(detailedVcViewPage.getNameInDetailedVcView(), TestDataReader.readData("fullName"), "Verify if full name is displayed");
        assertEquals(detailedVcViewPage.getGenderInDetailedVcView(), TestDataReader.readData("gender"), "Verify if gender is displayed");
        assertEquals(detailedVcViewPage.getIdTypeValueInDetailedVcView(), TestDataReader.readData("idType"), "Verify if id type is displayed");
        assertEquals(detailedVcViewPage.getStatusInDetailedVcView(), TestDataReader.readData("status"), "Verify if status is displayed");
        assertEquals(detailedVcViewPage.getUinInDetailedVcView(), getUIN(), "Verify if uin is displayed");
        assertEquals(detailedVcViewPage.getPhoneInDetailedVcView(), getPhone(), "Verify if phone number is displayed");
        assertEquals(detailedVcViewPage.getEmailInDetailedVcView(), getEmail(), "Verify if email is displayed");
        assertTrue(detailedVcViewPage.isActivateButtonDisplayed(), "Verify if activate vc button displayed");

        PleaseConfirmPopupPage pleaseConfirmPopupPage = detailedVcViewPage.clickOnActivateButtonIos();

        pleaseConfirmPopupPage.clickOnConfirmButton();

        otpVerification.enterOtp(uinGetOtp(), PlatformType.IOS);
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

        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);

        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);


        homePage.clickOnNextButtonForInjiTour();
        AddNewCardPage addNewCardPage = homePage.downloadCard();

        ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();
        addNewCardPage.clickOnContinueButtonInSigninPopupIos();


        OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getVID());
        esignetLoginPage.clickOnGetOtpButton();

        otpVerification.enterOtpForeSignet(vidGetOtp(), PlatformType.IOS);
        esignetLoginPage.clickOnVerifyButtonIos();

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");

        DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();

        assertTrue(detailedVcViewPage.isEsignetLogoDisplayed(), "Verify if detailed Vc esignet logo is displayed");
        assertTrue(detailedVcViewPage.isDetailedVcViewPageLoaded(), "Verify if detailed Vc view page is displayed");
        assertEquals(detailedVcViewPage.getNameInDetailedVcView(), TestDataReader.readData("fullName"), "Verify if full name is displayed");
        assertEquals(detailedVcViewPage.getGenderInDetailedVcView(), TestDataReader.readData("gender"), "Verify if gender is displayed");
        assertEquals(detailedVcViewPage.getIdTypeValueInDetailedVcView(), TestDataReader.readData("idType"), "Verify if id type is displayed");
        assertEquals(detailedVcViewPage.getStatusInDetailedVcView(), TestDataReader.readData("status"), "Verify if status is displayed");
        assertTrue(detailedVcViewPage.isActivateButtonDisplayed(), "Verify if activate vc button displayed");

        PleaseConfirmPopupPage pleaseConfirmPopupPage = detailedVcViewPage.clickOnActivateButtonIos();

        pleaseConfirmPopupPage.clickOnConfirmButton();

        otpVerification.enterOtp(vidGetOtp(), PlatformType.IOS);
        assertTrue(detailedVcViewPage.isProfileAuthenticatedDisplayed(), "Verify profile authenticated displayed");

    }

    @Test
    public void denyPopupforEsignetLoginWebPage() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);

        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);


        homePage.clickOnNextButtonForInjiTour();
        AddNewCardPage addNewCardPage = homePage.downloadCard();

        assertTrue(addNewCardPage.isIssuerDescriptionEsignetDisplayed(), "Verify if issuer description  esignet displayed");
        assertTrue(addNewCardPage.isIssuerSearchBarDisplayed(), "Verify if issuer search bar displayed");
        ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();
        addNewCardPage.clickOnCancelButtonInSigninPopupIos();
    }

    @Test
    @NeedsUIN
    public void downloadMultipleVcViaEsignet() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);


        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        AddNewCardPage addNewCardPage = homePage.downloadCard();

        ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();
        addNewCardPage.clickOnContinueButtonInSigninPopupIos();

        esignetLoginPage.clickOnEsignetLoginWithOtpButton();
        OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getUIN());


        esignetLoginPage.clickOnGetOtpButton();

        otpVerification.enterOtpForeSignet(uinGetOtp(), PlatformType.IOS);
        esignetLoginPage.clickOnVerifyButtonIos();

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");

        DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();

        assertTrue(detailedVcViewPage.isEsignetLogoDisplayed(), "Verify if detailed Vc esignet logo is displayed");
        assertTrue(detailedVcViewPage.isDetailedVcViewPageLoaded(), "Verify if detailed Vc view page is displayed");
        assertEquals(detailedVcViewPage.getNameInDetailedVcView(), TestDataReader.readData("fullName"), "Verify if full name is displayed");
        assertEquals(detailedVcViewPage.getGenderInDetailedVcView(), TestDataReader.readData("gender"), "Verify if gender is displayed");
        assertEquals(detailedVcViewPage.getIdTypeValueInDetailedVcView(), TestDataReader.readData("idType"), "Verify if id type is displayed");
        assertEquals(detailedVcViewPage.getStatusInDetailedVcView(), TestDataReader.readData("status"), "Verify if status is displayed");
        assertEquals(detailedVcViewPage.getUinInDetailedVcView(), getUIN(), "Verify if uin is displayed");
        assertEquals(detailedVcViewPage.getPhoneInDetailedVcView(), TestDataReader.readData("phoneNumber"), "Verify if phone number is displayed");
        assertEquals(detailedVcViewPage.getEmailInDetailedVcView(), TestDataReader.readData("externalemail"), "Verify if email is displayed");
        assertTrue(detailedVcViewPage.isActivateButtonDisplayed(), "Verify if activate vc button displayed");

        PleaseConfirmPopupPage pleaseConfirmPopupPage = detailedVcViewPage.clickOnActivateButtonIos();
        assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if confirm popup page is displayed");

        pleaseConfirmPopupPage.clickOnConfirmButton();
        assertTrue(otpVerification.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");

        otpVerification.enterOtp(uinGetOtp(), PlatformType.IOS);
        assertTrue(detailedVcViewPage.isProfileAuthenticatedDisplayed(), "Verify profile authenticated displayed");
        detailedVcViewPage.clickOnBackArrow();

        homePage.downloadCard();
        addNewCardPage.clickOnDownloadViaEsignet();
        addNewCardPage.clickOnContinueButtonInSigninPopupIos();

        esignetLoginPage.clickOnEsignetLoginWithOtpButton();
        esignetLoginPage.setEnterIdTextBox(getUIN());

        esignetLoginPage.clickOnGetOtpButton();
        otpVerification.enterOtpForeSignet(uinGetOtp(), PlatformType.IOS);
        esignetLoginPage.clickOnVerifyButtonIos();

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");

    }
    @Test
    @NeedsUIN
    public void downloadAndVerifyVcUsingUinViaEsignetFiveTimes() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);
        homePage.clickOnNextButtonForInjiTour();

        for (int i = 1; i <= 5; i++) {
        	logger.info("=== Starting VC Download Iteration " + i + " ===");

            AddNewCardPage addNewCardPage = homePage.scrollanddownloadCard();
            assertTrue(addNewCardPage.isIssuerDescriptionEsignetDisplayed(), "Verify if issuer description esignet displayed - Iteration " + i);
            assertTrue(addNewCardPage.isAddNewCardPageGuideMessageForEsignetDisplayed(), "Verify if add new card guide message displayed - Iteration " + i);

            ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();
            addNewCardPage.clickOnContinueButtonInSigninPopupIos();
            OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getUIN());
            esignetLoginPage.clickOnGetOtpButton();
            otpVerification.enterOtpForeSignet(uinGetOtp(), PlatformType.IOS);
            esignetLoginPage.clickOnVerifyButtonIos();
            if (i==1) {addNewCardPage.clickOnDoneButton();}

            assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed - Iteration " + i);

            DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();
            assertTrue(detailedVcViewPage.isDetailedVcViewPageLoaded(), "Verify if detailed Vc view page is displayed - Iteration " + i);
            assertEquals(detailedVcViewPage.getNameInDetailedVcView(), TestDataReader.readData("fullName"), "Verify if full name is displayed - Iteration " + i);
            assertEquals(detailedVcViewPage.getGenderInDetailedVcView(), TestDataReader.readData("gender"), "Verify if gender is displayed - Iteration " + i);
            assertEquals(detailedVcViewPage.getIdTypeValueInDetailedVcView(), TestDataReader.readData("idType"), "Verify if id type is displayed - Iteration " + i);
            assertEquals(detailedVcViewPage.getStatusInDetailedVcView(), TestDataReader.readData("status"), "Verify if status is displayed - Iteration " + i);
            assertEquals(detailedVcViewPage.getUinInDetailedVcView(), getUIN(), "Verify if uin is displayed - Iteration " + i);
            assertEquals(detailedVcViewPage.getPhoneInDetailedVcView(), getPhone(), "Verify if phone number is displayed - Iteration " + i);
            assertEquals(detailedVcViewPage.getEmailInDetailedVcView(), getEmail(), "Verify if email is displayed - Iteration " + i);
            detailedVcViewPage.clickOnBackArrow();
            assertTrue(detailedVcViewPage.isEsignetLogoDisplayed(), "Verify if detailed Vc esignet logo is displayed - Iteration " + i);

            logger.info("=== Completed VC Download Iteration " + i + " ===");
        }

        logger.info("Successfully downloaded and verified 5 VCs!");
    }
}
