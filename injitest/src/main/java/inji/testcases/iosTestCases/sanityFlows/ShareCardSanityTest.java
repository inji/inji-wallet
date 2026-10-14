package inji.testcases.iosTestCases.sanityFlows;

import inji.annotations.NeedsMockUIN;
import inji.constants.InjiWalletConstants;
import inji.constants.PlatformType;
import inji.pages.*;
import inji.utils.InjiWalletUtil;
import inji.utils.TestDataReader;
import inji.testcases.BaseTest.IosBaseTest;
import org.testng.annotations.Test;
import static org.testng.Assert.assertTrue;

public class ShareCardSanityTest extends IosBaseTest {
  @Test
  @NeedsMockUIN
  public void shareVc(){
    ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

    WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

    AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

    SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

    ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE),
      PlatformType.IOS);

    HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE),
      PlatformType.IOS);

    homePage.clickOnNextButtonForInjiTour();

    //Download VC

    AddNewCardPage addNewCardPage = homePage.downloadCard();
    assertTrue(addNewCardPage.isIssuerDescriptionEsignetDisplayed(),
      "Verify if issuer description  esignet displayed");
    assertTrue(addNewCardPage.isIssuerSearchBarDisplayed(),
      "Verify if search bar is displayed");

    executeStep("Entering search text in search bar",
      addNewCardPage::searchAndSelectMockIssuer);
    addNewCardPage.hideKeyboardIos();

    ESignetLoginPage esignetLoginPage = executeStep("Download VC via eSignet",
      addNewCardPage::clickOnDownloadViaMockSdJwt);

    addNewCardPage.clickOnContinueButtonInSigninPopupIos();

    OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getMockUIN());

    esignetLoginPage.clickOnGetOtpButton();
    executeStep("Enter OTP for eSignet verification",
      () -> otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtpForMock(), PlatformType.IOS));
    esignetLoginPage.clickOnVerifyButtonIos();

    executeStep("Complete VC download",
      addNewCardPage::clickOnDoneButton);
    assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");

    //Share Test

    SharePage sharePage = homePage.clickOnShareButton();
    sharePage.acceptPermissionPopupCameraIos();
    assertTrue(sharePage.isCameraPageLoaded(), "Verify camera page is displayed");
    assertTrue(sharePage.isFlipCameraClickable(), "Verify if flip camera is enabled");
  }
}
