package inji.testcases.androidTestCases.sanityFlows;

import inji.annotations.NeedsMockUIN;
import inji.constants.InjiWalletConstants;
import inji.constants.PlatformType;
import inji.pages.*;
import inji.testcases.BaseTest.AndroidBaseTest;
import inji.utils.InjiWalletUtil;
import inji.utils.TestDataReader;
import org.testng.annotations.Test;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

public class ShareAndReceiveCardSanityTest extends AndroidBaseTest {

  @Test
  @NeedsMockUIN
  public void shareVcAndReceiveVc(){
    ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

    WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

    AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

    SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

    ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE),
      PlatformType.ANDROID);

    HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE),
      PlatformType.ANDROID);

    homePage.clickOnNextButtonForInjiTour();

    //Download VC

    AddNewCardPage addNewCardPage = homePage.downloadCard();
    assertTrue(addNewCardPage.isIssuerDescriptionEsignetDisplayed(),
      "Verify if issuer description  esignet displayed");

    ESignetLoginPage esignetLoginPage = executeStep("Download VC via eSignet",
      () -> addNewCardPage.clickOnDownloadViaMockSdJwt());

    addNewCardPage.clickOnContinueButton();
    OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getMockUIN());
    esignetLoginPage.clickOnHideKeyboardAndGetOtpButton();

    executeStep("Enter OTP for eSignet verification",
      () -> otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtpForMock(), PlatformType.ANDROID));
    esignetLoginPage.clickOnVerifyButton();

    executeStep("Complete VC download",
      () -> addNewCardPage.clickOnDoneButton());
    assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");

    //Share Test

    homePage.clickOnShareButton();
    SharePage sharePage = new SharePage(getDriver());
    sharePage.acceptPermissionPopupCamera();
    assertTrue(sharePage.isCameraPageLoaded(), "Verify camera page is displayed");
    assertTrue(sharePage.isFlipCameraClickable(), "Verify if flip camera is enabled");

    //receive Test

    SettingsPage settingsPage = homePage.clickOnSettingIcon();

    assertEquals(settingsPage.getReceiveCardText(), "Receive Card");
    assertTrue(settingsPage.isReceivedCardsPresent(), "Verify if received cards tab is displayed");
    ReceiveCardPage receiveCardPage = settingsPage.clickOnReceiveCard();

    receiveCardPage.clickOnAllowButton();
    assertTrue(receiveCardPage.isReceiveCardHeaderDisplayed(), "Verify if QR code  header is displayed");
    assertTrue(receiveCardPage.isWaitingForConnectionDisplayed(), "Verify if waiting for connection displayed");
  }
}
