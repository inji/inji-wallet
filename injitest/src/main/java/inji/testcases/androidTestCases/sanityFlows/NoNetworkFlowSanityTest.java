package inji.testcases.androidTestCases.sanityFlows;

import inji.annotations.NeedsUIN;
import inji.constants.InjiWalletConstants;
import inji.constants.PlatformType;
import inji.pages.*;
import inji.testcases.BaseTest.AndroidBaseTest;
import inji.utils.TestDataReader;
import inji.utils.UpdateNetworkSettings;
import org.testng.Assert;
import org.testng.annotations.Test;

public class NoNetworkFlowSanityTest extends AndroidBaseTest {
  @Test
  @NeedsUIN
  public void downloadMosipIdVCWithoutInternet(){
    String sessionId = getDriver().getSessionId().toString();
    UpdateNetworkSettings.setNoNetworkProfile(sessionId);
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

    Assert.assertFalse(addNewCardPage.isIssuerDescriptionEsignetDisplayed());
  }
}
