package androidTestCases;

import BaseTest.AndroidBaseTest;
import inji.constants.Target;
import inji.pages.*;
import inji.utils.TestDataReader;
import org.testng.annotations.Test;

import static inji.api.AdminTestUtil.fullName;
import static inji.api.AdminTestUtil.policyNumber;
import static inji.api.BaseTestCase.*;
import static org.testng.Assert.assertTrue;

public class MosipOtpAlternativeFlowForHistoryAndPin extends AndroidBaseTest {

    @Test
    public void pinVcInDetailedVcView() throws InterruptedException  {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), Target.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), Target.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        AddNewCardPage addNewCardPage = homePage.downloadCard();

        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
        EsignetLoginPage esignetLoginPage =  addNewCardPage.clickOnDownloadViaEsignet();
        esignetLoginPage.clickOnEsignetLoginWithOtpButton();

        assertTrue(esignetLoginPage.isEnterYourVidTextDisplayed(), "Verify if enter your vid text is displayed");
//        String uin=TestDataReader.readData("uin");
        OtpVerificationPage otpVerification= esignetLoginPage.setEnterIdTextBox(uin);

        esignetLoginPage.clickOnGetOtpButton();
        assertTrue(esignetLoginPage.isOtpHasSendMessageDisplayed(),"verify if otp page is displayed");

        otpVerification.enterOtpForEsignet(getOtp(), Target.ANDROID);
        esignetLoginPage.clickOnVerifyButton();

        assertTrue(homePage.isDownloadingVcPopupDisplayed(),"verify downloading vc popup displayed");
        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");

        DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();
        assertTrue(detailedVcViewPage.isDetailedVcViewPageLoaded(), "Verify if detailed Vc view page is displayed");

        detailedVcViewPage.clickOnMoreOptionsInDetails();

        MoreOptionsPage moreOptionsPage = new MoreOptionsPage(driver);
        assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");
        moreOptionsPage.clickOnPinOrUnPinCard();

        detailedVcViewPage.clickOnBackArrow();
        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        assertTrue(homePage.isPinIconDisplayed(), "Verify if pin icon on vc is displayed");

        homePage.openDetailedVcView();
        assertTrue(detailedVcViewPage.isDetailedVcViewPageLoaded(), "Verify if detailed Vc view page is displayed");

        detailedVcViewPage.clickOnMoreOptionsInDetails();
        assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");
        moreOptionsPage.clickOnPinOrUnPinCard();
    }

    @Test
    public void pinEsignetVcMultipleTimes() throws InterruptedException  {

        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), Target.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), Target.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        AddNewCardPage addNewCardPage = homePage.downloadCard();

        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
        assertTrue(addNewCardPage.isIssuerDescriptionEsignetDisplayed(), "Verify if issuer description  esignet displayed");
        assertTrue(addNewCardPage.isIssuerSearchBarDisplayed(), "Verify if issuer search bar displayed");
        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
        assertTrue(addNewCardPage.isAddNewCardPageGuideMessageForEsignetDisplayed(), "Verify if add new card guide message displayed");
        assertTrue(addNewCardPage.isDownloadViaSunbirdDisplayed(), "Verify if download sunbird displayed");
        SunbirdLoginPage sunbirdLoginPage =  addNewCardPage.clickOnDownloadViaSunbird();
        addNewCardPage.clickOnCredentialTypeHeadingInsuranceCredential();

        sunbirdLoginPage.enterPolicyNumberTextBox(policyNumber);
        sunbirdLoginPage.enterFullNameTextBox(fullName);
        sunbirdLoginPage.enterDateOfBirthTextBox();
        sunbirdLoginPage.clickOnloginButton();

        homePage.clickOnDoneButton();

        homePage.downloadCard();

        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
        EsignetLoginPage esignetLoginPage =  addNewCardPage.clickOnDownloadViaEsignet();

        esignetLoginPage.clickOnEsignetLoginWithOtpButton();

        assertTrue(esignetLoginPage.isEnterYourVidTextDisplayed(), "Verify if enter your vid text is displayed");
//        String uin=TestDataReader.readData("uin");
        esignetLoginPage.setEnterIdTextBox(uin);

        esignetLoginPage.clickOnGetOtpButton();
        assertTrue(esignetLoginPage.isOtpHasSendMessageDisplayed(),"verify if otp page is displayed");
        OtpVerificationPage otpVerification = new OtpVerificationPage(driver);

        otpVerification.enterOtpForEsignet(getOtp(), Target.ANDROID);
        esignetLoginPage.clickOnVerifyButton();

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");

        MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();

        assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");
        moreOptionsPage.clickOnPinOrUnPinCard();

        assertTrue(homePage.isPinIconDisplayed(), "Verify if pin icon on vc is displayed");

        homePage.clickOnMoreOptionsButton();

        assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");
        moreOptionsPage.clickOnPinOrUnPinCard();
        // esignet vc pinned
        homePage.clickOnSecondVcEllipsis();
        assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");
        moreOptionsPage.clickOnPinOrUnPinCard();
        assertTrue(homePage.isPinIconDisplayed(), "Verify if pin icon on vc is displayed");

        homePage.clickOnSecondVcEllipsis();
        assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");
        moreOptionsPage.clickOnPinOrUnPinCard();

        assertTrue(homePage.isPinIconDisplayed(), "Verify if pin icon on vc is displayed");
    }

    @Test
    public void pinSubirdVcMultipleTimes() throws InterruptedException  {

        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), Target.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), Target.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        AddNewCardPage addNewCardPage = homePage.downloadCard();

        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
        SunbirdLoginPage sunbirdLoginPage =  addNewCardPage.clickOnDownloadViaSunbird();
        addNewCardPage.clickOnCredentialTypeHeadingInsuranceCredential();

        sunbirdLoginPage.enterPolicyNumberTextBox(policyNumber);
        sunbirdLoginPage.enterFullNameTextBox(fullName);
        sunbirdLoginPage.enterDateOfBirthTextBox();
        sunbirdLoginPage.clickOnloginButton();

        homePage.clickOnDoneButton();
        homePage.downloadCard();

        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
        EsignetLoginPage esignetLoginPage =  addNewCardPage.clickOnDownloadViaEsignet();

        esignetLoginPage.clickOnEsignetLoginWithOtpButton();

        assertTrue(esignetLoginPage.isEnterYourVidTextDisplayed(), "Verify if enter your vid text is displayed");

//        String uin=TestDataReader.readData("uin");
        esignetLoginPage.setEnterIdTextBox(uin);

        esignetLoginPage.clickOnGetOtpButton();
        assertTrue(esignetLoginPage.isOtpHasSendMessageDisplayed(),"verify if otp page is displayed");

        OtpVerificationPage otpVerification = new OtpVerificationPage(driver);
        otpVerification.enterOtpForEsignet(getOtp(), Target.ANDROID);
        esignetLoginPage.clickOnVerifyButton();

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");

        MoreOptionsPage moreOptionsPage = new MoreOptionsPage(driver);
        // mosip vc
        homePage.clickOnSecondVcEllipsis();
        assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");
        moreOptionsPage.clickOnPinOrUnPinCard();
        assertTrue(homePage.isPinIconDisplayed(), "Verify if pin icon on vc is displayed");

        homePage.clickOnSecondVcEllipsis();
        assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");
        moreOptionsPage.clickOnPinOrUnPinCard();
        // pin esignet
        assertTrue(homePage.isPinIconDisplayed(), "Verify if pin icon on vc is displayed");
        homePage.clickOnMoreOptionsButton();

        assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");
        moreOptionsPage.clickOnPinOrUnPinCard();

        //mosip vc
        homePage.clickOnSecondVcEllipsis();
        assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");
        moreOptionsPage.clickOnPinOrUnPinCard();
        assertTrue(homePage.isPinIconDisplayed(), "Verify if pin icon on vc is displayed");

    }

    @Test
    public void verifyActivationFailedRecordInHistory() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), Target.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), Target.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");

        AddNewCardPage addNewCardPage = homePage.downloadCard();

        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
        EsignetLoginPage esignetLoginPage =  addNewCardPage.clickOnDownloadViaEsignet();

        esignetLoginPage.clickOnEsignetLoginWithOtpButton();

        assertTrue(esignetLoginPage.isEnterYourVidTextDisplayed(), "Verify if enter your vid text is displayed");
//        String uin=TestDataReader.readData("uin");
        OtpVerificationPage otpVerification= esignetLoginPage.setEnterIdTextBox(uin);

        esignetLoginPage.clickOnGetOtpButton();
        assertTrue(esignetLoginPage.isOtpHasSendMessageDisplayed(),"verify if otp page is displayed");

        otpVerification.enterOtpForEsignet(getOtp(), Target.ANDROID);
        esignetLoginPage.clickOnVerifyButton();

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();

        assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");
        PleaseConfirmPopupPage pleaseConfirmPopupPage = moreOptionsPage.clickOnActivationPending();

        assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if pop up page is displayed");
        OtpVerificationPage otpVerificationPage = pleaseConfirmPopupPage.clickOnConfirmButton();

        assertTrue(otpVerificationPage.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
        otpVerificationPage.enterOtp(TestDataReader.readData("invalidOtp"), Target.ANDROID);

//        assertTrue(otpVerification.invalidOtpMessageDisplayed(), "Verify if OTP is invalid message is displayed");
//        otpVerificationPage.enterOtp(TestDataReader.readData("invalidOtp"), Target.ANDROID);

        assertTrue(otpVerificationPage.somethingWetWrongInVcActivationDisplayed(), "Verify if Something is wrong. Please try again later displayed");
        assertTrue(otpVerificationPage.isCancelButtonDisplayed(), "Verify if cancel button is displayed");

        HistoryPage historyPage = otpVerificationPage.clickOnCancelButton().clickOnCloseButton().clickOnHistoryButton();
        assertTrue(historyPage.isHistoryPageLoaded(), "Verify if history page is displayed");
        assertTrue(historyPage.verifyActivationFailedRecordInHistory(uin, Target.ANDROID));
    }

    @Test
    public void verifyActivationFailedRecordInHistoryFromDetailedView() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), Target.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), Target.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");

        AddNewCardPage addNewCardPage = homePage.downloadCard();

        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
        EsignetLoginPage esignetLoginPage =  addNewCardPage.clickOnDownloadViaEsignet();

        esignetLoginPage.clickOnEsignetLoginWithOtpButton();

        assertTrue(esignetLoginPage.isEnterYourVidTextDisplayed(), "Verify if enter your vid text is displayed");
//        String uin=TestDataReader.readData("uin");
        OtpVerificationPage otpVerification= esignetLoginPage.setEnterIdTextBox(uin);

        esignetLoginPage.clickOnGetOtpButton();
        assertTrue(esignetLoginPage.isOtpHasSendMessageDisplayed(),"verify if otp page is displayed");

        otpVerification.enterOtpForEsignet(getOtp(), Target.ANDROID);
        esignetLoginPage.clickOnVerifyButton();

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();
        assertTrue(detailedVcViewPage.isDetailedVcViewPageLoaded(), "Verify if detailed Vc view page is displayed");
        PleaseConfirmPopupPage pleaseConfirmPopupPage = detailedVcViewPage.clickOnActivateButtonAndroid();

        assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if pop up page is displayed");
        OtpVerificationPage otpVerificationPage = pleaseConfirmPopupPage.clickOnConfirmButton();

        assertTrue(otpVerificationPage.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
        otpVerificationPage.enterOtp(TestDataReader.readData("invalidOtp"), Target.ANDROID);

        assertTrue(otpVerificationPage.somethingWetWrongInVcActivationDisplayed(), "Verify if Something is wrong. Please try again later displayed");
        assertTrue(otpVerificationPage.isCancelButtonDisplayed(), "Verify if cancel button is displayed");

        otpVerificationPage.clickOnCancelButton();
        HistoryPage historyPage = detailedVcViewPage.clickOnArrowleft().clickOnHistoryButton();
        assertTrue(historyPage.isHistoryPageLoaded(), "Verify if history page is displayed");
        assertTrue(historyPage.verifyActivationFailedRecordInHistory(uin, Target.ANDROID));
    }
}
