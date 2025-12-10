package inji.testcases.iosTestCases;

import inji.annotations.NeedsSunbirdPolicy;
import inji.constants.PlatformType;
import inji.pages.*;
import inji.testcases.BaseTest.IosBaseTest;
import inji.utils.IosUtil;
import inji.utils.TestDataReader;
import org.testng.annotations.Test;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class VcDownloadAndVerifyUsingSunbirdTest extends IosBaseTest {
	
	private static final Logger logger = LogManager.getLogger(VcDownloadAndVerifyUsingSunbirdTest.class);
	
    @Test
    @NeedsSunbirdPolicy
    public void downloadAndVerifyVcUsingUinViaSunbird() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

//        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

//        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

//        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

//        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);

//        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);

        homePage.clickOnNextButtonForInjiTour();
//        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        AddNewCardPage addNewCardPage = homePage.downloadCard();


        assertTrue(addNewCardPage.isDownloadViaSunbirdDisplayed(), "Verify if download sunbird displayed");
        SunbirdLoginPage sunbirdLoginPage = addNewCardPage.clickOnDownloadViaSunbird();
        addNewCardPage.clickOnCredentialTypeHeadingInsuranceCredential();
//        addNewCardPage.clickOnContinueButtonInSigninPopupIos();
        sunbirdLoginPage.enterPolicyNumber(getPolicyNumber());
        sunbirdLoginPage.enterFullName(getPolicyName());
        sunbirdLoginPage.enterDateOfBirth();
        IosUtil.scrollToElement(getDriver(), 100, 800, 100, 200);
        sunbirdLoginPage.clickOnLoginButton();

        assertTrue(sunbirdLoginPage.isSunbirdCardActive(), "Verify if download sunbird displayed active");
        assertTrue(sunbirdLoginPage.isSunbirdCardLogoDisplayed(), "Verify if download sunbird logo displayed");
//        assertEquals(sunbirdLoginPage.getFullNameForSunbirdCard(),TestDataReader.readData("fullNameSunbird"));
        sunbirdLoginPage.openDetailedSunbirdVcView();

        assertEquals(sunbirdLoginPage.getFullNameForSunbirdCard(), getPolicyName());
        assertEquals(sunbirdLoginPage.getPolicyNameForSunbirdCard(), TestDataReader.readData("policyNameSunbird"));
//        assertEquals(sunbirdLoginPage.getPhoneNumberForSunbirdCard(), TestDataReader.readData("phoneNumberSunbird"));
//        assertEquals(sunbirdLoginPage.getDateofBirthValueForSunbirdCard(), TestDataReader.readData("dateOfBirthSunbird"));
        assertEquals(sunbirdLoginPage.getGenderValueForSunbirdCard(), TestDataReader.readData("genderValueSunbird"));
        assertEquals(sunbirdLoginPage.getEmailIdValueForSunbirdCard(), TestDataReader.readData("emailIdValueSunbird"));
        assertEquals(sunbirdLoginPage.getStatusValueForSunbirdCard(), TestDataReader.readData("status"));
        assertTrue(sunbirdLoginPage.isPolicyExpiresOnValueDisplayed(), "Verify if policy expireson value displayed");
        assertTrue(sunbirdLoginPage.isBenefitsValueDisplayed(), "Verify if policy expireson value displayed");
        assertEquals(sunbirdLoginPage.getIdTypeValueForSunbirdCard(), TestDataReader.readData("idTypeSunbird"));
    }

    @Test
    @NeedsSunbirdPolicy
    public void downloadAndVerifyVcUsingUinViaSunbirdLifeFiveTimes() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.IOS);
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.IOS);
        homePage.clickOnNextButtonForInjiTour();

        // Loop to download Sunbird VC 5 times
        for (int i = 1; i <= 5; i++) {
            logger.info("=== Starting Sunbird VC Download Iteration " + i + " ===");

            AddNewCardPage addNewCardPage = homePage.downloadCard();
            assertTrue(addNewCardPage.isDownloadViaSunbirdDisplayed(), "Verify if download sunbird displayed - Iteration " + i);

            SunbirdLoginPage sunbirdLoginPage = addNewCardPage.clickOnDownloadViaSunbird();
            addNewCardPage.clickOnCredentialTypeHeadingInsuranceCredential();


            sunbirdLoginPage.enterPolicyNumber(getPolicyNumber());
            sunbirdLoginPage.enterFullName(getPolicyName());
            sunbirdLoginPage.enterDateOfBirth();
            IosUtil.scrollToElement(getDriver(), 100, 800, 100, 200);
            sunbirdLoginPage.clickOnLoginButton();
            if (i==1){
                sunbirdLoginPage.clickOnDoneButton();}

            assertTrue(sunbirdLoginPage.isSunbirdCardisActive(), "Verify if sunbird card active - Iteration " + i);
            assertTrue(sunbirdLoginPage.isSunbirdCardLogoDisplayed(), "Verify if sunbird logo displayed - Iteration " + i);

            //sunbirdLoginPage.openDetailedSunbirdVcView();
            DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView();

            assertEquals(sunbirdLoginPage.getFullNameForSunbirdCard(), getPolicyName(), "Verify full name - Iteration " + i);
            assertEquals(sunbirdLoginPage.getPolicyNameForSunbirdCard(), TestDataReader.readData("policyNameSunbird"), "Verify policy name - Iteration " + i);
            assertEquals(sunbirdLoginPage.getGenderValueForSunbirdCard(), TestDataReader.readData("genderValueSunbird"), "Verify gender - Iteration " + i);
            assertEquals(sunbirdLoginPage.getEmailIdValueForSunbirdCard(), TestDataReader.readData("emailIdValueSunbird"), "Verify email - Iteration " + i);
            assertEquals(sunbirdLoginPage.getStatusValueForSunbirdCard(), TestDataReader.readData("status"), "Verify status - Iteration " + i);
            assertTrue(sunbirdLoginPage.isPolicyExpiresOnValueDisplayed(), "Verify policy expires on displayed - Iteration " + i);
            assertTrue(sunbirdLoginPage.isBenefitsValueDisplayed(), "Verify benefits displayed - Iteration " + i);
            assertEquals(sunbirdLoginPage.getIdTypeValueForSunbirdCard(), TestDataReader.readData("idTypeSunbird"), "Verify id type - Iteration " + i);
            detailedVcViewPage.clickOnCrossIcon();
            detailedVcViewPage.clickOnBackArrow();

            logger.info("=== Completed Sunbird VC Download Iteration " + i + " ===");
            
        }
        logger.info("Successfully downloaded and verified 5 Sunbird VCs!");
    }
}