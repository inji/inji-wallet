package inji.testcases.iosTestCases;

import inji.annotations.NeedsSunbirdPolicy;
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

public class PinVcTest extends IosBaseTest {

    @Test
    public void pinVc() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
        AddNewCardPage addNewCardPage = homePage.downloadCard();
        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();
        OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(getUIN()).clickOnGenerateCardButton();
        otpVerification.enterOtp(uinGetOtp(), PlatformType.IOS);

        addNewCardPage.clickOnDoneButton();
        MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();
        moreOptionsPage.clickOnPinOrUnPinCard();

        assertTrue(homePage.isPinIconDisplayed(), "Verify if pin icon on vc is displayed");
        homePage.clickOnMoreOptionsButton();
        HistoryPage historyPage = moreOptionsPage.clickOnViewActivityLog();
        assertTrue(historyPage.verifyHistory(getUIN(), PlatformType.IOS));
    }

    @Test
    public void VerifyCameraOpenAfterPinVc() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
        AddNewCardPage addNewCardPage = homePage.downloadCard();
        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();
        OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(getUIN()).clickOnGenerateCardButton();
        otpVerification.enterOtp(uinGetOtp(), PlatformType.IOS);

        addNewCardPage.clickOnDoneButton();
        MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();
        moreOptionsPage.clickOnPinOrUnPinCard();

        assertTrue(homePage.isPinIconDisplayed(), "Verify if pin icon on vc is displayed");
        SharePage scanPage = homePage.clickOnShareButton();
        scanPage.acceptPermissionPopupBluetoothIos();
        scanPage.acceptPermissionPopupCameraIos();

        assertTrue(scanPage.isCameraPageLoaded(), "Verify camera page is displayed");
        assertTrue(scanPage.isFlipCameraClickable(), "Verify if flip camera is enabled");
        assertTrue(scanPage.isCameraOpen(), "Verify if camera is displayed");
    }

    @Test
    public void downloadVcViaEsignetAndPinUnpin() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        AddNewCardPage addNewCardPage = homePage.downloadCard();

        ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaEsignet();
        esignetLoginPage.clickOnCredentialTypeHeadingMOSIPVerifiableCredential();
        addNewCardPage.clickOnContinueButtonInSigninPopupIos();

        esignetLoginPage.clickOnEsignetLoginWithOtpButton();
        OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getUIN());
        esignetLoginPage.clickOnGetOtpButton();

        otpVerification.enterOtpForeSignet(uinGetOtp(), PlatformType.IOS);
        esignetLoginPage.clickOnVerifyButtonIos();

        addNewCardPage.clickOnDoneButton();
        MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();
        moreOptionsPage.clickOnPinOrUnPinCard();

        homePage.clickOnNextButtonForInjiTour();
        homePage.downloadCard();

        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();
        retrieveIdPage.setEnterIdTextBox(TestDataReader.readData("uin2")).clickOnGenerateCardButton();
        otpVerification.enterOtp(uinGetOtp(), PlatformType.IOS);

        homePage.clickOnMoreOptionsButton();

        assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");
        moreOptionsPage.clickOnPinOrUnPinCard();
    }

    @Test
    public void verifyMessageAfterDenyBluetoothPopup() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
        AddNewCardPage addNewCardPage = homePage.downloadCard();
        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();
        OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(getUIN()).clickOnGenerateCardButton();
        otpVerification.enterOtp(uinGetOtp(), PlatformType.IOS);

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();
        moreOptionsPage.clickOnPinOrUnPinCard();

        assertTrue(homePage.isPinIconDisplayed(), "Verify if pin icon on vc is displayed");
        SharePage scanPage = homePage.clickOnShareButton();
        scanPage.denyPermissionPopupBluetoothIos();
        assertEquals(scanPage.isEnableBluetoothButtonButtonDisplayed(), "Allow bluetooth permissions");
    }

    @Test
    @NeedsSunbirdPolicy
    public void pinEsignetVcMultipleTimes() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
        AddNewCardPage addNewCardPage = homePage.downloadCard();
        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();
        OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(getUIN()).clickOnGenerateCardButton();
        otpVerification.enterOtp(uinGetOtp(), PlatformType.IOS);

        homePage.downloadCard();

        SunbirdLoginPage sunbirdLoginPage = addNewCardPage.clickOnDownloadViaSunbird();
        addNewCardPage.clickOnCredentialTypeHeadingInsuranceCredential();
        addNewCardPage.clickOnContinueButtonInSigninPopupIos();
        sunbirdLoginPage.enterPolicyNumber(getPolicyNumber());
        sunbirdLoginPage.enterFullName(getPolicyName());
        sunbirdLoginPage.enterDateOfBirth();
        IosUtil.scrollToElement(getDriver(), 100, 800, 100, 200);
        sunbirdLoginPage.clickOnLoginButton();

        assertTrue(sunbirdLoginPage.isSunbirdCardActive(), "Verify if download sunbird displayed active");

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();
        moreOptionsPage.clickOnPinOrUnPinCard();

        assertTrue(homePage.isPinIconDisplayed(), "Verify if pin icon on vc is displayed");

        homePage.clickOnMoreOptionsButton();
        moreOptionsPage.clickOnPinOrUnPinCard();
        homePage.clickOnSecondVcEllipsis();
        moreOptionsPage.clickOnPinOrUnPinCard();
        assertTrue(homePage.isPinIconDisplayed(), "Verify if pin icon on vc is displayed");

        homePage.clickOnSecondVcEllipsis();
        assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");
        moreOptionsPage.clickOnPinOrUnPinCard();

        assertTrue(homePage.isPinIconDisplayed(), "Verify if pin icon on vc is displayed");
    }

    @Test
    @NeedsSunbirdPolicy
    public void pinMosipVcMultipleTimes() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);

        AddNewCardPage addNewCardPage = homePage.downloadCard();
        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();
        OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(getUIN()).clickOnGenerateCardButton();
        otpVerification.enterOtp(uinGetOtp(), PlatformType.IOS);

        homePage.downloadCard();

        SunbirdLoginPage sunbirdLoginPage = addNewCardPage.clickOnDownloadViaSunbird();
        addNewCardPage.clickOnCredentialTypeHeadingInsuranceCredential();
        addNewCardPage.clickOnContinueButtonInSigninPopupIos();
        sunbirdLoginPage.enterPolicyNumber(getPolicyNumber());
        sunbirdLoginPage.enterFullName(getPolicyName());
        sunbirdLoginPage.enterDateOfBirth();
        IosUtil.scrollToElement(getDriver(), 100, 800, 100, 200);
        sunbirdLoginPage.clickOnLoginButton();

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        MoreOptionsPage moreOptionsPage = new MoreOptionsPage(getDriver());
        homePage.clickOnSecondVcEllipsis();
        moreOptionsPage.clickOnPinOrUnPinCard();
        assertTrue(homePage.isPinIconDisplayed(), "Verify if pin icon on vc is displayed");

        homePage.clickOnFirstVcEllipsis();
        moreOptionsPage.clickOnPinOrUnPinCard();

        homePage.clickOnFirstVcEllipsis();
        moreOptionsPage.clickOnPinOrUnPinCard();
        assertTrue(homePage.isPinIconDisplayed(), "Verify if pin icon on vc is displayed");
        homePage.clickOnFirstVcEllipsis();
        moreOptionsPage.clickOnPinOrUnPinCard();

        homePage.clickOnSecondVcEllipsis();
        assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");
        moreOptionsPage.clickOnPinOrUnPinCard();
        assertTrue(homePage.isPinIconDisplayed(), "Verify if pin icon on vc is displayed");
    }

    @Test
    public void pinVcInDetailedVcView() {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);

        AddNewCardPage addNewCardPage = homePage.downloadCard();
        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();
        OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(getUIN()).clickOnGenerateCardButton();
        otpVerification.enterOtp(uinGetOtp(), PlatformType.IOS);

        addNewCardPage.clickOnDoneButton();

        DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();
        assertTrue(detailedVcViewPage.isDetailedVcViewPageLoaded(), "Verify if detailed Vc view page is displayed");

        detailedVcViewPage.clickOnMoreOptionsInDetails();

        MoreOptionsPage moreOptionsPage = new MoreOptionsPage(getDriver());
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
}
