package inji.testcases.iosTestCases.sanityFlows;

import inji.annotations.NeedsMockUIN;
import inji.constants.InjiWalletConstants;
import inji.constants.PlatformType;
import inji.pages.*;
import inji.testcases.BaseTest.IosBaseTest;
import inji.utils.InjiWalletUtil;
import inji.utils.TestDataReader;
import org.testng.annotations.Test;

import static org.testng.Assert.assertTrue;

public class MdlFlowSanityTest extends IosBaseTest {
  @Test
  @NeedsMockUIN
  public void downloadMdlVCAndActivateVCAndDeleteSmoke(){
    ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

    WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

    AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

    SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

    ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE),
      PlatformType.IOS);

    HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE),
      PlatformType.IOS);

    homePage.clickOnNextButtonForInjiTour();

    //vc download

    AddNewCardPage addNewCardPage = homePage.downloadCard();
    assertTrue(addNewCardPage.isIssuerDescriptionEsignetDisplayed(),
      "Verify if issuer description  esignet displayed");

    MockCertifyLoginPage mockCertifyLoginPage = executeStep("Download VC via eSignet",
      () -> addNewCardPage.clickOnDownloadViaMockCertify());

    addNewCardPage.clickOnContinueButtonInSigninPopupIos();
    OtpVerificationPage otpVerification = mockCertifyLoginPage.setEnterIdTextBox(getMockUIN());
    mockCertifyLoginPage.clickOnGetOtpButton();

    otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtpForMock(), PlatformType.IOS);
    mockCertifyLoginPage.clickOnVerifyButtonIos();

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
    assertTrue(historyPage.verifyHistory(PlatformType.IOS),"Verification of ");
    assertTrue(historyPage.verifyMockMdlDeleteHistory(PlatformType.IOS));
  }
}
