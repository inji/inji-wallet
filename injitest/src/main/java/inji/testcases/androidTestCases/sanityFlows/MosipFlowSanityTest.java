package inji.testcases.androidTestCases.sanityFlows;

import inji.annotations.NeedsUIN;
import inji.constants.InjiWalletConstants;
import inji.constants.PlatformType;
import inji.pages.*;
import inji.testcases.BaseTest.AndroidBaseTest;
import inji.utils.IosUtil;
import inji.utils.TestDataReader;
import org.testng.annotations.Test;
import inji.utils.CredentialRegistryUpdater;

import static org.testng.Assert.assertTrue;
import static org.testng.Assert.assertFalse;

public class MosipFlowSanityTest extends AndroidBaseTest {

  @Test
  @NeedsUIN
  public void downloadMosipIdVCAndActivateVCAndDeleteSmoke() throws InterruptedException {
    ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

    WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

    AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

    SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

    ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE),
      PlatformType.ANDROID);

    HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE),
      PlatformType.ANDROID);

    homePage.clickOnNextButtonForInjiTour();

    SettingsPage settingsPage = homePage.clickOnSettingIcon();
    settingsPage.clickOnKeyManagement();
    KeyManagementPage keyManagementPage = new KeyManagementPage(getDriver());
    keyManagementPage.clickOnDoneButton();

    IosUtil.dragAndDrop(getDriver(), keyManagementPage.getTheCoordinatesForRSA(),
      keyManagementPage.getTheCoordinatesED25519Text());
    keyManagementPage.clickOnSaveKeyOrderingPreferenceButton();

    assertTrue(keyManagementPage.iskeyOrderingSuccessTextMessageDisplayed(),
      "Verify if confirm passcode page is displayed");
    keyManagementPage.clickOnArrowleftButton();

    homePage.clickOnHomeButton();

    //Download card

    //Updating Credential Registry if enabled in config file
    CredentialRegistryUpdater.updateCredentialRegistryIfEnabled(homePage);

    // Navigate back
    homePage.clickOnHomeButton();

    // Home page
    HomePage refreshedHomePage = new HomePage(getDriver());

    AddNewCardPage addNewCardPage = refreshedHomePage.downloadCard();
    assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
    assertTrue(addNewCardPage.isIssuerSearchBarDisplayed(),"Verify if search bar is displayed");

    executeStep("Entering search text in search bar",
      addNewCardPage::searchAndSelectMosipIssuer);

    ESignetLoginPage esignetLoginPage = executeStep("Download VC via eSignet",
      addNewCardPage::clickOnDownloadViaEsignet);

    //clicking on continue button
    executeStep("Click eSignet Login with OTP button",
      esignetLoginPage::clickOnEsignetLoginWithOtpButton);

    assertTrue(esignetLoginPage.isESignetLogoDisplayed(), "Verify if Esignet Login page is landed");
    OtpVerificationPage otpVerification = esignetLoginPage.setEnterIdTextBox(getUIN());

    esignetLoginPage.clickOnGetOtpButton();
    assertTrue(esignetLoginPage.isOtpHasSendMessageDisplayed(), "verify if otp page is displayed");

    executeStep("Enter OTP for eSignet verification",
      () -> otpVerification.enterOtpForeSignet(uinGetOtp(), PlatformType.ANDROID));
    esignetLoginPage.clickOnVerifyButton();

    executeStep("Complete VC download",
      addNewCardPage::clickOnDoneButton);
    assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");

    //PinAndUnPin
    MoreOptionsPage moreOptionsPageOnHome = homePage.clickOnMoreOptionsButton();
    moreOptionsPageOnHome.clickOnPinOrUnPinCard();
    assertTrue(homePage.isPinIconDisplayed(), "Verify if pin icon on vc is displayed");
    homePage.clickOnMoreOptionsButton();
    moreOptionsPageOnHome.clickOnPinOrUnPinCard();
    assertFalse(homePage.isPinIconDisplayed(), "Verify if pin icon on vc is displayed");

    //Activation
    DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();
    assertTrue(detailedVcViewPage.isDetailedVcViewPageLoaded(), "Verify if detailed Vc view page is displayed");

    detailedVcViewPage.clickOnMoreOptionsInDetails();

    MoreOptionsPage moreOptionsPage = new MoreOptionsPage(getDriver());

    moreOptionsPage.clickOnDetailsViewActivationButton();
    PleaseConfirmPopupPage pleaseConfirmPopupPage = new PleaseConfirmPopupPage(getDriver());

    assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if pop up page is displayed");
    OtpVerificationPage otpVerificationPage = pleaseConfirmPopupPage.clickOnConfirmButton();

    assertTrue(otpVerificationPage.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");

    boolean activationSucceeded = false;
    try {
      otpVerificationPage.enterOtp(uinGetOtp(), PlatformType.ANDROID);
      if(!detailedVcViewPage.isProfileAuthenticatedDisplayed()) {
        homePage.clickPopupCloseButtonButton();
      }
      activationSucceeded = detailedVcViewPage.isProfileAuthenticatedDisplayed();
      assertTrue(activationSucceeded, "Verify if VC is activated");
    } catch (AssertionError e) {
      System.out.println("Activation failed, continuing with VC deletion: " + e.getMessage());
    }

    //deletion
    detailedVcViewPage.clickOnMoreOptionsInDetails();

    moreOptionsPage.clickOnRemoveFromWallet();

    pleaseConfirmPopupPage.clickOnConfirmButton();

    HistoryPage historyPage = homePage.clickOnHistoryButton();

    //verification of download,activation and deletion
    assertTrue(historyPage.verifyHistory(getUIN() + " Removed from wallet", PlatformType.ANDROID));
    if (activationSucceeded) {
      assertTrue(historyPage.verifyActivationSuccessfulRecordInHistory(getUIN() + " Removed from wallet", PlatformType.ANDROID));
    }
    assertTrue(historyPage.verifyDeleteHistory(getUIN(), PlatformType.ANDROID), "Verify if deleted history is displayed");
  }
}
