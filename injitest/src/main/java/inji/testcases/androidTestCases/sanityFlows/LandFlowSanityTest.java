package inji.testcases.androidTestCases.sanityFlows;

import inji.annotations.NeedsLandUIN;
import inji.constants.InjiWalletConstants;
import inji.constants.PlatformType;
import inji.pages.*;
import inji.testcases.BaseTest.AndroidBaseTest;
import inji.utils.InjiWalletUtil;
import inji.utils.TestDataReader;
import org.testng.annotations.Test;

import static org.testng.Assert.assertTrue;

public class LandFlowSanityTest extends AndroidBaseTest {

  @Test
  @NeedsLandUIN
  public void downloadLandVCAndDeleteSmoke(){
    ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

    WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

    AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

    SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

    ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE),
      PlatformType.ANDROID);

    HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE),
      PlatformType.ANDROID);

    homePage.clickOnNextButtonForInjiTour();

    AddNewCardPage addNewCardPage = homePage.downloadCard();

    assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");

    ESignetLoginPage esignetLoginPage = executeStep("Download VC via Farmer Issuer",
      () -> addNewCardPage.clickOnDownloadViaLandRegistry());

    esignetLoginPage.clickOnEsignetLoginWithOtpButton();

    OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getLandUIN());
    esignetLoginPage.clickOnGetOtpButton();

    executeStep("Enter OTP for eSignet verification",
      () -> otpVerification.enterOtpForeSignet(InjiWalletUtil.getOtpForMock(), PlatformType.ANDROID));

    esignetLoginPage.clickOnVerifyButton();
    addNewCardPage.clickOnDoneButton();
    assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");

    DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();
    assertTrue(detailedVcViewPage.isDetailedVcViewPageLoaded(), "Verify if detailed Vc view page is displayed");

    detailedVcViewPage.clickOnMoreOptionsInDetails();

    MoreOptionsPage moreOptionsPage = new MoreOptionsPage(getDriver());
    moreOptionsPage.clickOnRemoveFromWallet();

    PleaseConfirmPopupPage pleaseConfirmPopupPage = new PleaseConfirmPopupPage(getDriver());
    pleaseConfirmPopupPage.clickOnConfirmButton();

    HistoryPage historyPage = homePage.clickOnHistoryButton();
    assertTrue(historyPage.verifyHistoryForLandCredential("is downloaded", PlatformType.ANDROID));
    assertTrue(historyPage.verifyDeleteHistoryLandCredential("is removed from the wallet",PlatformType.ANDROID));
  }
}
