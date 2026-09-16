package inji.testcases.androidTestCases.sanityFlows;

import inji.annotations.NeedsMockUIN;
import inji.constants.InjiWalletConstants;
import inji.constants.PlatformType;
import inji.pages.*;
import inji.testcases.BaseTest.AndroidBaseTest;
import inji.utils.InjiWalletUtil;
import inji.utils.TestDataReader;
import org.testng.annotations.Test;

import static org.testng.Assert.assertTrue;

public class MockFlowSanityTest extends AndroidBaseTest {
  @Test
  @NeedsMockUIN
  public void downloadMockVCAndDeleteSmoke(){
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

    //delete
    DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();
    assertTrue(detailedVcViewPage.isDetailedVcViewPageLoaded(), "Verify if detailed Vc view page is displayed");

    detailedVcViewPage.clickOnMoreOptionsInDetails();

    MoreOptionsPage moreOptionsPage = new MoreOptionsPage(getDriver());
    moreOptionsPage.clickOnRemoveFromWallet();

    PleaseConfirmPopupPage pleaseConfirmPopupPage = new PleaseConfirmPopupPage(getDriver());
    pleaseConfirmPopupPage.clickOnConfirmButton();

    HistoryPage historyPage = homePage.clickOnHistoryButton();
    assertTrue(historyPage.verifyHistoryForMock(PlatformType.ANDROID));
    assertTrue(historyPage.verifyDeleteHistoryForMock(PlatformType.ANDROID), "Verify if deleted history is displayed");
  }

}
