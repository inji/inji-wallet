package inji.testcases.androidTestCases.sanityFlows;


import inji.annotations.NeedsMockUIN;
import inji.constants.InjiWalletConstants;
import inji.constants.PlatformType;
import inji.pages.*;
import inji.testcases.BaseTest.AndroidBaseTest;
import inji.utils.TestDataReader;
import org.testng.annotations.Test;

import static org.testng.Assert.*;


public class DownloadVCInvalidOTPTest extends AndroidBaseTest {
  @Test
  @NeedsMockUIN
  public void downloadVcInvalidOtpWaitThenValidOtp() throws InterruptedException {
// Initial app/setup flow
    ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

    WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

    AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

    SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

    ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.ANDROID);

    HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.ANDROID);

    homePage.clickOnNextButtonForInjiTour();

    AddNewCardPage addNewCardPage = homePage.downloadCard();

    assertTrue(
      addNewCardPage.isAddNewCardPageLoaded(),
      "Verify if add new card page is displayed"
    );

    ESignetLoginPage esignetLoginPage = executeStep("Download VC via eSignet",
      addNewCardPage::clickOnDownloadViaMockSdJwt);

    executeStep(
      "Click eSignet Login with OTP button",
      esignetLoginPage::clickOnEsignetLoginWithOtpButton
    );

    assertTrue(
      esignetLoginPage.isESignetLogoDisplayed(),
      "Verify if eSignet login page is displayed"
    );

    OtpVerificationPage otpVerification =
      esignetLoginPage.setEnterIdTextBox(getMockUIN());

    esignetLoginPage.clickOnGetOtpButton();

    assertTrue(
      esignetLoginPage.isOtpHasSendMessageDisplayed(),
      "Verify if OTP message is displayed"
    );

// Enter invalid OTP
    otpVerification.enterOtp(
      TestDataReader.readData("invalidOtp"),
      PlatformType.ANDROID
    );

    esignetLoginPage.clickOnVerifyButton();

    assertTrue(
      otpVerification.invalidOtpMessageDisplayed(),
      "Verify if invalid OTP message is displayed"
    );

// Wait until resend timer completes
    assertTrue(
      otpVerification.verifyResendButtonIsEnabled(),
      "Verify if resend button is enabled"
    );

// Resend OTP
    otpVerification.clickOnResendButton();

    otpVerification.enterOtp(
      TestDataReader.readData("otp"),
      PlatformType.ANDROID
    );

    esignetLoginPage.clickOnVerifyButton();

// Complete VC download
    executeStep(
      "Complete VC download",
      addNewCardPage::clickOnDoneButton
    );

    assertTrue(
      homePage.isCredentialTypeValueDisplayed(),
      "Verify if credential type value is displayed"
    );
  }
}
