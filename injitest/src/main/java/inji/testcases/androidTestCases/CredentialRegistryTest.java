package inji.testcases.androidTestCases;

import inji.constants.PlatformType;
import inji.pages.*;
import inji.testcases.BaseTest.AndroidBaseTest;
import inji.utils.InjiWalletUtil;
import inji.utils.TestDataReader;
import org.testng.annotations.Test;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

public class CredentialRegistryTest extends AndroidBaseTest {

    @Test
    public void downloadAndVerifyVcInNewEnv() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        CredentialRegistryPage credentialRegistryPage = settingsPage.clickOnCredentialRegistry();

        assertTrue(credentialRegistryPage.isCredentialRegistryTextBoxHeaderDisplayed(), "Verify if CredentialRegistry page is displayed");
        credentialRegistryPage.setEnterIdTextBox(TestDataReader.readData("newEnv")).clickOnSaveButton();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        homePage.clickOnHomeButton();
        AddNewCardPage addNewCardPage = homePage.downloadCard();

        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();
        addNewCardPage.clickOnContinueButton();
        retrieveIdPage.setEnterIdTextBox(TestDataReader.readData("newuin"));
        OtpVerificationPage otpVerification = new OtpVerificationPage(getDriver());

        otpVerification.clickOnGetOtpButton();
        otpVerification.enterOtpFor(InjiWalletUtil.getOtp(), PlatformType.ANDROID);
        ESignetLoginPage esignetLoginPage = new ESignetLoginPage(getDriver());
        esignetLoginPage.clickOnVerifyButton();
        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();

        assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");
        PleaseConfirmPopupPage pleaseConfirmPopupPage = moreOptionsPage.clickOnActivationPending();

        assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if pop up page is displayed");
        OtpVerificationPage otpVerificationPage = pleaseConfirmPopupPage.clickOnConfirmButton();

        assertTrue(otpVerificationPage.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
        otpVerificationPage.enterOtp(TestDataReader.readData("otp"), PlatformType.ANDROID);

        assertTrue(moreOptionsPage.isVcActivatedForOnlineLogin(), "Verify if VC is activated");
        moreOptionsPage.clickOnCloseButton();

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();

    }

    @Test
    public void cancelChangeEnvAndVerify() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        CredentialRegistryPage credentialRegistryPage = settingsPage.clickOnCredentialRegistry();

        assertTrue(credentialRegistryPage.isCredentialRegistryTextBoxHeaderDisplayed(), "Verify if CredentialRegistry page is displayed");
        credentialRegistryPage.setEnterIdTextBox(TestDataReader.readData("newEnv")).clickOnCancelButton();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        homePage.clickOnSettingIcon();
        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");

        settingsPage.clickOnCredentialRegistry();
        assertEquals(credentialRegistryPage.checkEnvNotChanged(), TestDataReader.readData("injiEnv"));
    }

    @Test
    public void downloadAndVerifyVcInInvalidEnv() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        CredentialRegistryPage credentialRegistryPage = settingsPage.clickOnCredentialRegistry();

        assertTrue(credentialRegistryPage.isCredentialRegistryTextBoxHeaderDisplayed(), "Verify if CredentialRegistry page is displayed");
        credentialRegistryPage.setEnterIdTextBox(TestDataReader.readData("invalidenv")).clickOnSaveButton();

        assertTrue(credentialRegistryPage.isCredentialRegistryErrorMessageDisplayed(), "Verify if error message is displayed");
    }
//
//    @Test   // require otp flow for this test
//    public void generateUinInNewEnv() throws InterruptedException {
//        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);
//
//        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
//        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
//
//        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
//        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
//
//        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
//        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
//
//        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
//        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);
//
//        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
//        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);
//
//        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
//        SettingsPage settingsPage = homePage.clickOnSettingIcon();
//
//        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
//        CredentialRegistryPage credentialRegistryPage =settingsPage.clickOnCredentialRegistry();
//
//        assertTrue(credentialRegistryPage.isCredentialRegistryTextBoxHeaderDisplayed(), "Verify if CredentialRegistry page is displayed");
//        credentialRegistryPage.setEnterIdTextBox(TestDataReader.readData("newEnv")).clickOnSaveButton();
//
//        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
//        credentialRegistryPage.clickOnBackArrow();
//
//        AddNewCardPage addNewCardPage = homePage.downloadCard();
//        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
//        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();
//
//        assertTrue(retrieveIdPage.isRetrieveIdPageLoaded(), "Verify if retrieve id page is displayed");
//        GenerateUinOrVidPage generateUinOrVidPage = retrieveIdPage.clickOnGetItNowText();
//
//        assertTrue(generateUinOrVidPage.isGenerateUinOrVidPageLoaded(), "Verify if generate uin or vid page page is displayed");
//        OtpVerificationPage otpVerification = generateUinOrVidPage.enterApplicationID(TestDataReader.readData("newaid")).clickOnGetUinOrVidButton();
//
//        assertTrue(otpVerification.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
//        otpVerification.enterOtp(TestDataReader.readData("otp"), PlatformType.ANDROID);
//
//        assertTrue(retrieveIdPage.isRetrieveIdPageLoaded(), "Verify if retrieve id page is displayed");
//        retrieveIdPage.clickOnGenerateCardButton();
//
//        assertTrue(otpVerification.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
//        otpVerification.enterOtp(TestDataReader.readData("otp"), PlatformType.ANDROID);
//
//        addNewCardPage.clickOnDoneButton();
//        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
//    }
//
//    @Test // require otp flow for this test
//    public void retrivingUinInOtherEnv() throws InterruptedException {
//        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);
//
//        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
//        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
//
//        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
//        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
//
//        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
//        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
//
//        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
//        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);
//
//        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
//        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);
//
//        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
//        SettingsPage settingsPage = homePage.clickOnSettingIcon();
//
//        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
//        CredentialRegistryPage credentialRegistryPage =settingsPage.clickOnCredentialRegistry();
//
//        assertTrue(credentialRegistryPage.isCredentialRegistryTextBoxHeaderDisplayed(), "Verify if CredentialRegistry page is displayed");
//        credentialRegistryPage.setEnterIdTextBox(TestDataReader.readData("newEnv")).clickOnSaveButton();
//
//        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
//        credentialRegistryPage.clickOnBackArrow();
//
//        AddNewCardPage addNewCardPage = homePage.downloadCard();
//        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
//        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();
//
//        assertTrue(retrieveIdPage.isRetrieveIdPageLoaded(), "Verify if retrieve id page is displayed");
//        GenerateUinOrVidPage generateUinOrVidPage = retrieveIdPage.clickOnGetItNowText();
//
//        assertTrue(generateUinOrVidPage.isGenerateUinOrVidPageLoaded(), "Verify if generate uin or vid page page is displayed");
//        generateUinOrVidPage.enterApplicationID(TestDataReader.readData("aid")).clickOnGetUinOrVidButton();
//
//        assertTrue(retrieveIdPage.isAidIsNotReadyYetErrorDisplayed(), "Verify if aid is not ready displayed");
//    }
//
//    @Test // require otp flow for this test
//    public void downloadAndVerifyVcInTwoEnv() throws InterruptedException {
//        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);
//
//        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
//        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
//
//        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
//        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
//
//        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
//        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
//
//        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
//        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);
//
//        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
//        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);
//
//        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
//        SettingsPage settingsPage = homePage.clickOnSettingIcon();
//
//        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
//        CredentialRegistryPage credentialRegistryPage =settingsPage.clickOnCredentialRegistry();
//
//        assertTrue(credentialRegistryPage.isCredentialRegistryTextBoxHeaderDisplayed(), "Verify if CredentialRegistry page is displayed");
//        credentialRegistryPage.setEnterIdTextBox(TestDataReader.readData("newEnv")).clickOnSaveButton();
//
//        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
//        credentialRegistryPage.clickOnBackArrow();
//
//        AddNewCardPage addNewCardPage = homePage.downloadCard();
//        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
//        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();
//
//        assertTrue(retrieveIdPage.isRetrieveIdPageLoaded(), "Verify if retrieve id page is displayed");
//        OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(TestDataReader.readData("newuin")).clickOnGenerateCardButton();
//
//        assertTrue(otpVerification.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
//        otpVerification.enterOtp(TestDataReader.readData("otp"), PlatformType.ANDROID);
//
//        addNewCardPage.clickOnDoneButton();
//        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
//        homePage.clickOnSettingIcon();
//
//        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
//        settingsPage.clickOnCredentialRegistry();
//
//        assertTrue(credentialRegistryPage.isCredentialRegistryTextBoxHeaderDisplayed(), "Verify if CredentialRegistry page is displayed");
//        credentialRegistryPage.setEnterIdTextBox(TestDataReader.readData("injiEnv")).clickOnSaveButton();
//
//        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
//        credentialRegistryPage.clickOnBackArrow();
//
//        homePage.downloadCard();
//        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
//        addNewCardPage.clickOnDownloadViaUin();
//
//        assertTrue(retrieveIdPage.isRetrieveIdPageLoaded(), "Verify if retrieve id page is displayed");
//        String uin = TestDataReader.readData("uin");
//        retrieveIdPage.setEnterIdTextBox(uin).clickOnGenerateCardButton();
//
//        assertTrue(otpVerification.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
//        otpVerification.enterOtp(InjiWalletUtil.getOtp(), PlatformType.ANDROID);
//
//        addNewCardPage.clickOnDoneButton();
//        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");

    /// /        assertTrue(homePage.isSecondNameDisplayed(TestDataReader.readData("fullName")), "Verify if full name is displayed");
//    }
//
//    @Test // require otp flow for this test
//    public void downloadVcAndActivateItInOtherEnv() throws InterruptedException {
//        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);
//
//        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
//        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
//
//        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
//        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
//
//        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
//        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
//
//        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
//        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);
//
//        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
//        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);
//
//        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
//        SettingsPage settingsPage = homePage.clickOnSettingIcon();
//
//        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
//        CredentialRegistryPage credentialRegistryPage =settingsPage.clickOnCredentialRegistry();
//
//        assertTrue(credentialRegistryPage.isCredentialRegistryTextBoxHeaderDisplayed(), "Verify if CredentialRegistry page is displayed");
//        credentialRegistryPage.setEnterIdTextBox(TestDataReader.readData("newEnv")).clickOnSaveButton();
//
//        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
//        credentialRegistryPage.clickOnBackArrow();
//
//        AddNewCardPage addNewCardPage = homePage.downloadCard();
//        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
//        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();
//
//        assertTrue(retrieveIdPage.isRetrieveIdPageLoaded(), "Verify if retrieve id page is displayed");
//        OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(TestDataReader.readData("newuin")).clickOnGenerateCardButton();
//
//        assertTrue(otpVerification.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
//        otpVerification.enterOtp(TestDataReader.readData("otp"), PlatformType.ANDROID);
//
//        addNewCardPage.clickOnDoneButton();
//        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
//        homePage.clickOnSettingIcon();
//
//        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
//        settingsPage.clickOnCredentialRegistry();
//
//        assertTrue(credentialRegistryPage.isCredentialRegistryTextBoxHeaderDisplayed(), "Verify if CredentialRegistry page is displayed");
//        credentialRegistryPage.setEnterIdTextBox(TestDataReader.readData("injiEnv")).clickOnSaveButton();
//
//        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
//        credentialRegistryPage.clickOnBackArrow();
//
//        MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();
//
//        assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");
//        PleaseConfirmPopupPage pleaseConfirmPopupPage = moreOptionsPage.clickOnActivationPending();
//
//        assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if pop up page is displayed");
//        pleaseConfirmPopupPage.clickOnConfirmButton();
//
//        assertTrue(moreOptionsPage.isSomethingIsWrongPopupVisible(), "Verify if somthing went wrong please try again popup displayed");
//    }
//
    @Test
    public void downloadAndVerifyVcInNewEnvForEsignet() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        CredentialRegistryPage credentialRegistryPage = settingsPage.clickOnCredentialRegistry();

        assertTrue(credentialRegistryPage.isCredentialRegistryTextBoxHeaderDisplayed(), "Verify if CredentialRegistry page is displayed");
        credentialRegistryPage.setEnterIdTextBox(TestDataReader.readData("newEnv")).enterUrlToEsignetHostTextBox(TestDataReader.readData("newEnv")).clickOnSaveButton();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        homePage.clickOnHomeButton();

        AddNewCardPage addNewCardPage = homePage.downloadCard();
        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");

        ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();
        addNewCardPage.clickOnContinueButton();
        esignetLoginPage.clickOnEsignetLoginWithOtpButton();

        OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(TestDataReader.readData("newuin"));

        esignetLoginPage.clickOnGetOtpButton();
        assertTrue(esignetLoginPage.isOtpHasSendMessageDisplayed(), "verify if otp page is displayed");

        otpVerification.enterOtpForeSignet(TestDataReader.readData("otp"), PlatformType.ANDROID);
        esignetLoginPage.clickOnVerifyButton();

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();
        detailedVcViewPage.clickOnQrCodeButton();

        detailedVcViewPage.clickOnQrCrossIcon();
        assertTrue(detailedVcViewPage.isEsignetLogoDisplayed(), "Verify if detailed Vc esignet logo is displayed");
        assertTrue(detailedVcViewPage.isDetailedVcViewPageLoaded(), "Verify if detailed Vc view page is displayed");
        assertEquals(detailedVcViewPage.getNameInDetailedVcView(), TestDataReader.readData("fullName"), "Verify if full name is displayed");
        assertEquals(detailedVcViewPage.getGenderInDetailedVcView(), TestDataReader.readData("gender"), "Verify if gender is displayed");
        assertEquals(detailedVcViewPage.getIdTypeValueInDetailedVcView(), TestDataReader.readData("idType"), "Verify if id type is displayed");
        assertEquals(detailedVcViewPage.getStatusInDetailedVcView(), TestDataReader.readData("status"), "Verify if status is displayed");
        assertEquals(detailedVcViewPage.getUinInDetailedVcView(), TestDataReader.readData("newuin"), "Verify if uin is displayed");
        assertEquals(detailedVcViewPage.getPhoneInDetailedVcView(), TestDataReader.readData("phoneNumber"), "Verify if phone number is displayed");
        assertEquals(detailedVcViewPage.getEmailInDetailedVcView(), TestDataReader.readData("externalemail"), "Verify if email is displayed");
        assertTrue(detailedVcViewPage.isActivateButtonDisplayed(), "Verify if activate vc button displayed");
    }

    @Test
    public void downloadAndVerifyVcInInvalidEnvForEsignet() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        CredentialRegistryPage credentialRegistryPage = settingsPage.clickOnCredentialRegistry();

        assertTrue(credentialRegistryPage.isCredentialRegistryTextBoxHeaderDisplayed(), "Verify if CredentialRegistry page is displayed");
        credentialRegistryPage.setEnterIdTextBox(TestDataReader.readData("invalidenv")).enterUrlToEsignetHostTextBox(TestDataReader.readData("invalidenv")).clickOnSaveButton();
        homePage.clickOnHomeButton();

        homePage.downloadCard();
        assertTrue(homePage.verifyLanguageForNoInternetConnectionDisplayed("English"), "Verify if no internet connection is displayed");
    }

    @Test
    public void downloadAndVerifyVcInInvalidEnvForEsignetInFillpino() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnLanguage().clickOnFilipinoLanguage();

        assertTrue(settingsPage.verifyFilipinoLanguage(), "Verify if language is changed to filipino");
        CredentialRegistryPage credentialRegistryPage = settingsPage.clickOnCredentialRegistry();

        assertTrue(credentialRegistryPage.isCredentialRegistryTextBoxHeaderInFilipinoDisplayed(), "Verify if CredentialRegistry page is displayed");
        credentialRegistryPage.setEnterIdTextBox(TestDataReader.readData("invalidenv")).enterUrlToEsignetHostTextBox(TestDataReader.readData("invalidenv")).clickOnSaveButton();

        homePage.clickOnHomeButton();

        homePage.downloadCard();
        assertTrue(homePage.verifyLanguageForNoInternetConnectionDisplayed("Filipino"), "Verify if no internet connection is displayed");
    }


//    @Test // require otp flow for this test
//    public void downloadVcInNewEnvAndVerifyInDetailedVcViewPage() throws InterruptedException {
//        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);
//
//        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
//        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
//
//        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
//        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
//
//        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
//        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
//
//        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
//        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);
//
//        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
//        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);
//
//        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
//        SettingsPage settingsPage = homePage.clickOnSettingIcon();
//
//        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
//        CredentialRegistryPage credentialRegistryPage =settingsPage.clickOnCredentialRegistry();
//
//        assertTrue(credentialRegistryPage.isCredentialRegistryTextBoxHeaderDisplayed(), "Verify if CredentialRegistry page is displayed");
//        credentialRegistryPage.setEnterIdTextBox(TestDataReader.readData("newEnv")).clickOnSaveButton();
//
//        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
//        credentialRegistryPage.clickOnBackArrow();
//        AddNewCardPage addNewCardPage = homePage.downloadCard();
//
//        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
//        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();
//
//        assertTrue(retrieveIdPage.isRetrieveIdPageLoaded(), "Verify if retrieve id page is displayed");
//        OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(TestDataReader.readData("newuin")).clickOnGenerateCardButton();
//
//        assertTrue(otpVerification.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
//        otpVerification.enterOtp(TestDataReader.readData("otp"), PlatformType.ANDROID);
//
//        addNewCardPage.clickOnDoneButton();
//        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
//        MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();
//
//        assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");
//        PleaseConfirmPopupPage pleaseConfirmPopupPage = moreOptionsPage.clickOnActivationPending();
//
//        assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if pop up page is displayed");
//        OtpVerificationPage otpVerificationPage = pleaseConfirmPopupPage.clickOnConfirmButton();
//
//        assertTrue(otpVerificationPage.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
//        otpVerificationPage.enterOtp(TestDataReader.readData("otp"), PlatformType.ANDROID);
//
//        assertTrue(moreOptionsPage.isVcActivatedForOnlineLogin(), "Verify if VC is activated");
//        moreOptionsPage.clickOnCloseButton();
//
//        addNewCardPage.clickOnDoneButton();
//        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
//        DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();
//        assertTrue(detailedVcViewPage.isCredentialRegistryTextDisplayed(),"Verify if is credential registry text displayed");
//        assertEquals(detailedVcViewPage.getCredentialRegistryValue(), TestDataReader.readData("newEnv"), "Verify changed env is displayed in detailed vc");
//
//        detailedVcViewPage.clickOnBackArrow();
//        homePage.clickOnSettingIcon();
//
//        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
//        settingsPage.clickOnCredentialRegistry();
//
//        assertTrue(credentialRegistryPage.isCredentialRegistryTextBoxHeaderDisplayed(), "Verify if CredentialRegistry page is displayed");
//        credentialRegistryPage.setEnterIdTextBox(TestDataReader.readData("injiEnv")).clickOnSaveButton();
//
//        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
//        credentialRegistryPage.clickOnBackArrow();
//        homePage.downloadCard();
//
//
//        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
//        addNewCardPage.clickOnDownloadViaUin();
//
//        assertTrue(retrieveIdPage.isRetrieveIdPageLoaded(), "Verify if retrieve id page is displayed");
//        String uin=TestDataReader.readData("uin");
//        retrieveIdPage.setEnterIdTextBox(uin).clickOnGenerateCardButton();
//
//        assertTrue(otpVerification.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
//        otpVerification.enterOtp(TestDataReader.readData("otp"), PlatformType.ANDROID);
//
//        addNewCardPage.clickOnDoneButton();
//        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
//
//        homePage.openDetailedVcView();
//        assertTrue(detailedVcViewPage.isCredentialRegistryTextDisplayed(),"Verify if is credential registry text displayed");
//        assertEquals(detailedVcViewPage.getCredentialRegistryValue(), TestDataReader.readData("injiEnv"), "Verify inji env is displayed in detailed vc");
//    }

    @Test
    public void downloadAndVerifyVcInNewEnvForMdl() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        CredentialRegistryPage credentialRegistryPage = settingsPage.clickOnCredentialRegistry();

        assertTrue(credentialRegistryPage.isCredentialRegistryTextBoxHeaderDisplayed(), "Verify if CredentialRegistry page is displayed");
        credentialRegistryPage.setEnterIdTextBox(TestDataReader.readData("newEnv")).enterUrlToEsignetHostTextBox(TestDataReader.readData("newEnv")).clickOnSaveButton();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        homePage.clickOnHomeButton();

        AddNewCardPage addNewCardPage = homePage.downloadCard();
        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");

        addNewCardPage.clickOnDownloadViaMockCertify();

        ESignetLoginPage esignetLoginPage = new ESignetLoginPage(getDriver());
        addNewCardPage.clickOnContinueButton();
        esignetLoginPage.clickOnEsignetLoginWithOtpButton();

        OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(TestDataReader.readData("MockVc"));

        esignetLoginPage.clickOnGetOtpButton();
        assertTrue(esignetLoginPage.isOtpHasSendMessageDisplayed(), "verify if otp page is displayed");

        otpVerification.enterOtpForeSignet(TestDataReader.readData("otp"), PlatformType.ANDROID);
        esignetLoginPage.clickOnVerifyButton();

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();
        detailedVcViewPage.clickOnQrCodeButton();

        detailedVcViewPage.clickOnQrCrossIcon();
        assertTrue(detailedVcViewPage.isEsignetLogoDisplayed(), "Verify if detailed Vc esignet logo is displayed");
        assertTrue(detailedVcViewPage.isDetailedVcViewPageLoaded(), "Verify if detailed Vc view page is displayed");
    }

    @Test
    public void downloadAndVerifyVcInNewEnvForMock() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        CredentialRegistryPage credentialRegistryPage = settingsPage.clickOnCredentialRegistry();

        assertTrue(credentialRegistryPage.isCredentialRegistryTextBoxHeaderDisplayed(), "Verify if CredentialRegistry page is displayed");
        credentialRegistryPage.setEnterIdTextBox(TestDataReader.readData("newEnv")).enterUrlToEsignetHostTextBox(TestDataReader.readData("newEnv")).clickOnSaveButton();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        homePage.clickOnHomeButton();

        AddNewCardPage addNewCardPage = homePage.downloadCard();
        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");

        addNewCardPage.clickOnDownloadViaMock();

        ESignetLoginPage esignetLoginPage = new ESignetLoginPage(getDriver());
        addNewCardPage.clickOnContinueButton();
        esignetLoginPage.clickOnEsignetLoginWithOtpButton();

        OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(TestDataReader.readData("Mock"));

        esignetLoginPage.clickOnGetOtpButton();
        assertTrue(esignetLoginPage.isOtpHasSendMessageDisplayed(), "verify if otp page is displayed");

        otpVerification.enterOtpForeSignet(TestDataReader.readData("otp"), PlatformType.ANDROID);
        esignetLoginPage.clickOnVerifyButton();

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();
        detailedVcViewPage.clickOnQrCodeButton();

        detailedVcViewPage.clickOnQrCrossIcon();
        assertTrue(detailedVcViewPage.isEsignetLogoDisplayed(), "Verify if detailed Vc esignet logo is displayed");
        assertTrue(detailedVcViewPage.isDetailedVcViewPageLoaded(), "Verify if detailed Vc view page is displayed");
    }


    @Test
    public void downloadAndVerifyVcInNewEnvForLandStatementCredential() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        CredentialRegistryPage credentialRegistryPage = settingsPage.clickOnCredentialRegistry();

        assertTrue(credentialRegistryPage.isCredentialRegistryTextBoxHeaderDisplayed(), "Verify if CredentialRegistry page is displayed");
        credentialRegistryPage.setEnterIdTextBox(TestDataReader.readData("newEnv")).enterUrlToEsignetHostTextBox(TestDataReader.readData("newEnv")).clickOnSaveButton();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        homePage.clickOnHomeButton();

        AddNewCardPage addNewCardPage = homePage.downloadCard();
        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");

        addNewCardPage.clickOnDownloadViaLand();
        addNewCardPage.clickOncredentialTypeHeadingLandStatementCredential2();

        ESignetLoginPage esignetLoginPage = new ESignetLoginPage(getDriver());
        addNewCardPage.clickOnContinueButton();

        esignetLoginPage.clickOnEsignetLoginWithOtpButton();

        OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(TestDataReader.readData("LandRegistary"));

        esignetLoginPage.clickOnGetOtpButton();

        otpVerification.enterOtpForeSignet(TestDataReader.readData("otp"), PlatformType.ANDROID);
        esignetLoginPage.clickOnVerifyButton();

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();
        detailedVcViewPage.clickOnQrCodeButton();

        detailedVcViewPage.clickOnQrCrossIcon();
        assertTrue(detailedVcViewPage.isEsignetLogoDisplayed(), "Verify if detailed Vc esignet logo is displayed");
        assertTrue(detailedVcViewPage.isDetailedVcViewPageLoaded(), "Verify if detailed Vc view page is displayed");
    }

}