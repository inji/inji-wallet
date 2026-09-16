package inji.testcases.iosTestCases;

import inji.annotations.NeedsMockUIN;
import inji.annotations.NeedsSunbirdPolicy;
import inji.annotations.NeedsUIN;
import inji.constants.InjiWalletConstants;
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
    public void downloadAndVerifyVcUsingUinViaEsignet() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);

        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
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

        OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getUIN());

        esignetLoginPage.clickOnGetOtpButton();

        otpVerification.enterOtpForeSignet(uinGetOtp(), PlatformType.IOS);
        esignetLoginPage.clickOnVerifyButtonIos();

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();
        assertTrue(detailedVcViewPage.isDetailedVcViewPageLoaded(), "Verify if detailed Vc view page is displayed");

    }


    @Test
    @NeedsMockUIN
    public void downloadAndVerifyVcUsingUinViaMock() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);

        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
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

        assertTrue(addNewCardPage.isAddNewCardPageGuideMessageForEsignetDisplayed(), "Verify if add new card guide message displayed");
        assertTrue(addNewCardPage.isDownloadViaEsignetOptionDisplayed(), "Verify if download via uin displayed");

        MockCertifyLoginPage mockCertifyLoginPage = addNewCardPage.clickOnDownloadViaMockCertify();

        addNewCardPage.clickOnContinueButtonInSigninPopupIos();

        OtpVerificationPage otpVerification = mockCertifyLoginPage.setEnterIdTextBox(getMockUIN());

        mockCertifyLoginPage.clickOnGetOtpButton();

        otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtpForMock(), PlatformType.IOS);
        mockCertifyLoginPage.clickOnVerifyButtonIos();

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();
        assertTrue(detailedVcViewPage.isDetailedVcViewPageLoaded(), "Verify if detailed Vc view page is displayed");

    }

    @Test
    @NeedsSunbirdPolicy
    public void downloadAndVerifyVcUsingUinViaSunbird() {

        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);

        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
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
        sunbirdLoginPage.enterPolicyNumber(getPolicyNumber());
        sunbirdLoginPage.enterFullName(getPolicyName());
        sunbirdLoginPage.enterDateOfBirth();
        IosUtil.scrollToElement(getDriver(), 100, 800, 100, 200);
        sunbirdLoginPage.clickOnLoginButton();

        assertTrue(sunbirdLoginPage.isSunbirdCardActive(), "Verify if download sunbird displayed active");
        assertTrue(sunbirdLoginPage.isSunbirdCardLogoDisplayed(), "Verify if download sunbird logo displayed");
        sunbirdLoginPage.openDetailedSunbirdVcView();
    }

}
