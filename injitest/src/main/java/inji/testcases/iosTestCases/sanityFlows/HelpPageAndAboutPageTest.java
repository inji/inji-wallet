package inji.testcases.iosTestCases.sanityFlows;

import inji.constants.PlatformType;
import inji.pages.*;
import inji.testcases.BaseTest.IosBaseTest;
import inji.utils.TestDataReader;
import org.testng.annotations.Test;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

public class HelpPageAndAboutPageTest extends IosBaseTest {
  @Test
  public void verifyHelpPageAndAboutPage() {
    ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

    WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

    AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

    SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

    ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

    HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

    homePage.clickOnNextButtonForInjiTour();

    HelpPage helpPage = homePage.clickOnHelpIcon();

    assertFalse(helpPage.isHelpPageContentEmpty(), "Verify Help page content is not empty");
    helpPage.exitHelpPage();

    SettingsPage settingsPage = homePage.clickOnSettingIcon();

    assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
    AboutInjiPage aboutInjiPage = settingsPage.clickOnAbouInji();

    assertTrue(aboutInjiPage.isAboutInjiHeaderDisplayed(), "Verify id about inji page displayed");
    assertEquals(aboutInjiPage.getAboutInjiHeader(), "About Inji Wallet");

    aboutInjiPage.clickOnCopyText();
    assertTrue(aboutInjiPage.isAppIdCopiedTextDisplayed(), "verify if app id is copied");

    aboutInjiPage.clickOnBackButton();
    assertTrue(aboutInjiPage.isCopyTextDisplayed(), "verify if copy text displayed");

    aboutInjiPage.clickOnClickHereButton();
    assertTrue(aboutInjiPage.isMosipUrlDisplayedInChrome(), "verify if mosip url is displayed in chrome");
  }
}
