package inji.testcases.iosTestCases;

import inji.annotations.NeedsMockUIN;

import inji.constants.PlatformType;
import inji.pages.*;
import inji.testcases.BaseTest.IosBaseTest;
import inji.utils.InjiWalletUtil;
import inji.utils.TestDataReader;
import org.testng.annotations.Test;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import static org.testng.Assert.assertTrue;
import inji.annotations.NeedsLandUIN;

public class VcDownloadAndVerifyUsingLandRegistryTest extends IosBaseTest {
	private static final Logger logger = LogManager.getLogger(VcDownloadAndVerifyUsingLandRegistryTest.class);
	
    @Test
    @NeedsLandUIN
    public void downloadAndVerifyVcUsingLandStatement() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);
        homePage.clickOnNextButtonForInjiTour();
        AddNewCardPage addNewCardPage = homePage.downloadCard();
        ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaLandRegistry();
        addNewCardPage.clickOnContinueButtonInSigninPopupIos();
        esignetLoginPage.clickOnLoginWithOtpButton();
        OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getLandUIN());
        esignetLoginPage.clickOnGetOtpButton();
        otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtp(), PlatformType.IOS);
        esignetLoginPage.clickOnVerifyButtonIos();
        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();
        assertTrue(detailedVcViewPage.isDetailedVcViewPageLoaded(), "Verify if detailed Vc view page is displayed");

    }

    @Test
    @NeedsLandUIN
    public void downloadAndVerifyVcUsingLandStatementFiveTimes() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);
        homePage.clickOnNextButtonForInjiTour();
        // Loop to download VC 5 times
        for (int i = 1; i <= 5; i++) {
        	logger.info("=== Starting VC Download Iteration " + i + " ===");
            AddNewCardPage addNewCardPage = homePage.downloadCard();
            ESignetLoginPage esignetLoginPage = addNewCardPage.clickOnDownloadViaLandRegistry();
            addNewCardPage.clickOnContinueButtonInSigninPopupIos();
            esignetLoginPage.clickOnLoginWithOtpButton();
            OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getLandUIN());
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


