package inji.testcases.iosTestCases;

import inji.annotations.NeedsMockUIN;
import inji.annotations.NeedsSunbirdPolicy;
import inji.annotations.NeedsUIN;
import inji.constants.PlatformType;
import inji.pages.*;
import inji.testcases.BaseTest.IosBaseTest;
import inji.utils.InjiWalletUtil;
import inji.utils.IosUtil;
import inji.utils.TestDataReader;
import org.testng.annotations.Test;

import static org.testng.Assert.assertTrue;

public class KeyManagmentTest extends IosBaseTest {
    @Test
    @NeedsUIN
    public void downloadAndVerifyVcUsingUinViaEsignet() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

//        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

//        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

//        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

//        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

//        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
//        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        settingsPage.clickOnKeyManagement();
        KeyManagementPage keyManagementPage = new KeyManagementPage(getDriver());
        keyManagementPage.clickOnDoneButton();
        IosUtil.dragAndDropForIos(getDriver(), keyManagementPage.getTheCoordinatesForRSA(), keyManagementPage.getTheCoordinatesED25519Text());
        keyManagementPage.clickOnSaveKeyOrderingPreferenceButton();

        assertTrue(keyManagementPage.iskeyOrderingSuccessTextMessageDisplayed(), "Verify if confirm passcode page is displayed");
        keyManagementPage.clickOnGoBackButton();

        homePage.clickOnHomeButton();
        AddNewCardPage addNewCardPage = homePage.downloadCard();

        ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();
        addNewCardPage.clickOnContinueButtonInSigninPopupIos();

//        esignetLoginPage.clickOnEsignetLoginWithOtpButton();
//        String uin = TestDataReader.readData("uin");
        OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getUIN());

        esignetLoginPage.clickOnGetOtpButton();

        otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtp(), PlatformType.IOS);
        esignetLoginPage.clickOnVerifyButtonIos();

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();
        assertTrue(detailedVcViewPage.isDetailedVcViewPageLoaded(), "Verify if detailed Vc view page is displayed");
//        assertTrue(keyManagementPage.compareListOfKeys());

    }


    @Test
    @NeedsMockUIN
    public void downloadAndVerifyVcUsingUinViaMock() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

//        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

//        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

//        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

//        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

//        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
//        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        settingsPage.clickOnKeyManagement();
        KeyManagementPage keyManagementPage = new KeyManagementPage(getDriver());
        keyManagementPage.clickOnDoneButton();

        IosUtil.dragAndDropForIos(getDriver(), keyManagementPage.getTheCoordinatesForRSA(), keyManagementPage.getTheCoordinatesED25519Text());
        keyManagementPage.clickOnSaveKeyOrderingPreferenceButton();

        assertTrue(keyManagementPage.iskeyOrderingSuccessTextMessageDisplayed(), "Verify if confirm passcode page is displayed");
        keyManagementPage.clickOnGoBackButton();

        homePage.clickOnHomeButton();
        AddNewCardPage addNewCardPage = homePage.downloadCard();

//        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
        assertTrue(addNewCardPage.isAddNewCardPageGuideMessageForEsignetDisplayed(), "Verify if add new card guide message displayed");
        assertTrue(addNewCardPage.isDownloadViaEsignetDisplayed(), "Verify if download via uin displayed");
        MockCertifyLoginPage mockCertifyLoginPage = addNewCardPage.clickOnDownloadViaMockCertify();

        addNewCardPage.clickOnContinueButtonInSigninPopupIos();
        ESignetLoginPage esignetLoginPage = new ESignetLoginPage(getDriver());
        esignetLoginPage.clickOnLoginWithOtpButton();
//        esignetLoginPage.clickOnEsignetLoginWithOtpButton();

        OtpVerificationPage otpVerification = mockCertifyLoginPage.setEnterIdTextBox(getMockUIN());

        mockCertifyLoginPage.clickOnGetOtpButton();
//        assertTrue(mockCertifyLoginPage.isOtpHasSendMessageDisplayed(),"verify if otp page is displayed");

        otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtp(), PlatformType.IOS);
        mockCertifyLoginPage.clickOnVerifyButtonIos();
        
        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();
        assertTrue(detailedVcViewPage.isDetailedVcViewPageLoaded(), "Verify if detailed Vc view page is displayed");

    }

    @Test
    @NeedsSunbirdPolicy
    public void downloadAndVerifyVcUsingUinViaSunbird() throws InterruptedException {

        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

//        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

//        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

//        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

//        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

//        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
//        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        settingsPage.clickOnKeyManagement();
        KeyManagementPage keyManagementPage = new KeyManagementPage(getDriver());
        keyManagementPage.clickOnDoneButton();

        IosUtil.dragAndDropForIos(getDriver(), keyManagementPage.getTheCoordinatesForRSA(), keyManagementPage.getTheCoordinatesED25519Text());
        keyManagementPage.clickOnSaveKeyOrderingPreferenceButton();

        assertTrue(keyManagementPage.iskeyOrderingSuccessTextMessageDisplayed(), "Verify if key ordering success message is displayed");
        keyManagementPage.clickOnCloseButton();
        keyManagementPage.clickOnGoBackButton();

        homePage.clickOnHomeButton();
        AddNewCardPage addNewCardPage = homePage.downloadCard();
        SunbirdLoginPage sunbirdLoginPage = addNewCardPage.clickOnDownloadViaSunbird();
        addNewCardPage.clickOnCredentialTypeHeadingInsuranceCredential();
//        addNewCardPage.clickOnContinueButtonInSigninPopupIos();
        sunbirdLoginPage.enterPolicyNumber(getPolicyNumber());
        sunbirdLoginPage.enterFullName(getPolicyName());
        sunbirdLoginPage.enterDateOfBirth();
        IosUtil.scrollToElement(getDriver(), 100, 800, 100, 200);
        sunbirdLoginPage.clickOnLoginButton();

        assertTrue(sunbirdLoginPage.isSunbirdCardActive(), "Verify if download sunbird displayed active");
        assertTrue(sunbirdLoginPage.isSunbirdCardLogoDisplayed(), "Verify if download sunbird logo displayed");
        sunbirdLoginPage.openDetailedSunbirdVcView();
//        assertTrue(keyManagementPage.compareListOfKeys());
    }


}
