package inji.testcases.androidTestCases.sanityFlows;

import inji.constants.InjiWalletConstants;
import inji.constants.PlatformType;
import inji.pages.*;
import inji.testcases.BaseTest.AndroidBaseTest;
import inji.utils.TestDataReader;
import org.testng.annotations.Test;

import static org.testng.Assert.*;
import static org.testng.Assert.assertTrue;

public class HelpPageAndAboutPageSanityTest extends AndroidBaseTest {
  @Test
  public void verifyHelpPageAndAboutPage() {

    ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

    WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

    AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

    SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

    ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.ANDROID);

    HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData(InjiWalletConstants.PASSCODE), PlatformType.ANDROID);

    homePage.clickOnNextButtonForInjiTour();
    HelpPage helpPage = homePage.clickOnHelpIcon();

    assertFalse(helpPage.isHelpPageContentEmpty(), "verifying text is not empty");
    helpPage.clickOnBackButton();

    assertEquals(homePage.verifyLanguageForNoVCDownloadedPageLoaded(), "Bring your digital identity");
    homePage.clickOnHelpIcon();

    assertTrue(helpPage.isHelpPageLoaded(), "Verify if help page is displayed");
    assertTrue(helpPage.isWhatIsShareWithSelfieTextdHeader(), "verify if share with selfie text displayed");
    helpPage.exitHelpPage();

    assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");

    SettingsPage settingsPage = homePage.clickOnSettingIcon();

    assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
    AboutInjiPage aboutInjiPage = settingsPage.clickOnAbouInji();

    assertTrue(aboutInjiPage.isAboutInjiHeaderDisplayed(), "Verify id about inji page displayed");
    assertEquals(aboutInjiPage.getAboutInjiHeader(), "About Inji Wallet");
    assertTrue(aboutInjiPage.isAppIdVisible(), "Verify appID is displayed");
    aboutInjiPage.clickOnCopyText();
    assertTrue(aboutInjiPage.isAppIdCopiedTextDisplayed(), "verify if app id is copied");

    aboutInjiPage.clickOnBackButton();
    assertTrue(aboutInjiPage.isCopyTextDisplayed(), "verify if copy text displayed");

    aboutInjiPage.clickOnClickHereButton();
    assertTrue(aboutInjiPage.isMosipUrlDisplayedInChrome(), "verify if mosip url is displayed in chrome");
  }
}
