package inji.testcases.iosTestCases.sanityFlows;

import inji.annotations.NeedsMockUIN;
import inji.constants.InjiWalletConstants;
import inji.constants.PlatformType;
import inji.pages.*;
import inji.testcases.BaseTest.IosBaseTest;
import inji.utils.InjiWalletUtil;
import inji.utils.TestDataReader;
import org.testng.annotations.Test;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

public class MockFlowSanityTest extends IosBaseTest {

  @Test
  @NeedsMockUIN
  public void should_download_and_delete_mock_vc_when_mock_issuer_flow_completes() {
    ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
    WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
    AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
    SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
    ConfirmPasscode confirmPasscode =
      setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);
    HomePage homePage =
      confirmPasscode.enterPasscodeInConfirmPasscodePage(
        TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.IOS);
    homePage.clickOnNextButtonForInjiTour();
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

    //delete
    DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();
    assertTrue(detailedVcViewPage.isDetailedVcViewPageLoaded(), "Verify if detailed Vc view page is displayed");

    detailedVcViewPage.clickOnMoreOptionsInDetails();

    MoreOptionsPage moreOptionsPage = new MoreOptionsPage(getDriver());

    PleaseConfirmPopupPage pleaseConfirmPopupPage = moreOptionsPage.clickOnRemoveFromWallet();
    assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if pop up page is displayed");

    pleaseConfirmPopupPage.clickOnConfirmButton();
    assertEquals(homePage.verifyLanguageForNoVCDownloadedPageLoaded(), "Bring your digital identity");

    HistoryPage historyPage = homePage.clickOnHistoryButton();
    assertTrue(historyPage.isHistoryPageLoaded(), "Verify if history page is displayed");
    assertTrue(historyPage.verifyHistoryForMock(PlatformType.IOS),
      "Verify if download history is displayed");
    assertTrue(historyPage.verifyDeleteHistoryForMock(PlatformType.IOS), "Verify if deleted history is displayed");
  }

}
