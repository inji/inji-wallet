package androidTestCases;

import BaseTest.AndroidBaseTest;
import inji.api.BaseTestCase;
import inji.constants.Target;
import inji.pages.*;
import inji.utils.IosUtil;
import inji.utils.TestDataReader;
import org.testng.annotations.Test;
import org.testng.asserts.SoftAssert;

import static inji.api.AdminTestUtil.fullName;
import static inji.api.AdminTestUtil.policyNumber;
import static inji.api.BaseTestCase.uin;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

public class keyManagement extends AndroidBaseTest {
    @Test
    public void downloadAndVerifyVcUsingUinViaSunbird() throws InterruptedException {
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

        SettingsPage settingsPage = homePage.clickOnSettingIcon();
        settingsPage.clickOnKeyManagement();
        Thread.sleep(3000);
        KeyManagementPage keyManagementPage = new KeyManagementPage(driver);
        keyManagementPage.clickOnDoneButton();
        Thread.sleep(3000);

        IosUtil.dragAndDrop(driver, keyManagementPage.getTheCoordinatesForRSA(), keyManagementPage.getTheCoordinatesED25519Text());
        keyManagementPage.clickOnSaveKeyOrderingPreferenceButton();

        assertTrue(keyManagementPage.iskeyOrderingSuccessTextMessageDisplayed(), "Verify if confirm passcode page is displayed");
        keyManagementPage.clickOnArrowleftButton();

        homePage.clickOnHomeButton();
        AddNewCardPage addNewCardPage = homePage.downloadCard();

        SunbirdLoginPage sunbirdLoginPage = addNewCardPage.clickOnDownloadViaSunbird();
        addNewCardPage.clickOnCredentialTypeHeadingInsuranceCredential();
        EsignetLoginPage esignetLoginPage = new EsignetLoginPage(driver);
        esignetLoginPage.clickOnEsignetLoginWithOtpButton();

        sunbirdLoginPage.enterPolicyNumberTextBox(policyNumber);
        sunbirdLoginPage.enterFullNameTextBox(fullName);
        sunbirdLoginPage.enterDateOfBirthTextBox();
        sunbirdLoginPage.clickOnloginButton();

        assertTrue(sunbirdLoginPage.isSunbirdCardIsActive(), "Verify if download sunbird displayed active");
        assertTrue(sunbirdLoginPage.isSunbirdCardLogoIsDisplayed(), "Verify if download sunbird logo displayed");
//        assertEquals(sunbirdLoginPage.getFullNameForSunbirdCard(), TestDataReader.readData("fullNameSunbird"));
        sunbirdLoginPage.openDetailedSunbirdVcView();
        assertEquals(sunbirdLoginPage.getFullNameForSunbirdCard(), TestDataReader.readData("fullNameSunbird"));
//        assertTrue(keyManagementPage.compareListOfKeys());

    }

    @Test
    public void downloadAndVerifyVcUsingMockIdentity() throws InterruptedException {
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

        SettingsPage settingsPage = homePage.clickOnSettingIcon();
        settingsPage.clickOnKeyManagement();
        Thread.sleep(3000);
        KeyManagementPage keyManagementPage = new KeyManagementPage(driver);
        keyManagementPage.clickOnDoneButton();
        Thread.sleep(3000);

        IosUtil.dragAndDrop(driver, keyManagementPage.getTheCoordinatesECCR1TextText(), keyManagementPage.getTheCoordinatesED25519Text());
        keyManagementPage.clickOnSaveKeyOrderingPreferenceButton();

        assertTrue(keyManagementPage.iskeyOrderingSuccessTextMessageDisplayed(), "Verify if confirm passcode page is displayed");
        keyManagementPage.clickOnArrowleftButton();

        homePage.clickOnHomeButton();
        AddNewCardPage addNewCardPage = homePage.downloadCard();

        MockCertifyLoginPage mockCertifyLoginPage = addNewCardPage.clickOnDownloadViaMockCertify();

        mockCertifyLoginPage.clickOnEsignetLoginWithOtpButton();

        assertTrue(mockCertifyLoginPage.isEnterYourVidTextDisplayed(), "Verify if enter your vid text is displayed");

        OtpVerificationPage otpVerification = mockCertifyLoginPage.setEnterIdTextBox("9261481024");

        mockCertifyLoginPage.clickOnGetOtpButton();
        assertTrue(mockCertifyLoginPage.isOtpHasSendMessageDisplayed(), "verify if otp page is displayed");

        otpVerification.enterOtpForEsignet(BaseTestCase.getOtp(), Target.ANDROID);
        mockCertifyLoginPage.clickOnVerifyButton();

        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();

        detailedVcViewPage.clickOnQrCodeButton();
        SoftAssert softAssert = new SoftAssert();
        softAssert.assertTrue(detailedVcViewPage.isQrCodeDisplayed(), "Verify if QR Code header is displayed");

        detailedVcViewPage.clickOnQrCrossIcon();
        assertTrue(detailedVcViewPage.isEsignetLogoDisplayed(), "Verify if detailed Vc esignet logo is displayed");
        assertTrue(detailedVcViewPage.isDetailedVcViewPageLoaded(), "Verify if detailed Vc view page is displayed");
        assertEquals(detailedVcViewPage.getIdTypeValueInDetailedVcView(), TestDataReader.readData("idTypeForMobileDrivingLicense"), "Verify if id type is displayed");
        assertEquals(detailedVcViewPage.getStatusInDetailedVcView(), TestDataReader.readData("status"), "Verify if status is displayed");
//        assertTrue(detailedVcViewPage.isKeyTypeVcDetailViewValueDisplayed(), "Verify if key type detailed Vc value displayed");
        IosUtil.scrollToElement(driver, 59, 755, 119, 20);
//        assertTrue(keyManagementPage.compareListOfKeys());

    }

    @Test
    public void downloadAndVerifyVcUsingEsignet() throws InterruptedException {
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

        SettingsPage settingsPage = homePage.clickOnSettingIcon();
        settingsPage.clickOnKeyManagement();
        Thread.sleep(3000);
        KeyManagementPage keyManagementPage = new KeyManagementPage(driver);
        keyManagementPage.clickOnDoneButton();
        Thread.sleep(3000);

        IosUtil.dragAndDrop(driver, keyManagementPage.getTheCoordinatesForRSA(), keyManagementPage.getTheCoordinatesED25519Text());
        keyManagementPage.clickOnSaveKeyOrderingPreferenceButton();

        assertTrue(keyManagementPage.iskeyOrderingSuccessTextMessageDisplayed(), "Verify if confirm passcode page is displayed");
        keyManagementPage.clickOnArrowleftButton();

        homePage.clickOnHomeButton();
        AddNewCardPage addNewCardPage = homePage.downloadCard();

        EsignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();
        esignetLoginPage.clickOnEsignetLoginWithOtpButton();

        assertTrue(esignetLoginPage.isEnterYourVidTextDisplayed(), "Verify if enter your vid text is displayed");
//        String uin = TestDataReader.readData("uin");
        OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(uin);

        esignetLoginPage.clickOnGetOtpButton();
        assertTrue(esignetLoginPage.isOtpHasSendMessageDisplayed(), "verify if otp page is displayed");

        otpVerification.enterOtpForEsignet(BaseTestCase.getOtp(), Target.ANDROID);
        esignetLoginPage.clickOnVerifyButton();

        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();

        detailedVcViewPage.clickOnQrCodeButton();
        SoftAssert softAssert = new SoftAssert();
        softAssert.assertTrue(detailedVcViewPage.isQrCodeDisplayed(), "Verify if QR Code header is displayed");

//        detailedVcViewPage.clickOnQrCrossIcon();
//        assertTrue(detailedVcViewPage.isEsignetLogoDisplayed(), "Verify if detailed Vc esignet logo is displayed");
        assertTrue(detailedVcViewPage.isDetailedVcViewPageLoaded(), "Verify if detailed Vc view page is displayed");
//        assertTrue(keyManagementPage.compareListOfKeys());
    }


    @Test
    public void downloadAndVerifyVcUsingUinViaSunbirdWithEECK1DownloadAndDelete() throws InterruptedException {
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

        SettingsPage settingsPage = homePage.clickOnSettingIcon();
        settingsPage.clickOnKeyManagement();
        Thread.sleep(3000);
        KeyManagementPage keyManagementPage = new KeyManagementPage(driver);
        keyManagementPage.clickOnDoneButton();
        Thread.sleep(3000);

        IosUtil.dragAndDrop(driver, keyManagementPage.getTheCoordinatesECCk1TextText(), keyManagementPage.getTheCoordinatesED25519Text());
        keyManagementPage.clickOnSaveKeyOrderingPreferenceButton();

        assertTrue(keyManagementPage.iskeyOrderingSuccessTextMessageDisplayed(), "Verify if confirm passcode page is displayed");
        keyManagementPage.clickOnArrowleftButton();

        homePage.clickOnHomeButton();
        AddNewCardPage addNewCardPage = homePage.downloadCard();

        SunbirdLoginPage sunbirdLoginPage = addNewCardPage.clickOnDownloadViaSunbird();
        addNewCardPage.clickOnCredentialTypeHeadingInsuranceCredential();
        EsignetLoginPage esignetLoginPage = new EsignetLoginPage(driver);
        esignetLoginPage.clickOnEsignetLoginWithOtpButton();

        sunbirdLoginPage.enterPolicyNumberTextBox(policyNumber);
        sunbirdLoginPage.enterFullNameTextBox(fullName);
        sunbirdLoginPage.enterDateOfBirthTextBox();
        sunbirdLoginPage.clickOnloginButton();

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");

        MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();
        assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");

        PleaseConfirmPopupPage pleaseConfirmPopupPage = moreOptionsPage.clickOnRemoveFromWallet();
        assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if pop up page is displayed");

        pleaseConfirmPopupPage.clickOnConfirmButton();
        assertEquals(homePage.verifyLanguageForNoVCDownloadedPageLoaded(), "Bring your digital identity");
        homePage.downloadCard();
        addNewCardPage.clickOnDownloadViaSunbird();
        addNewCardPage.clickOnCredentialTypeHeadingInsuranceCredential();
        esignetLoginPage.clickOnEsignetLoginWithOtpButton();

        sunbirdLoginPage.enterPolicyNumberTextBox(policyNumber);
        sunbirdLoginPage.enterFullNameTextBox(fullName);
        sunbirdLoginPage.enterDateOfBirthTextBox();
        sunbirdLoginPage.clickOnloginButton();

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");


    }

    @Test
    public void downloadAndVerifyVcUsingUinViaSunbirdWithEECR1() throws InterruptedException {
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

        SettingsPage settingsPage = homePage.clickOnSettingIcon();
        settingsPage.clickOnKeyManagement();
        Thread.sleep(3000);
        KeyManagementPage keyManagementPage = new KeyManagementPage(driver);
        keyManagementPage.clickOnDoneButton();
        Thread.sleep(3000);

        IosUtil.dragAndDrop(driver, keyManagementPage.getTheCoordinatesECCR1TextText(), keyManagementPage.getTheCoordinatesED25519Text());
        keyManagementPage.clickOnSaveKeyOrderingPreferenceButton();

        assertTrue(keyManagementPage.iskeyOrderingSuccessTextMessageDisplayed(), "Verify if confirm passcode page is displayed");
        keyManagementPage.clickOnArrowleftButton();

        homePage.clickOnHomeButton();
        AddNewCardPage addNewCardPage = homePage.downloadCard();

        SunbirdLoginPage sunbirdLoginPage = addNewCardPage.clickOnDownloadViaSunbird();
        addNewCardPage.clickOnCredentialTypeHeadingInsuranceCredential();
        EsignetLoginPage esignetLoginPage = new EsignetLoginPage(driver);
        esignetLoginPage.clickOnEsignetLoginWithOtpButton();

        sunbirdLoginPage.enterPolicyNumberTextBox(policyNumber);
        sunbirdLoginPage.enterFullNameTextBox(fullName);
        sunbirdLoginPage.enterDateOfBirthTextBox();
        sunbirdLoginPage.clickOnloginButton();

        assertTrue(sunbirdLoginPage.isSunbirdCardIsActive(), "Verify if download sunbird displayed active");
        assertTrue(sunbirdLoginPage.isSunbirdCardLogoIsDisplayed(), "Verify if download sunbird logo displayed");
//        assertEquals(sunbirdLoginPage.getFullNameForSunbirdCard(), TestDataReader.readData("fullNameSunbird"));
        sunbirdLoginPage.openDetailedSunbirdVcView();
        assertEquals(sunbirdLoginPage.getFullNameForSunbirdCard(), TestDataReader.readData("fullNameSunbird"));
//        assertTrue(keyManagementPage.compareListOfKeys());

    }

    @Test
    public void downloadAndVerifyVcUsingUinViaMdlWithEECR1() throws InterruptedException {
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

        SettingsPage settingsPage = homePage.clickOnSettingIcon();
        settingsPage.clickOnKeyManagement();
        Thread.sleep(3000);
        KeyManagementPage keyManagementPage = new KeyManagementPage(driver);
        keyManagementPage.clickOnDoneButton();
        Thread.sleep(3000);

        IosUtil.dragAndDrop(driver, keyManagementPage.getTheCoordinatesECCR1TextText(), keyManagementPage.getTheCoordinatesED25519Text());
        keyManagementPage.clickOnSaveKeyOrderingPreferenceButton();

        assertTrue(keyManagementPage.iskeyOrderingSuccessTextMessageDisplayed(), "Verify if confirm passcode page is displayed");
        keyManagementPage.clickOnArrowleftButton();

        homePage.clickOnHomeButton();
        AddNewCardPage addNewCardPage = homePage.downloadCard();

        SunbirdLoginPage sunbirdLoginPage = addNewCardPage.clickOnDownloadViaSunbird();
        addNewCardPage.clickOnCredentialTypeHeadingInsuranceCredential();
        EsignetLoginPage esignetLoginPage = new EsignetLoginPage(driver);
        esignetLoginPage.clickOnEsignetLoginWithOtpButton();

        sunbirdLoginPage.enterPolicyNumberTextBox(policyNumber);
        sunbirdLoginPage.enterFullNameTextBox(fullName);
        sunbirdLoginPage.enterDateOfBirthTextBox();
        sunbirdLoginPage.clickOnloginButton();

        assertTrue(sunbirdLoginPage.isSunbirdCardIsActive(), "Verify if download sunbird displayed active");
        assertTrue(sunbirdLoginPage.isSunbirdCardLogoIsDisplayed(), "Verify if download sunbird logo displayed");
//        assertEquals(sunbirdLoginPage.getFullNameForSunbirdCard(), TestDataReader.readData("fullNameSunbird"));
        sunbirdLoginPage.openDetailedSunbirdVcView();
        assertEquals(sunbirdLoginPage.getFullNameForSunbirdCard(), TestDataReader.readData("fullNameSunbird"));
//        assertTrue(keyManagementPage.compareListOfKeys());

    }


}
