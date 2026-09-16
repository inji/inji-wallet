package inji.testcases.iosTestCases.sanityFlows;

import inji.annotations.NeedsSvgWithFaceUIN;
import inji.constants.InjiWalletConstants;
import inji.constants.PlatformType;
import inji.pages.*;
import inji.testcases.BaseTest.IosBaseTest;
import inji.utils.InjiWalletUtil;
import inji.utils.TestDataReader;
import org.testng.annotations.Test;

import static org.testng.Assert.assertTrue;

public class FarmerFlowSanityTest extends IosBaseTest {

  @Test
  @NeedsSvgWithFaceUIN
  public void downloadFarmerVCAndDeleteSmoke() throws InterruptedException {
    ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

    WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

    AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

    SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

    ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE),
      PlatformType.IOS);

    HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE),
      PlatformType.IOS);

    homePage.clickOnNextButtonForInjiTour();

    AddNewCardPage addNewCardPage = homePage.downloadCard();

    assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");

    ESignetLoginPage esignetLoginPage = executeStep("Download VC via Farmer Issuer",
      () -> addNewCardPage.clickOnDownloadViaLandSVGWithFace());

    addNewCardPage.clickOnContinueButtonInSigninPopupIos();

    OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getsvgWithFaceUIN());
    esignetLoginPage.clickOnGetOtpButton();

    executeStep("Enter OTP for eSignet verification",
      () -> otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtpForMock(), PlatformType.IOS));

    esignetLoginPage.clickOnVerifyButtonIos();
    addNewCardPage.clickOnDoneButton();
    assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");

    //delete
    MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();

    PleaseConfirmPopupPage pleaseConfirmPopupPage = moreOptionsPage.clickOnRemoveFromWallet();
    assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if pop up page is displayed");

    pleaseConfirmPopupPage.clickOnConfirmButton();

    HistoryPage historyPage = homePage.clickOnHistoryButton();
    assertTrue(historyPage.verifyHistoryForFarmerCredential("is downloaded", PlatformType.IOS));
    assertTrue(historyPage.verifyDeleteHistoryFarmerCredential("is removed from the wallet",PlatformType.IOS));
  }
}
