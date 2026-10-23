package inji.testcases.iosTestCases.sanityFlows;

import inji.constants.InjiWalletConstants;
import inji.constants.PlatformType;
import inji.pages.*;
import inji.testcases.BaseTest.IosBaseTest;
import inji.utils.TestDataReader;
import inji.utils.UpdateNetworkSettings;
import org.testng.Assert;
import org.testng.annotations.Test;

public class NoNetworkFlowSanityTest extends IosBaseTest {
  @Test
  public void should_not_show_issuer_options_when_internet_is_unavailable(){
    String sessionId = getDriver().getSessionId().toString();
    UpdateNetworkSettings.setNoNetworkProfile(sessionId);
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

    Assert.assertFalse(addNewCardPage.isIssuerDescriptionEsignetDisplayed());
  }
}
