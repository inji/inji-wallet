package inji.testcases.androidTestCases.sanityFlows;

import inji.annotations.NeedsSunbirdPolicy;
import inji.constants.PlatformType;
import inji.pages.*;
import inji.testcases.BaseTest.AndroidBaseTest;
import inji.utils.TestDataReader;
import org.testng.annotations.Test;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

public class SunbirdFlowSanityTest extends AndroidBaseTest {

  @Test
  @NeedsSunbirdPolicy
  public void downloadSunbirdVCAndDeleteSmoke(){
    ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

    WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

    AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

    SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

    ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

    HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

    homePage.clickOnNextButtonForInjiTour();
    AddNewCardPage addNewCardPage = homePage.downloadCard();

    assertTrue(addNewCardPage.isDownloadViaSunbirdDisplayed(), "Verify if download sunbird displayed");
    SunbirdLoginPage sunbirdLoginPage = addNewCardPage.clickOnDownloadViaSunbird();
    addNewCardPage.clickOnCredentialTypeHeadingInsuranceCredential();

    sunbirdLoginPage.enterPolicyNumber(getPolicyNumber());
    sunbirdLoginPage.enterFullName(getPolicyName());
    sunbirdLoginPage.enterDateOfBirth();
    sunbirdLoginPage.clickOnLoginButton();

    assertTrue(sunbirdLoginPage.isSunbirdCardActive(), "Verify if download sunbird displayed active");
    assertTrue(sunbirdLoginPage.isSunbirdCardLogoDisplayed(), "Verify if download sunbird logo displayed");

    sunbirdLoginPage.openDetailedSunbirdVcView();

    assertEquals(sunbirdLoginPage.getFullNameForSunbirdCard(), getPolicyName());
    assertEquals(sunbirdLoginPage.getPolicyNameForSunbirdCard(), TestDataReader.readData("policyNameSunbird"));
    assertEquals(sunbirdLoginPage.getPhoneNumberForSunbirdCard(), TestDataReader.readData("phoneNumberSunbird"));
    assertTrue(sunbirdLoginPage.isDateOfBirthValueForSunbirdCardDisplayed());
    assertEquals(sunbirdLoginPage.getGenderValueForSunbirdCard(), TestDataReader.readData("genderValueSunbird"));
    assertEquals(sunbirdLoginPage.getEmailIdValueForSunbirdCard(), TestDataReader.readData("emailIdValueSunbird"));
    assertEquals(sunbirdLoginPage.getStatusValueForSunbirdCard(), TestDataReader.readData("statusValueSunbird"));
    assertEquals(sunbirdLoginPage.getIdTypeValueForSunbirdCard(), TestDataReader.readData("idTypeSunbird"));

    DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();
    detailedVcViewPage.clickOnMoreOptionsInDetails();

    MoreOptionsPage moreOptionsPage = new MoreOptionsPage(getDriver());
    PleaseConfirmPopupPage pleaseConfirmPopupPage = moreOptionsPage.clickOnRemoveFromWallet();

    assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if pop up page is displayed");
    pleaseConfirmPopupPage.clickOnConfirmButton();

    HistoryPage historyPage = homePage.clickOnHistoryButton();
    assertTrue(historyPage.isHistoryPageLoaded(), "Verify if history page is displayed");
    assertTrue(historyPage.verifyHistoryForInsuranceCard(getPolicyNumber(), PlatformType.ANDROID),
      "Verify if downloaded Sunbird VC history is displayed");
    assertTrue(historyPage.verifyDeleteHistoryInsuranceCard(getPolicyNumber(), PlatformType.ANDROID),
      "Verify if deleted Sunbird VC history is displayed");
  }
}
