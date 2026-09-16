package inji.testcases.iosTestCases;

import inji.annotations.NeedsMockUIN;
import inji.annotations.NeedsSunbirdPolicy;
import inji.annotations.NeedsUIN;
import inji.annotations.NeedsVID;
import inji.constants.InjiWalletConstants;
import inji.constants.PlatformType;
import inji.pages.*;
import inji.testcases.BaseTest.IosBaseTest;
import inji.utils.InjiWalletUtil;
import inji.utils.IosUtil;
import inji.utils.TestDataReader;
import org.testng.annotations.Test;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

public class VerifyHistoryTest extends IosBaseTest {
    @Test
    @NeedsUIN
    public void downloadVcAndVerifyHistory() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);

        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
        AddNewCardPage addNewCardPage = homePage.downloadCard();

        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();

        assertTrue(retrieveIdPage.isRetrieveIdPageLoaded(), "Verify if retrieve id page is displayed");
        OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(getUIN()).clickOnGenerateCardButton();

        assertTrue(otpVerification.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
        otpVerification.enterOtp(uinGetOtp(), PlatformType.IOS);

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        HistoryPage historyPage = homePage.clickOnHistoryButton();

        assertTrue(historyPage.isHistoryPageLoaded(), "Verify if history page is displayed");
        assertTrue(historyPage.verifyHistory(getUIN(), PlatformType.IOS));

    }

    @Test
    @NeedsUIN
    public void verifyActivationFailedRecordInHistory() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);

        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");

        AddNewCardPage addNewCardPage = homePage.downloadCard();

        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();

        assertTrue(retrieveIdPage.isRetrieveIdPageLoaded(), "Verify if retrieve id page is displayed");
        OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(getUIN()).clickOnGenerateCardButton();

        otpVerification.enterOtp(uinGetOtp(), PlatformType.IOS);

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();

        PleaseConfirmPopupPage pleaseConfirmPopupPage = moreOptionsPage.clickOnActivationPending();

        assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if pop up page is displayed");
        OtpVerificationPage otpVerificationPage = pleaseConfirmPopupPage.clickOnConfirmButton();

        assertTrue(otpVerificationPage.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
        otpVerificationPage.enterOtp(TestDataReader.readData("invalidOtp"), PlatformType.IOS);

        assertTrue(otpVerification.invalidOtpMessageDisplayed(), "Verify if OTP is invalid message is displayed");
        otpVerificationPage.enterOtp(TestDataReader.readData("invalidOtp"), PlatformType.IOS);
        assertTrue(otpVerificationPage.somethingWetWrongInVcActivationDisplayed(), "Verify if Something is wrong. Please try again later displayed");
        assertTrue(otpVerificationPage.isCancelButtonDisplayed(), "Verify if cancel button is displayed");

        HistoryPage historyPage = otpVerificationPage.clickOnCancelButton().clickOnCloseButton().clickOnHistoryButton();
        assertTrue(historyPage.isHistoryPageLoaded(), "Verify if history page is displayed");
        assertTrue(historyPage.verifyActivationFailedRecordInHistory(getUIN(), PlatformType.IOS));
    }

    @Test
    @NeedsUIN
    public void verifyActivationFailedRecordInHistoryFromDetailedView() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);

        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");

        AddNewCardPage addNewCardPage = homePage.downloadCard();

        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();

        assertTrue(retrieveIdPage.isRetrieveIdPageLoaded(), "Verify if retrieve id page is displayed");
        OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(getUIN()).clickOnGenerateCardButton();

        assertTrue(otpVerification.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
        otpVerification.enterOtp(uinGetOtp(), PlatformType.IOS);

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();
        PleaseConfirmPopupPage pleaseConfirmPopupPage = detailedVcViewPage.clickOnActivateButtonIos();

        OtpVerificationPage otpVerificationPage = pleaseConfirmPopupPage.clickOnConfirmButton();

        otpVerificationPage.enterOtp(TestDataReader.readData("invalidOtp"), PlatformType.IOS);

        assertTrue(otpVerification.invalidOtpMessageDisplayed(), "Verify if OTP is invalid message is displayed");
        otpVerificationPage.enterOtp(TestDataReader.readData("invalidOtp"), PlatformType.IOS);

        assertTrue(otpVerificationPage.somethingWetWrongInVcActivationDisplayed(), "Verify if Something is wrong. Please try again later displayed");
        assertTrue(otpVerificationPage.isCancelButtonDisplayed(), "Verify if cancel button is displayed");

        otpVerificationPage.clickOnCancelButton();
        HistoryPage historyPage = detailedVcViewPage.clickOnBackArrow().clickOnHistoryButton();
        assertTrue(historyPage.isHistoryPageLoaded(), "Verify if history page is displayed");
        assertTrue(historyPage.verifyActivationFailedRecordInHistory(getUIN(), PlatformType.IOS));
    }

    @Test
    @NeedsUIN
    public void activateVcAndVerifyInHistory() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);

        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");

        AddNewCardPage addNewCardPage = homePage.downloadCard();

        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();

        OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(getUIN()).clickOnGenerateCardButton();

        otpVerification.enterOtp(uinGetOtp(), PlatformType.IOS);

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();

        PleaseConfirmPopupPage pleaseConfirmPopupPage = moreOptionsPage.clickOnActivationPending();

        OtpVerificationPage otpVerificationPage = pleaseConfirmPopupPage.clickOnConfirmButton();

        otpVerificationPage.enterOtp(uinGetOtp(), PlatformType.IOS);

        assertTrue(moreOptionsPage.isVcActivatedForOnlineLogin(), "Verify if VC is activated");
        HistoryPage historyPage = homePage.clickOnHistoryButton();
        assertTrue(historyPage.isHistoryPageLoaded(), "Verify if history page is displayed");
        assertTrue(historyPage.verifyActivationSuccessfulRecordInHistory(getUIN(), PlatformType.IOS));

    }

    @Test
    @NeedsUIN
    public void downloadAndVerifyHistoryUsingUinViaEsignet() throws InterruptedException {
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

        assertTrue(detailedVcViewPage.isActivateButtonDisplayed(), "Verify if activate vc button displayed");

        PleaseConfirmPopupPage pleaseConfirmPopupPage = detailedVcViewPage.clickOnActivateButtonIos();

        pleaseConfirmPopupPage.clickOnConfirmButton();

        otpVerification.enterOtp(uinGetOtp(), PlatformType.IOS);
        assertTrue(detailedVcViewPage.isProfileAuthenticatedDisplayed(), "Verify profile authenticated displayed");
        detailedVcViewPage.clickOnBackArrow();

        MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();

        moreOptionsPage.clickOnRemoveFromWallet();

        pleaseConfirmPopupPage.clickOnConfirmButton();
        assertEquals(homePage.verifyLanguageForNoVCDownloadedPageLoaded(), "Bring your digital identity");

        HistoryPage historyPage = homePage.clickOnHistoryButton();
        assertTrue(historyPage.isHistoryPageLoaded(), "Verify if history page is displayed");
        assertTrue(historyPage.verifyActivationSuccessfulRecordInHistory(getUIN(), PlatformType.IOS));
        assertTrue(historyPage.verifyHistory(getUIN(), PlatformType.IOS), "verify if download history is displayed");
        assertTrue(historyPage.verifyDeleteHistory(getUIN(), PlatformType.IOS), "Verify if deleted history is displayed");
    }

    @Test
    @NeedsVID
    public void downloadAndVerifyHistoryUsingVidViaEsignet() throws InterruptedException {
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

        assertTrue(detailedVcViewPage.isActivateButtonDisplayed(), "Verify if activate vc button displayed");

        PleaseConfirmPopupPage pleaseConfirmPopupPage = detailedVcViewPage.clickOnActivateButtonIos();

        pleaseConfirmPopupPage.clickOnConfirmButton();

        otpVerification.enterOtp(vidGetOtp(), PlatformType.IOS);
        assertTrue(detailedVcViewPage.isProfileAuthenticatedDisplayed(), "Verify profile authenticated displayed");
        detailedVcViewPage.clickOnBackArrow();

        MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();

        moreOptionsPage.clickOnRemoveFromWallet();
        assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if pop up page is displayed");

        pleaseConfirmPopupPage.clickOnConfirmButton();

        HistoryPage historyPage = moreOptionsPage.clickOnCloseButton().clickOnHistoryButton();
        assertTrue(historyPage.isHistoryPageLoaded(), "Verify if history page is displayed");
        assertTrue(historyPage.verifyActivationSuccessfulRecordInHistory(getVID(), PlatformType.IOS));
        assertTrue(historyPage.verifyHistory(getVID(), PlatformType.IOS), "verify if download history is displayed");
    }

    @Test
    @NeedsSunbirdPolicy
    public void downloadAndVerifyHistoryForSunbird() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);

        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
        AddNewCardPage addNewCardPage = homePage.downloadCard();


        assertTrue(addNewCardPage.isDownloadViaSunbirdDisplayed(), "Verify if download sunbird displayed");
        SunbirdLoginPage sunbirdLoginPage = addNewCardPage.clickOnDownloadViaSunbird();
        addNewCardPage.clickOnCredentialTypeHeadingInsuranceCredential();
        sunbirdLoginPage.enterPolicyNumber(getPolicyNumber());
        sunbirdLoginPage.enterFullName(getPolicyName());
        sunbirdLoginPage.enterDateOfBirth();
        IosUtil.scrollToElement(getDriver(), 100, 800, 100, 200);
        sunbirdLoginPage.clickOnLoginButton();

        assertTrue(sunbirdLoginPage.isSunbirdCardActive(), "Verify if download sunbird displayed active");
        assertTrue(sunbirdLoginPage.isSunbirdCardLogoDisplayed(), "Verify if download sunbird logo displayed");

        sunbirdLoginPage.openDetailedSunbirdVcView();

        assertEquals(sunbirdLoginPage.getFullNameForSunbirdCardForDetailView(), getPolicyName());
        assertEquals(sunbirdLoginPage.getPolicyNameForSunbirdCard(), TestDataReader.readData("policyNameSunbird"));
        assertEquals(sunbirdLoginPage.getPhoneNumberForSunbirdCard(), TestDataReader.readData("phoneNumberSunbird"));
        assertTrue(sunbirdLoginPage.isDateOfBirthValueForSunbirdCardDisplayed());
        assertEquals(sunbirdLoginPage.getGenderValueForSunbirdCard(), TestDataReader.readData("genderValueSunbird"));
        assertEquals(sunbirdLoginPage.getEmailIdValueForSunbirdCard(), TestDataReader.readData("emailIdValueSunbird"));
        assertEquals(sunbirdLoginPage.getIdTypeValueForSunbirdCard(), TestDataReader.readData("idTypeSunbird"));

        sunbirdLoginPage.clickOnBackArrow();
        HistoryPage historyPage = homePage.clickOnHistoryButton();

        assertTrue(historyPage.isHistoryPageLoaded(), "Verify if history page is displayed");
        assertTrue(historyPage.verifyHistoryForInsuranceCard(TestDataReader.readData("policyNumberSunbird"), PlatformType.IOS));
    }

    @Test
    @NeedsUIN
    public void downloadVcAndVerifyActivityLog() throws InterruptedException {
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

        MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();

        moreOptionsPage.clickOnViewActivityLog();
        HistoryPage historyPage = new HistoryPage(getDriver());
        assertTrue(historyPage.verifyHistory(getUIN(), PlatformType.IOS), "verify if download history is displayed");
    }


    @Test
    @NeedsMockUIN
    public void downloadAndVerifyVcUsingMockDeleteAndVerifyHistory() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);

        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
        AddNewCardPage addNewCardPage = homePage.downloadCard();

        assertTrue(addNewCardPage.isIssuerDescriptionEsignetDisplayed(), "Verify if issuer description  esignet displayed");
        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
        assertTrue(addNewCardPage.isAddNewCardPageGuideMessageForEsignetDisplayed(), "Verify if add new card guide message displayed");
        assertTrue(addNewCardPage.isDownloadViaEsignetDisplayed(), "Verify if download via uin displayed");

        MockCertifyLoginPage mockCertifyLoginPage = new MockCertifyLoginPage(getDriver());
        addNewCardPage.clickOnDownloadViaMock();

        addNewCardPage.clickOnContinueButtonInSigninPopupIos();
        OtpVerificationPage otpVerification = mockCertifyLoginPage.setEnterIdTextBox(getMockUIN());

        mockCertifyLoginPage.clickOnGetOtpButton();

        otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtpForMock(), PlatformType.IOS);
        mockCertifyLoginPage.clickOnVerifyButtonIos();
        addNewCardPage.clickOnDoneButton();
        MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();

        PleaseConfirmPopupPage pleaseConfirmPopupPage = moreOptionsPage.clickOnRemoveFromWallet();
        assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if pop up page is displayed");

        pleaseConfirmPopupPage.clickOnConfirmButton();
        assertEquals(homePage.verifyLanguageForNoVCDownloadedPageLoaded(), "Bring your digital identity");
        HistoryPage historyPage = homePage.clickOnHistoryButton();


        assertTrue(historyPage.isHistoryPageLoaded(), "Verify if history page is displayed");
        assertTrue(historyPage.verifyHistoryForMock(PlatformType.IOS));
    }

    @Test
    @NeedsMockUIN
    public void downloadAndVerifyVcUsingMdlDeleteAndVerifyHistory() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);

        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
        AddNewCardPage addNewCardPage = homePage.downloadCard();
        assertTrue(addNewCardPage.isIssuerDescriptionEsignetDisplayed(), "Verify if issuer description  esignet displayed");
        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
        assertTrue(addNewCardPage.isAddNewCardPageGuideMessageForEsignetDisplayed(), "Verify if add new card guide message displayed");
        assertTrue(addNewCardPage.isDownloadViaEsignetDisplayed(), "Verify if download via uin displayed");

        MockCertifyLoginPage mockCertifyLoginPage = addNewCardPage.clickOnDownloadViaMockCertify();

        addNewCardPage.clickOnContinueButtonInSigninPopupIos();

        OtpVerificationPage otpVerification = mockCertifyLoginPage.setEnterIdTextBox(getMockUIN());

        mockCertifyLoginPage.clickOnGetOtpButton();

        otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtpForMock(), PlatformType.IOS);
        mockCertifyLoginPage.clickOnVerifyButtonIos();
        addNewCardPage.clickOnDoneButton();
        MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();

        PleaseConfirmPopupPage pleaseConfirmPopupPage = moreOptionsPage.clickOnRemoveFromWallet();

        pleaseConfirmPopupPage.clickOnConfirmButton();
        assertEquals(homePage.verifyLanguageForNoVCDownloadedPageLoaded(), "Bring your digital identity");
        HistoryPage historyPage = homePage.clickOnHistoryButton();


        assertTrue(historyPage.isHistoryPageLoaded(), "Verify if history page is displayed");
        assertTrue(historyPage.verifyHistory(PlatformType.IOS));
    }
}
