//package iosTestCases;
//
//import inji.testcases.BaseTest.IosBaseTest;
//import inji.api.BaseTestCase;
//import inji.constants.Target;
//import inji.pages.*;
//import inji.utils.TestDataReader;
//import org.testng.annotations.Test;
//import org.testng.asserts.SoftAssert;
//
//import static org.testng.Assert.*;
//import static org.testng.Assert.assertFalse;
//
//public class VcDownloadAndVerifyUsingUinTest extends IosBaseTest {
//    @Test
//    public void downloadAndVerifyVcUsingUin() {
//        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);
//
//        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
//        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
//
//        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
//        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
//
//        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
//        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
//
//        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
//        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), Target.IOS);
//
//        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
//        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), Target.IOS);
//
//        homePage.clickOnNextButtonForInjiTour();
//        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
//        AddNewCardPage addNewCardPage = homePage.downloadCard();
//
//        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
//        assertTrue(addNewCardPage.isIssuerDescriptionMosipDisplayed(), "Verify if issuer description  mosip displayed");
//        assertTrue(addNewCardPage.isIssuerDescriptionEsignetDisplayed(), "Verify if issuer description  esignet displayed");
//        assertTrue(addNewCardPage.isIssuerSearchBarDisplayed(), "Verify if issuer search bar displayed");
//        addNewCardPage.sendTextInIssuerSearchBar("Download MOSIP Credentials");
//        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();
//
//        //we will remove below line once bug is fixed https://mosip.atlassian.net/browse/INJI-712
//        addNewCardPage.clickOnDownloadViaUin();
//
//        assertTrue(retrieveIdPage.isRetrieveIdPageLoaded(), "Verify if retrieve id page is displayed");
//        assertEquals(retrieveIdPage.getRetrieveIdPageHeader(),"Download your ID");
//        assertTrue(retrieveIdPage.verifyDownloadIdPageGuideMessage(), "Verify if retrieve id page guide message is displayed");
//        String uin=TestDataReader.readData("uin");
//        OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(uin).clickOnGenerateCardButton();
//
//        assertTrue(otpVerification.isOtpVerificationPageLoaded(), "Verify if otp verification page  header is displayed");
//        assertTrue(otpVerification.verifyotpVerificationDescriptionDisplayed(), "Verify if otp verification page description is displayed");
//        otpVerification.enterOtp(InjiWalletUtil.getOtp(), Target.IOS);
//
//        assertTrue(homePage.isDownloadingVcPopupDisplayed(),"verify downloading vc popup displayed");
//        assertTrue(homePage.isNameDisplayed(TestDataReader.readData("fullName")), "Verify if full name is displayed");
////        assertTrue(homePage.isIdTypeDisplayed(), "Verify if id type is displayed");
//
//        DetailedVcViewPage detailedVcViewPage = homePage.openDetailedVcView(TestDataReader.readData("fullName"));
//        detailedVcViewPage.clickOnQrCodeButton();
//
//        SoftAssert softAssert = new SoftAssert();
//        softAssert.assertTrue(detailedVcViewPage.isQrCodeDisplayed(), "Verify if QR Code header is displayed");
//
//        detailedVcViewPage.clickOnQrCrossIcon();
//        assertTrue(detailedVcViewPage.isDetailedVcViewPageLoaded(), "Verify if detailed Vc view page is displayed");
//        assertEquals(detailedVcViewPage.getNameInDetailedVcView(), TestDataReader.readData("fullName"), "Verify if full name is displayed");
//        assertEquals(detailedVcViewPage.getDateOfBirthInDetailedVcView(), TestDataReader.readData("dateOfBirth"), "Verify if date of birth is displayed");
//        assertEquals(detailedVcViewPage.getGenderInDetailedVcView(), TestDataReader.readData("gender"), "Verify if gender is displayed");
//        assertEquals(detailedVcViewPage.getIdTypeValueInDetailedVcView(), TestDataReader.readData("idType"), "Verify if id type is displayed");
//        assertEquals(detailedVcViewPage.getStatusInDetailedVcView(), TestDataReader.readData("status"), "Verify if status is displayed");
//        assertEquals(detailedVcViewPage.getUinInDetailedVcView(), uin, "Verify if uin is displayed");
//        assertEquals(detailedVcViewPage.getPhoneInDetailedVcView(), TestDataReader.readData("phoneNumber"), "Verify if phone number is displayed");
//        assertEquals(detailedVcViewPage.getEmailInDetailedVcView(), TestDataReader.readData("externalemail"), "Verify if email is displayed");
//        assertTrue(detailedVcViewPage.isActivateButtonDisplayed(), "Verify if activate vc button displayed");
//    }
//
//    @Test
//    public void downloadMultipleVcUsingDifferentUin() {
//        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);
//
//        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
//        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
//
//        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
//        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
//
//        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
//        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
//
//        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
//        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), Target.IOS);
//
//        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
//        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), Target.IOS);
//
//        homePage.clickOnNextButtonForInjiTour();
//        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
//        AddNewCardPage addNewCardPage = homePage.downloadCard();
//
//        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
//        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();
//
//        assertTrue(retrieveIdPage.isRetrieveIdPageLoaded(), "Verify if retrieve id page is displayed");
//        String uin=TestDataReader.readData("uin");
//        OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(uin).clickOnGenerateCardButton();
//
//        assertTrue(otpVerification.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
//        otpVerification.enterOtp(InjiWalletUtil.getOtp(), Target.IOS);
//
//        assertTrue(homePage.isNameDisplayed(TestDataReader.readData("fullName")), "Verify if full name is displayed");
//
//        homePage.downloadCard();
//
//        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
//        addNewCardPage.clickOnDownloadViaUin();
//
//        assertTrue(retrieveIdPage.isRetrieveIdPageLoaded(), "Verify if retrieve id page is displayed");
//        retrieveIdPage.setEnterIdTextBox(TestDataReader.readData("uin2")).clickOnGenerateCardButton();
//
//        assertTrue(otpVerification.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
//        otpVerification.enterOtp(InjiWalletUtil.getOtp(), Target.IOS);
//
//        assertTrue(homePage.isNameDisplayed(TestDataReader.readData("uin2FullName")), "Verify if second VC is  displayed");
//        assertTrue(homePage.isNameDisplayed(TestDataReader.readData("fullName")), "Verifying again if first VC is still exists.");
//
//    }
//
//    @Test
//    public void downloadWithEmptyUin() {
//        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);
//
//        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
//        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
//
//        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
//        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
//
//        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
//        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
//
//        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
//        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), Target.IOS);
//
//        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
//        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), Target.IOS);
//
//        homePage.clickOnNextButtonForInjiTour();
//        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
//        AddNewCardPage addNewCardPage = homePage.downloadCard();
//
//        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
//        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();
//
//        assertTrue(retrieveIdPage.isRetrieveIdPageLoaded(), "Verify if retrieve id page is displayed");
//        OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox("").clickOnGenerateCardButton();
//        assertTrue(retrieveIdPage.isRetrieveIdPageLoaded(), "Verify if retrieve id page is displayed");
//
//    }
//
//    @Test
//    public void generateMultipleVcWithSameUin() throws InterruptedException {
//    	ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);
//
//        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
//        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
//
//        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
//        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
//
//        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
//        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
//
//        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
//        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), Target.IOS);
//
//        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
//        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), Target.IOS);
//
//        homePage.clickOnNextButtonForInjiTour();
//        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
//        AddNewCardPage addNewCardPage = homePage.downloadCard();
//
//        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
//        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();
//
//        assertTrue(retrieveIdPage.isRetrieveIdPageLoaded(), "Verify if retrieve id page is displayed");
//        String uin = TestDataReader.readData("uin");
//        OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(uin).clickOnGenerateCardButton();
//
//        assertTrue(otpVerification.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
//        otpVerification.enterOtp(InjiWalletUtil.getOtp(), Target.IOS);
//
//        assertTrue(homePage.isNameDisplayed(TestDataReader.readData("fullName")), "Verify if full name is displayed");
//
//        homePage.downloadCard();
//
//        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
//         addNewCardPage.clickOnDownloadViaUin();
//
//        assertTrue(retrieveIdPage.isRetrieveIdPageLoaded(), "Verify if retrieve id page is displayed");
//         retrieveIdPage.setEnterIdTextBox(uin).clickOnGenerateCardButton();
//
//        assertTrue(otpVerification.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
//        otpVerification.enterOtp(InjiWalletUtil.getOtp(), Target.IOS);
//
//        assertTrue(homePage.isSecondNameDisplayed(TestDataReader.readData("fullName")), "Verify if second card name is displayed");
//        HistoryPage historyPage = homePage.clickOnHistoryButton();
//
//        assertTrue(historyPage.isHistoryPageLoaded(), "Verify if history page is displayed");
//
//        assertEquals(historyPage.getNumberOfRecordsInHistory(uin, Target.IOS),2, "Verify two download records in history page");
//
//    }
//
//    @Test
//    public void verifyInvalidUinErrorMessage() {
//        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);
//
//        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
//        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
//
//        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
//        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
//
//        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
//        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
//
//        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
//        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), Target.IOS);
//
//        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
//        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), Target.IOS);
//
//        homePage.clickOnNextButtonForInjiTour();
//        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
//
//        AddNewCardPage addNewCardPage = homePage.downloadCard();
//
//        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
//        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();
//
//        assertTrue(retrieveIdPage.isRetrieveIdPageLoaded(), "Verify if retrieve id page is displayed");
//        retrieveIdPage.setEnterIdTextBox("00").clickOnGenerateCardButton();
//
//        assertTrue(retrieveIdPage.isIncorrectInputFormatErrorUinMessageDisplayed());
//    }
//
//    @Test
//    public void verifyOtpTimeOutAndGoBack() throws InterruptedException {
//    	ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);
//
//        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
//        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
//
//        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
//        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
//
//        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
//        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
//
//        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
//        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), Target.IOS);
//
//        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
//        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), Target.IOS);
//
//        homePage.clickOnNextButtonForInjiTour();
//        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
//        AddNewCardPage addNewCardPage = homePage.downloadCard();
//
//        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
//        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();
//
//        assertTrue(retrieveIdPage.isRetrieveIdPageLoaded(), "Verify if retrieve id page is displayed");
//        String uin = TestDataReader.readData("uin");
//        OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(uin).clickOnGenerateCardButton();
//
//        assertTrue(otpVerification.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
//        otpVerification.WatingTimeForVerificationTimerComplete();
//        assertTrue(otpVerification.verifyOtpVerificationTimerDisplayedAfterClickOnResend(), "Verify if resend code is displayed");
//
//        otpVerification.clickOnCrossIcon();
//        assertTrue(otpVerification.confirmPopupHeaderDisplayed(), "Verify if comfirm popup displayed");
//        otpVerification.clickOnCancelPopupButton();
//        assertEquals(homePage.verifyLanguageForNoVCDownloadedPageLoaded(), "Bring your digital identity");
//    }
//
//    @Test
//    public void downloadMultipleCardsAndVerifySearch() throws InterruptedException {
//        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);
//
//        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
//        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
//
//        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
//        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
//
//        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
//        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
//
//        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
//        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), Target.IOS);
//
//        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
//        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), Target.IOS);
//
//        assertFalse(homePage.isIssuerSearchBarDisplayed(), "Verify if card search not present");
//        assertFalse(homePage.isCardCountDisplayed(), "Verify if card count not present");
//
//        homePage.clickOnNextButtonForInjiTour();
//        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
//        AddNewCardPage addNewCardPage = homePage.downloadCard();
//
//        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
//        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();
//
//        assertTrue(retrieveIdPage.isRetrieveIdPageLoaded(), "Verify if retrieve id page is displayed");
//
//        String uin = TestDataReader.readData("uin");
//        OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(uin).clickOnGenerateCardButton();
//
//        assertTrue(otpVerification.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
//        otpVerification.enterOtp(InjiWalletUtil.getOtp(), Target.IOS);
//
//        assertTrue(homePage.isDownloadingVcPopupDisplayed(),"verify downloading vc popup displayed");
//        assertTrue(homePage.isNameDisplayed(TestDataReader.readData("fullName")), "Verify if full name is displayed");
//
//        homePage.downloadCard();
//        SunbirdLoginPage sunbirdLoginPage =  addNewCardPage.clickOnDownloadViaSunbird();
//        addNewCardPage.clickOnCredentialTypeHeadingInsuranceCredential();
//
//        addNewCardPage.clickOnContinueButtonInSigninPopupIos();
//        sunbirdLoginPage.enterPolicyNumberTextBox(TestDataReader.readData("policyNumberSunbird"));
//        sunbirdLoginPage.enterFullNameTextBox(TestDataReader.readData("fullNameSunbird"));
//        sunbirdLoginPage.enterDateOfBirthTextBox();
//        sunbirdLoginPage.clickOnloginButton();
//
//        assertTrue(sunbirdLoginPage.isSunbirdCardIsActive(), "Verify if download sunbird displayed active");
//        assertTrue(sunbirdLoginPage.isSunbirdCardLogoIsDisplayed(), "Verify if download sunbird logo displayed");
//        assertEquals(sunbirdLoginPage.getFullNameForSunbirdCard(),TestDataReader.readData("fullNameSunbird"));
//
//        assertTrue(homePage.isNameDisplayed(TestDataReader.readData("fullName")), "Verify if full name is displayed");
//        assertTrue(homePage.isCardCountDisplayed(), "Verify if card count is displayed");
//
//        homePage.sendTextInIssuerSearchBar(TestDataReader.readData("fullNameSunbird"));
//        assertEquals(sunbirdLoginPage.getFullNameForSunbirdCard(),TestDataReader.readData("fullNameSunbird"));
//        assertTrue(homePage.isCardCountAfterSearchDisplayed(), "Verify if card count is displayed");
//        //partial search
//
//        assertTrue(homePage.isIssuerSearchBarDisplayed(), "Verify if card search is displayed");
//        homePage.sendTextInIssuerSearchBar("test");
//        assertTrue(homePage.isNameDisplayed(TestDataReader.readData("fullName")), "Verify if full name is displayed");
//
//        //invalid
//        homePage.sendTextInIssuerSearchBar("Annabelle");
//        assertTrue(homePage.isNoCardFoundTextDisplayed(), "Verify if no card found displayed");
//
//        homePage.sendTextInIssuerSearchBar(uin);
//        homePage.clickOnReturnButton();
//        MoreOptionsPage moreOptionsPage =homePage.clickOnMoreOptionsButton();
//        assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");
//
//
//        PleaseConfirmPopupPage pleaseConfirmPopupPage = moreOptionsPage.clickOnRemoveFromWallet();
//        assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if pop up page is displayed");
//
//        pleaseConfirmPopupPage.clickOnConfirmButton();
//        //deleted
//        homePage.sendTextInIssuerSearchBar(uin);
//        assertTrue(homePage.isNoCardFoundTextDisplayed(), "Verify if no card found displayed");
//        homePage.clickOnReturnButton();
//
//        SettingsPage settingsPage= homePage.clickOnSettingIcon();
//        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
//        settingsPage.clickOnLanguage().clickOnFilipinoLanguage();
//
//        assertTrue(settingsPage.verifyFilipinoLanguage(), "Verify if language is changed to filipino");
//        homePage.clickOnHomeButton();
//
//        homePage.sendTextInIssuerSearchBar(TestDataReader.readData("fullNameSunbird"));
//        assertEquals(sunbirdLoginPage.getFullNameForSunbirdCard(),TestDataReader.readData("fullNameSunbird"));
//    }
//
//    @Test
//    public void downloadCardsAndVerifySearch() throws InterruptedException {
//        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(driver);
//
//        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
//        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();
//
//        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
//        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();
//
//        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
//        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();
//
//        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
//        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), Target.IOS);
//
//        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
//        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), Target.IOS);
//
//        assertFalse(homePage.isIssuerSearchBarDisplayed(), "Verify if card search not present");
//        assertFalse(homePage.isCardCountDisplayed(), "Verify if card count not present");
//
//        homePage.clickOnNextButtonForInjiTour();
//        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
//        AddNewCardPage addNewCardPage = homePage.downloadCard();
//
//        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
//        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();
//
//        assertTrue(retrieveIdPage.isRetrieveIdPageLoaded(), "Verify if retrieve id page is displayed");
//
//        String uin = TestDataReader.readData("uin");
//        OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(uin).clickOnGenerateCardButton();
//
//        assertTrue(otpVerification.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
//        otpVerification.enterOtp(InjiWalletUtil.getOtp(), Target.IOS);
//
//        assertTrue(homePage.isDownloadingVcPopupDisplayed(),"verify downloading vc popup displayed");
//        assertTrue(homePage.isNameDisplayed(TestDataReader.readData("fullName")), "Verify if full name is displayed");
//
//        homePage.sendTextInIssuerSearchBar("valid");
//        assertTrue(homePage.isNameDisplayed(TestDataReader.readData("fullName")), "Verify if full name is displayed");
//
//        homePage.clickOnReturnButton();
//        homePage.downloadCard();
//        addNewCardPage.clickOnDownloadViaUin();
//
//        TestDataReader.readData("uin");
//        retrieveIdPage.setEnterIdTextBox(uin).clickOnGenerateCardButton();
//
//        assertTrue(otpVerification.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
//        otpVerification.enterOtp(InjiWalletUtil.getOtp(), Target.IOS);
//        assertTrue(homePage.isNameDisplayed(TestDataReader.readData("fullName")), "Verify if full name is displayed");
//
//        SettingsPage settingsPage=homePage.clickOnSettingIcon();
//        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
//
//        settingsPage.clickOnLanguage().clickOnHindiLanguage();
//        assertTrue(settingsPage.verifyHindiLanguage(), "Verify if language is changed to hindi");
//
//        homePage.clickOnHomeButton();
//        homePage.sendTextInIssuerSearchBar("Test");
//        assertEquals(homePage.getTextFromVerificationStatus(), "वैध");
//
//    }
//}
