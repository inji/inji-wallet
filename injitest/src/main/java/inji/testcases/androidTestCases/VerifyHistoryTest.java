package inji.testcases.androidTestCases;

import inji.annotations.NeedsMockUIN;
import inji.annotations.NeedsSunbirdPolicy;
import inji.annotations.NeedsUIN;
import inji.constants.PlatformType;
import inji.pages.*;
import inji.testcases.BaseTest.AndroidBaseTest;
import inji.utils.InjiWalletUtil;
import inji.utils.IosUtil;
import inji.utils.TestDataReader;
import org.testng.annotations.Test;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

public class VerifyHistoryTest extends AndroidBaseTest {
    @Test
    @NeedsUIN
    public void downloadVcAndVerifyHistory() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

//        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

//        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

//        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

//        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

//        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
//        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        AddNewCardPage addNewCardPage = homePage.downloadCard();

//        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();

        assertTrue(retrieveIdPage.isRetrieveIdPageLoaded(), "Verify if retrieve id page is displayed");
//        String uin = TestDataReader.readData("uin");
        OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(getUIN()).clickOnGenerateCardButton();

        assertTrue(otpVerification.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
        otpVerification.enterOtp(InjiWalletUtil.getOtp(), PlatformType.ANDROID);

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        HistoryPage historyPage = homePage.clickOnHistoryButton();

        assertTrue(historyPage.isHistoryPageLoaded(), "Verify if history page is displayed");
        assertTrue(historyPage.verifyHistory(getUIN(), PlatformType.ANDROID));

    }

    @Test
    @NeedsUIN
    public void verifyActivationFailedRecordInHistory() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

//        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

//        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

//        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

//        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

//        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
//        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");

        AddNewCardPage addNewCardPage = homePage.downloadCard();

        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();

        assertTrue(retrieveIdPage.isRetrieveIdPageLoaded(), "Verify if retrieve id page is displayed");
//        String uin = TestDataReader.readData("uin");
        OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(getUIN()).clickOnGenerateCardButton();

        assertTrue(otpVerification.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
        otpVerification.enterOtp(InjiWalletUtil.getOtp(), PlatformType.ANDROID);

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();

//        assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");
        PleaseConfirmPopupPage pleaseConfirmPopupPage = moreOptionsPage.clickOnActivationPending();

//        assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if pop up page is displayed");
        OtpVerificationPage otpVerificationPage = pleaseConfirmPopupPage.clickOnConfirmButton();

//        assertTrue(otpVerificationPage.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
        otpVerificationPage.enterOtp(TestDataReader.readData("invalidOtp"), PlatformType.ANDROID);

        assertTrue(otpVerification.invalidOtpMessageDisplayed(), "Verify if OTP is invalid message is displayed");
        otpVerificationPage.enterOtp(TestDataReader.readData("invalidOtp"), PlatformType.ANDROID);

        assertTrue(otpVerificationPage.somethingWetWrongInVcActivationDisplayed(), "Verify if Something is wrong. Please try again later displayed");
        assertTrue(otpVerificationPage.isCancelButtonDisplayed(), "Verify if cancel button is displayed");

        HistoryPage historyPage = otpVerificationPage.clickOnCancelButton().clickOnCloseButton().clickOnHistoryButton();
        assertTrue(historyPage.isHistoryPageLoaded(), "Verify if history page is displayed");
        assertTrue(historyPage.verifyActivationFailedRecordInHistory(getUIN(), PlatformType.ANDROID));
    }

    @Test
    @NeedsUIN
    public void verifyActivationFailedRecordInHistoryFromDetailedView() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

//        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

//        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

//        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

//        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

//        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
//        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");

        AddNewCardPage addNewCardPage = homePage.downloadCard();

//        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();

        assertTrue(retrieveIdPage.isRetrieveIdPageLoaded(), "Verify if retrieve id page is displayed");
//        String uin = TestDataReader.readData("uin");
        OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(getUIN()).clickOnGenerateCardButton();

//        assertTrue(otpVerification.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
        otpVerification.enterOtp(InjiWalletUtil.getOtp(), PlatformType.ANDROID);

        addNewCardPage.clickOnDoneButton();
//        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();
//        assertTrue(detailedVcViewPage.isDetailedVcViewPageLoaded(), "Verify if detailed Vc view page is displayed");
        PleaseConfirmPopupPage pleaseConfirmPopupPage = detailedVcViewPage.clickOnActivateButtonAndroid();

//        assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if pop up page is displayed");
        OtpVerificationPage otpVerificationPage = pleaseConfirmPopupPage.clickOnConfirmButton();

        assertTrue(otpVerificationPage.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
        otpVerificationPage.enterOtp(TestDataReader.readData("invalidOtp"), PlatformType.ANDROID);

        assertTrue(otpVerificationPage.somethingWetWrongInVcActivationDisplayed(), "Verify if Something is wrong. Please try again later displayed");
        assertTrue(otpVerificationPage.isCancelButtonDisplayed(), "Verify if cancel button is displayed");

        otpVerificationPage.clickOnCancelButton();
        HistoryPage historyPage = detailedVcViewPage.clickOnBackArrow().clickOnHistoryButton();
        assertTrue(historyPage.isHistoryPageLoaded(), "Verify if history page is displayed");
        assertTrue(historyPage.verifyActivationFailedRecordInHistory(getUIN(), PlatformType.ANDROID));
    }

    @Test
    @NeedsUIN
    public void activateVcAndVerifyInHistory() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

//        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

//        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

//        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

//        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

//        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
//        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");

        AddNewCardPage addNewCardPage = homePage.downloadCard();

//        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();

        assertTrue(retrieveIdPage.isRetrieveIdPageLoaded(), "Verify if retrieve id page is displayed");
//        String uin = TestDataReader.readData("uin");
        OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(getUIN()).clickOnGenerateCardButton();

//        assertTrue(otpVerification.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
        otpVerification.enterOtp(InjiWalletUtil.getOtp(), PlatformType.ANDROID);

        addNewCardPage.clickOnDoneButton();
//        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();

//        assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");
        PleaseConfirmPopupPage pleaseConfirmPopupPage = moreOptionsPage.clickOnActivationPending();

//        assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if pop up page is displayed");
        OtpVerificationPage otpVerificationPage = pleaseConfirmPopupPage.clickOnConfirmButton();

//        assertTrue(otpVerificationPage.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
        otpVerificationPage.enterOtp(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        assertTrue(moreOptionsPage.isVcActivatedForOnlineLogin(), "Verify if VC is activated");
        HistoryPage historyPage = homePage.clickOnHistoryButton();
        assertTrue(historyPage.isHistoryPageLoaded(), "Verify if history page is displayed");
        assertTrue(historyPage.verifyActivationSuccessfulRecordInHistory(getUIN(), PlatformType.ANDROID));

    }

    @Test
    @NeedsUIN
    public void downloadAndVerifyHistoryUsingUinViaEsignet() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

//        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

//        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

//        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

//        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

//        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
//        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        AddNewCardPage addNewCardPage = homePage.downloadCard();

//        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
        ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();

        esignetLoginPage.clickOnEsignetLoginWithOtpButton();

        assertTrue(esignetLoginPage.isESignetLogoDisplayed(), "Verify if Esignet Login page is landed");
//        String uin = TestDataReader.readData("uin");
        OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getUIN());

        esignetLoginPage.clickOnGetOtpButton();
        assertTrue(esignetLoginPage.isOtpHasSendMessageDisplayed(), "verify if otp page is displayed");

        otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtp(), PlatformType.ANDROID);
        esignetLoginPage.clickOnVerifyButton();

        addNewCardPage.clickOnDoneButton();
//        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();

        assertTrue(detailedVcViewPage.isActivateButtonDisplayed(), "Verify if activate vc button displayed");

        PleaseConfirmPopupPage pleaseConfirmPopupPage = detailedVcViewPage.clickOnActivateButtonAndroid();
//        assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if confirm popup page is displayed");

        pleaseConfirmPopupPage.clickOnConfirmButton();
        assertTrue(otpVerification.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");

        otpVerification.enterOtp(TestDataReader.readData("passcode"), PlatformType.ANDROID);
        assertTrue(detailedVcViewPage.isProfileAuthenticatedDisplayed(), "Verify profile authenticated displayed");
        detailedVcViewPage.clickOnCrossIcon();
        detailedVcViewPage.clickOnBackArrow();

        MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();
//        assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");

        moreOptionsPage.clickOnRemoveFromWallet();
//        assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if pop up page is displayed");

        pleaseConfirmPopupPage.clickOnConfirmButton();
        assertEquals(homePage.verifyLanguageForNoVCDownloadedPageLoaded(), "Bring your digital identity");

        HistoryPage historyPage = homePage.clickOnHistoryButton();
        assertTrue(historyPage.isHistoryPageLoaded(), "Verify if history page is displayed");
        assertTrue(historyPage.verifyActivationSuccessfulRecordInHistory(getUIN(), PlatformType.ANDROID));
        assertTrue(historyPage.verifyHistory(getUIN(), PlatformType.ANDROID), "verify if download history is displayed");
        assertTrue(historyPage.verifyDeleteHistory(getUIN(), PlatformType.ANDROID), "Verify if deleted history is displayed");
    }

    @Test
    public void downloadAndVerifyHistoryUsingVidViaEsignet() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

//        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

//        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

//        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

//        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

//        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
//        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        AddNewCardPage addNewCardPage = homePage.downloadCard();

//        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
        ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();

        esignetLoginPage.clickOnEsignetLoginWithOtpButton();

//        assertTrue(esignetLoginPage.isESignetLogoDisplayed(), "Verify if Esignet Login page is landed");
        String vid = TestDataReader.readData("vid");
        OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(vid);

        esignetLoginPage.clickOnGetOtpButton();
//        assertTrue(esignetLoginPage.isOtpHasSendMessageDisplayed(), "verify if otp page is displayed");

        otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtp(), PlatformType.ANDROID);
        esignetLoginPage.clickOnVerifyButton();

        addNewCardPage.clickOnDoneButton();
//        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();

        assertTrue(detailedVcViewPage.isActivateButtonDisplayed(), "Verify if activate vc button displayed");

        PleaseConfirmPopupPage pleaseConfirmPopupPage = detailedVcViewPage.clickOnActivateButtonAndroid();
        assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if confirm popup page is displayed");

        pleaseConfirmPopupPage.clickOnConfirmButton();
        assertTrue(otpVerification.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");

        otpVerification.enterOtp(TestDataReader.readData("passcode"), PlatformType.ANDROID);
        assertTrue(detailedVcViewPage.isProfileAuthenticatedDisplayed(), "Verify profile authenticated displayed");
        detailedVcViewPage.clickOnCrossIcon();
        detailedVcViewPage.clickOnBackArrow();

        MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();
        assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");

        moreOptionsPage.clickOnRemoveFromWallet();
        assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if pop up page is displayed");

        pleaseConfirmPopupPage.clickOnConfirmButton();

        HistoryPage historyPage = homePage.clickOnHistoryButton();
        assertTrue(historyPage.isHistoryPageLoaded(), "Verify if history page is displayed");
        assertTrue(historyPage.verifyActivationSuccessfulRecordInHistory(vid, PlatformType.ANDROID));
        assertTrue(historyPage.verifyHistory(vid, PlatformType.ANDROID), "verify if download history is displayed");
    }

    @Test
    @NeedsSunbirdPolicy
    public void downloadAndVerifyHistoryForSunbird() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

//        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

//        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

//        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

//        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

//        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
//        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        AddNewCardPage addNewCardPage = homePage.downloadCard();

//        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
//        assertTrue(addNewCardPage.isIssuerDescriptionEsignetDisplayed(), "Verify if issuer description  esignet displayed");
        assertTrue(addNewCardPage.isIssuerSearchBarDisplayed(), "Verify if issuer search bar displayed");
        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
        assertTrue(addNewCardPage.isAddNewCardPageGuideMessageForEsignetDisplayed(), "Verify if add new card guide message displayed");
        assertTrue(addNewCardPage.isDownloadViaSunbirdDisplayed(), "Verify if download sunbird displayed");
        SunbirdLoginPage sunbirdLoginPage = addNewCardPage.clickOnDownloadViaSunbird();
        addNewCardPage.clickOnCredentialTypeHeadingInsuranceCredential();
//        assertTrue(sunbirdLoginPage.isSunbirdRCInsuranceVerifiableCredentialHeaderDisplayed(), "Verify if sunbirdRC insurance verifiable credential displayed");
//        sunbirdLoginPage.clickOnMosipInsurance();

        sunbirdLoginPage.enterPolicyNumber(getPolicyNumber());
        sunbirdLoginPage.enterFullName(getPolicyName());
        sunbirdLoginPage.enterDateOfBirth();
        sunbirdLoginPage.clickOnLoginButton();

//        assertTrue(sunbirdLoginPage.isSunbirdCardActive(), "Verify if download sunbird displayed active");
        addNewCardPage.clickOnDoneButton();
        assertTrue(sunbirdLoginPage.isSunbirdCardLogoDisplayed(), "Verify if download sunbird logo displayed");
//        assertEquals(sunbirdLoginPage.getFullNameForSunbirdCard(),TestDataReader.readData("fullNameSunbird"));

        sunbirdLoginPage.openDetailedSunbirdVcView();

        assertEquals(sunbirdLoginPage.getFullNameForSunbirdCardForDetailView(), getPolicyName());
//        assertEquals(sunbirdLoginPage.getPolicyNameForSunbirdCard(),TestDataReader.readData("policyNameSunbird"));
        assertEquals(sunbirdLoginPage.getPhoneNumberForSunbirdCard(), TestDataReader.readData("phoneNumberSunbird"));
        assertTrue(sunbirdLoginPage.isDateOfBirthValueForSunbirdCardDisplayed());
        assertEquals(sunbirdLoginPage.getGenderValueForSunbirdCard(), TestDataReader.readData("genderValueSunbird"));
        assertEquals(sunbirdLoginPage.getEmailIdValueForSunbirdCard(), TestDataReader.readData("emailIdValueSunbird"));
        assertEquals(sunbirdLoginPage.getStatusValueForSunbirdCard(), TestDataReader.readData("statusValueSunbird"));
        assertEquals(sunbirdLoginPage.getIdTypeValueForSunbirdCard(), TestDataReader.readData("idTypeSunbird"));

        sunbirdLoginPage.clickOnBackArrow();
        HistoryPage historyPage = homePage.clickOnHistoryButton();

        assertTrue(historyPage.isHistoryPageLoaded(), "Verify if history page is displayed");
        assertTrue(historyPage.verifyHistoryForInsuranceCard(TestDataReader.readData("policyNumberSunbird"), PlatformType.ANDROID));
    }

    @Test
    @NeedsUIN
    public void downloadVcAndVerifyHistoryFromMoreOptions() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

//        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

//        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

//        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

//        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

//        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
//        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        AddNewCardPage addNewCardPage = homePage.downloadCard();

//        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();

        assertTrue(retrieveIdPage.isRetrieveIdPageLoaded(), "Verify if retrieve id page is displayed");
//        String uin = TestDataReader.readData("uin");
        OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(getUIN()).clickOnGenerateCardButton();

        assertTrue(otpVerification.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
        otpVerification.enterOtp(InjiWalletUtil.getOtp(), PlatformType.ANDROID);

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();
//        assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");

        moreOptionsPage.clickOnViewActivityLog();
        HistoryPage historyPage = new HistoryPage(getDriver());
        assertTrue(historyPage.verifyHistory(getUIN(), PlatformType.ANDROID));
    }

    @Test
    @NeedsMockUIN
    public void downloadAndVerifyVcUsingMdlDeleteAndVerifyHistory() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

//        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

//        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

//        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

//        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

//        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
//        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");

        SettingsPage settingsPage = homePage.clickOnSettingIcon();
        settingsPage.clickOnKeyManagement();
        KeyManagementPage keyManagementPage = new KeyManagementPage(getDriver());
        keyManagementPage.clickOnDoneButton();

        IosUtil.dragAndDrop(getDriver(), keyManagementPage.getTheCoordinatesECCR1TextText(), keyManagementPage.getTheCoordinatesED25519Text());
        keyManagementPage.clickOnSaveKeyOrderingPreferenceButton();

        assertTrue(keyManagementPage.iskeyOrderingSuccessTextMessageDisplayed(), "Verify if confirm passcode page is displayed");
        keyManagementPage.clickOnArrowleftButton();
        homePage.clickOnHomeButton();

        AddNewCardPage addNewCardPage = homePage.downloadCard();

//        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
        assertTrue(addNewCardPage.isIssuerDescriptionEsignetDisplayed(), "Verify if issuer description  esignet displayed");
        assertTrue(addNewCardPage.isIssuerSearchBarDisplayed(), "Verify if issuer search bar displayed");
//        addNewCardPage.sendTextInIssuerSearchBar("Download MOSIP Credentials");
//        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
//        assertTrue(addNewCardPage.isAddNewCardPageGuideMessageForEsignetDisplayed(), "Verify if add new card guide message displayed");
//        assertTrue(addNewCardPage.isDownloadViaEsignetDisplayed(), "Verify if download via uin displayed");
        MockCertifyLoginPage mockCertifyLoginPage = addNewCardPage.clickOnDownloadViaMockCertify();

        mockCertifyLoginPage.clickOnEsignetLoginWithOtpButton();

        assertTrue(mockCertifyLoginPage.isEnterYourVidTextDisplayed(), "Verify if Esignet Login page is landed");

        OtpVerificationPage otpVerification = mockCertifyLoginPage.setEnterIdTextBox(getMockUIN());

        mockCertifyLoginPage.clickOnGetOtpButton();
//        assertTrue(mockCertifyLoginPage.isOtpHasSendMessageDisplayed(), "verify if otp page is displayed");

        otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtp(), PlatformType.ANDROID);
        mockCertifyLoginPage.clickOnVerifyButton();

        addNewCardPage.clickOnDoneButton();
//        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();
//        assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");

        moreOptionsPage.clickOnViewActivityLog();
        HistoryPage historyPage = new HistoryPage(getDriver());
        assertTrue(historyPage.verifyHistory(PlatformType.ANDROID));
        homePage.clickOnCrossIconButton();

        homePage.clickOnMoreOptionsButton();
        assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");
        moreOptionsPage.clickOnViewActivityLog();
        assertTrue(historyPage.verifyHistory(PlatformType.ANDROID));
    }


    @Test
    public void downloadAndVerifyVcUsingMockDeleteAndVerifyHistory() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

//        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

//        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

//        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

//        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

//        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
//        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        AddNewCardPage addNewCardPage = homePage.downloadCard();

//        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
//        assertTrue(addNewCardPage.isIssuerDescriptionEsignetDisplayed(), "Verify if issuer description  esignet displayed");
//        assertTrue(addNewCardPage.isIssuerSearchBarDisplayed(), "Verify if issuer search bar displayed");
//        addNewCardPage.sendTextInIssuerSearchBar("Download MOSIP Credentials");
//        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
        assertTrue(addNewCardPage.isAddNewCardPageGuideMessageForEsignetDisplayed(), "Verify if add new card guide message displayed");
        assertTrue(addNewCardPage.isDownloadViaEsignetDisplayed(), "Verify if download via uin displayed");
        MockCertifyLoginPage mockCertifyLoginPage = new MockCertifyLoginPage(getDriver());

        addNewCardPage.clickOnDownloadViaMock();
        mockCertifyLoginPage.clickOnEsignetLoginWithOtpButton();

//        assertTrue(mockCertifyLoginPage.isEnterYourVidTextDisplayed(), "Verify if Esignet Login page is landed");

        OtpVerificationPage otpVerification = mockCertifyLoginPage.setEnterIdTextBox(TestDataReader.readData("Mock"));

        mockCertifyLoginPage.clickOnGetOtpButton();
//        assertTrue(mockCertifyLoginPage.isOtpHasSendMessageDisplayed(), "verify if otp page is displayed");

        otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtp(), PlatformType.ANDROID);
        mockCertifyLoginPage.clickOnVerifyButton();

        addNewCardPage.clickOnDoneButton();
//        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();
//        assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");

        moreOptionsPage.clickOnViewActivityLog();
        HistoryPage historyPage = new HistoryPage(getDriver());
        assertTrue(historyPage.verifyHistory(PlatformType.ANDROID));
        homePage.clickOnCrossIconButton();

        homePage.clickOnMoreOptionsButton();
        assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");
        moreOptionsPage.clickOnViewActivityLog();
        assertTrue(historyPage.verifyHistoryForMock(PlatformType.ANDROID));
    }
}
