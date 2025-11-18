package inji.testcases.iosTestCases;

import inji.annotations.NeedsMockUIN;
import inji.constants.PlatformType;
import inji.pages.*;
import inji.testcases.BaseTest.IosBaseTest;
import inji.utils.InjiWalletUtil;
import inji.utils.TestDataReader;
import org.testng.annotations.Test;

import static org.testng.Assert.assertTrue;

public class VcDownloadAndVerifyUsingLandRegistryTest extends IosBaseTest {
    @Test
    @NeedsMockUIN
    public void downloadAndVerifyVcUsingLandStatement() throws InterruptedException {
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
        AddNewCardPage addNewCardPage = homePage.downloadCard();
        ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaLandRegistry();
        addNewCardPage.clickOnContinueButtonInSigninPopupIos();
        esignetLoginPage.clickOnLoginWithOtpButton();
//		OtpVerificationPage otpVerification = esignetLoginPage
//				.setEnterIdTextBox(TestDataReader.readData("LandRegistry"));
        OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(AddNewCardPage.LandRegistryUIN);
        esignetLoginPage.clickOnGetOtpButton();
        otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtp(), PlatformType.IOS);
        esignetLoginPage.clickOnVerifyButtonIos();
        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();
        assertTrue(detailedVcViewPage.isDetailedVcViewPageLoaded(), "Verify if detailed Vc view page is displayed");

    }

    @Test
    @NeedsMockUIN
    public void downloadAndVerifyVcUsingLandStatementFiveTimes() throws InterruptedException {
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
        // Loop to download VC 5 times
        for (int i = 1; i <= 5; i++) {
            System.out.println("=== Starting VC Download Iteration " + i + " ===");
            AddNewCardPage addNewCardPage = homePage.downloadCard();
            ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaLandRegistry();
            addNewCardPage.clickOnContinueButtonInSigninPopupIos();
            esignetLoginPage.clickOnLoginWithOtpButton();
//		OtpVerificationPage otpVerification = esignetLoginPage
//				.setEnterIdTextBox(TestDataReader.readData("LandRegistry"));
            OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(AddNewCardPage.LandRegistryUIN);
            esignetLoginPage.clickOnGetOtpButton();
            otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtp(), PlatformType.IOS);
            esignetLoginPage.clickOnVerifyButtonIos();
            if (i==1) {addNewCardPage.clickOnDoneButton();}
            assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
            DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();
            assertTrue(detailedVcViewPage.isDetailedVcViewPageLoaded(), "Verify if detailed Vc view page is displayed");
            detailedVcViewPage.clickOnCrossIcon();
            detailedVcViewPage.clickOnBackArrow();
        }
    }
}


