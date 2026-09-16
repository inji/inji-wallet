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

public class MdlFlowSanityTest extends AndroidBaseTest {
  @Test
  @NeedsMockUIN
  public void downloadMdlVCAndActivateVCAndDeleteSmoke(){
    ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

    WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

    AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

    SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

    ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE),
      PlatformType.ANDROID);

    HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE),
      PlatformType.ANDROID);

    homePage.clickOnNextButtonForInjiTour();

    //vc download

    AddNewCardPage addNewCardPage = homePage.downloadCard();
    assertTrue(addNewCardPage.isIssuerDescriptionEsignetDisplayed(),
      "Verify if issuer description  esignet displayed");

    MockCertifyLoginPage mockCertifyLoginPage = executeStep("Download VC via eSignet",
      () -> addNewCardPage.clickOnDownloadViaMockCertify());

    addNewCardPage.clickOnContinueButton();
    OtpVerificationPage otpVerification = mockCertifyLoginPage.setEnterIdTextBox(getMockUIN());
    mockCertifyLoginPage.clickOnGetOtpButton();

    otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtpForMock(), PlatformType.ANDROID);
    mockCertifyLoginPage.clickOnVerifyButton();

    addNewCardPage.clickOnDoneButton();
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
    assertTrue(historyPage.verifyHistory(PlatformType.ANDROID),"Verification of ");
    assertTrue(historyPage.verifyMockMdlDeleteHistory(PlatformType.ANDROID));
  }
}
