package inji.testcases.androidTestCases;

import inji.annotations.NeedsUIN;
import inji.constants.PlatformType;
import inji.pages.*;
import inji.testcases.BaseTest.AndroidBaseTest;
import inji.utils.InjiWalletUtil;
import inji.utils.IosUtil;
import inji.utils.TestDataReader;
import org.testng.annotations.Test;

import static org.testng.Assert.*;

public class VcBackupAndRestoreTest extends AndroidBaseTest {
    @Test
    @NeedsUIN
    public void VcBackupAndRestoreTest() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        AddNewCardPage addNewCardPage = homePage.downloadCard();
        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();
        OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(getUIN()).clickOnGenerateCardButton();

        otpVerification.enterOtp(InjiWalletUtil.getOtp(), PlatformType.ANDROID);

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");

        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isDataBackupAndRestoreDisplayed(), "Verify if backup & restore displayed");
        assertTrue(settingsPage.isNewLableDisplayed(), "Verify if backup & restore new tag displayed");
        BackupAndRestorePage backupAndRestorePage = settingsPage.clickOnDataBackupAndRestoreButton();

        assertTrue(backupAndRestorePage.isBackupProcessInfoDisplayed(), "Verify if backup information displayed");
        assertTrue(backupAndRestorePage.isCloudInfoDisplayed(), "Verify if cloud information displayed");
        backupAndRestorePage.clickOnProceedButton();

        backupAndRestorePage.clickOnAddAnotherAccount();
        String email = TestDataReader.readData("emailsForBackupAndRestore");
        backupAndRestorePage.enterEmailTextBox(email);
        backupAndRestorePage.clickOnNextButton();
        backupAndRestorePage.enterPasswordTextBox(TestDataReader.readData("emailPassword"));
        backupAndRestorePage.clickOnNextButton();
        backupAndRestorePage.clickOnAgreeButton();

//        backupAndRestorePage.clickOnEmailHeader();

        assertTrue(backupAndRestorePage.isLastBackupSectionHeaderDisplayed(), "Verify if last backup section displayed");
        backupAndRestorePage.clickOnBackUpButton();

        assertTrue(backupAndRestorePage.isDataBackupInProgressTextDisplayed(), "verify if data backup in progress popup displayed");
        assertTrue(backupAndRestorePage.isAccountSectionHeaderDisplayed(), "Verify if account section header displayed");
        assertTrue(backupAndRestorePage.isDataBackupInProgressTextDisappear(), "verify if data backup in progress Disappear");
        assertTrue(backupAndRestorePage.isStorageInfoDisplayed(), "Verify if account storage info displayed");
        assertTrue(backupAndRestorePage.isAssociatedAccountDisplayed(), "Verify if associated account displayed");
        assertTrue(backupAndRestorePage.isLastBackupTimeDisplayed(), "Verify if last backup time displayed");
        assertTrue(backupAndRestorePage.isDataBackupSuccessPopupDisplayed(), "Verify if backup successful popup displayed");
        backupAndRestorePage.clickOnCloseButton();

        backupAndRestorePage.clickOnArrowLeftButton();
        assertFalse(settingsPage.isNewLableDisplayed(), "Verify if new tag is removed");
        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        homePage.clickOnHomeButton();


        MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();
        assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");

        PleaseConfirmPopupPage pleaseConfirmPopupPage = moreOptionsPage.clickOnRemoveFromWallet();
        assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if pop up page is displayed");

        pleaseConfirmPopupPage.clickOnConfirmButton();
        assertEquals(homePage.verifyLanguageForNoVCDownloadedPageLoaded(), "Bring your digital identity");

        homePage.clickOnSettingIcon();
        settingsPage.clickOnDataBackupAndRestoreButton();
        backupAndRestorePage.clickOnRestoreButton();

        assertTrue(backupAndRestorePage.isRestoreSectionHeaderDisplayed(), " Verify is restore backup successful popup displayed");
        assertTrue(backupAndRestorePage.isRestoreBackupSuccessPopUpDisplayed(), " Verify is restore backup successful popup displayed");
        backupAndRestorePage.clickOnCloseButton();
        backupAndRestorePage.clickOnArrowLeftButton();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        homePage.clickOnHomeButton();

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
//        assertEquals(homePage.GetActivationPendingText(), "Activation pending for online login");
    }

//    @Test
//    @NeedsUIN
//    public void DenyPermissionForInji() throws InterruptedException {
//        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
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
//        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), Target.ANDROID);
//
//        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
//        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), Target.ANDROID);
//
//        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
//        AddNewCardPage addNewCardPage = homePage.downloadCard();
//        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();
//        String uin=TestDataReader.readData("uin");
//        OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(getUIN()).clickOnGenerateCardButton();
//
//        otpVerification.enterOtp(InjiWalletUtil.getOtp(), Target.ANDROID);
//
//        assertTrue(homePage.isNameDisplayed(TestDataReader.readData("fullName")), "Verify if full name is displayed");
//
//        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
//        SettingsPage settingsPage = homePage.clickOnSettingIcon();
//
//        assertTrue(settingsPage.isdataBackupAndRestoreDisplayed(), "Verify if backup & restore displayed");
//        assertTrue(settingsPage.isNewlableDisplayed(), "Verify if backup & restore new tag displayed");
//        BackupAndRestorePage backupAndRestorePage = settingsPage.clickOnDataBackupAndRestoreButton();
//
//        assertTrue(backupAndRestorePage.isBackupProcessInfoDisplayed(), "Verify if backup information displayed");
//        assertTrue(backupAndRestorePage.isCloudInfoDisplayed(), "Verify if cloud information displayed");
//        backupAndRestorePage.clickOnGoBackButton();
//
//        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page displayed");
//        settingsPage.clickOnDataBackupAndRestoreButton();
//        backupAndRestorePage.clickOnProceedButton();
//
//        String denyMail= TestDataReader.readData("denyEmailId");
//        backupAndRestorePage.enterEmailTextBox(denyMail);
//        backupAndRestorePage.clickOnNextButton();
//        backupAndRestorePage.enterPasswordTextBox(TestDataReader.readData("denyEmailPassword"));
//        backupAndRestorePage.clickOnNextButton();
//
//        backupAndRestorePage.clickOnAgreeButton();
//        Thread.sleep(3000);
//        backupAndRestorePage.clickOnCancelButton();
//
//        assertTrue(backupAndRestorePage.isPermissionDeniedHeaderDisplayed(), "Verify if permission Denied displayed");
//        assertTrue(backupAndRestorePage.isErrorMessageDescriptionDisplayed(), "Verify if permission Denied description displayed");
//
//        backupAndRestorePage.clickOnAllowAccessButton();
//        assertTrue(backupAndRestorePage.isChooseAccountHeaderDisplayed(), "Verify if redirect to google account page");
//
//    }

    @Test
    @NeedsUIN
    public void RestoreVcTwoTimes() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        AddNewCardPage addNewCardPage = homePage.downloadCard();
        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();
        String uin = TestDataReader.readData("uin");
        OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(getUIN()).clickOnGenerateCardButton();

        otpVerification.enterOtp(InjiWalletUtil.getOtp(), PlatformType.ANDROID);

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isDataBackupAndRestoreDisplayed(), "Verify if backup & restore displayed");
        assertTrue(settingsPage.isNewLableDisplayed(), "Verify if backup & restore new tag displayed");
        BackupAndRestorePage backupAndRestorePage = settingsPage.clickOnDataBackupAndRestoreButton();

        assertTrue(backupAndRestorePage.isBackupProcessInfoDisplayed(), "Verify if backup information displayed");
        assertTrue(backupAndRestorePage.isCloudInfoDisplayed(), "Verify if cloud information displayed");
        backupAndRestorePage.clickOnProceedButton();

        String email = TestDataReader.readData("emailsForBackupAndRestore");
        backupAndRestorePage.enterEmailTextBox(email);
        backupAndRestorePage.clickOnNextButton();
        backupAndRestorePage.enterPasswordTextBox(TestDataReader.readData("emailPassword"));
        backupAndRestorePage.clickOnNextButton();
        backupAndRestorePage.clickOnAgreeButton();

        assertTrue(backupAndRestorePage.isLastBackupSectionHeaderDisplayed(), "Verify if last backup section displayed");
        backupAndRestorePage.clickOnBackUpButton();

        assertTrue(backupAndRestorePage.isAccountSectionHeaderDisplayed(), "Verify if account section header displayed");
        assertTrue(backupAndRestorePage.isStorageInfoDisplayed(), "Verify if account storage info displayed");
        assertTrue(backupAndRestorePage.isAssociatedAccountDisplayed(), "Verify if associated account displayed");
        assertTrue(backupAndRestorePage.isLastBackupTimeDisplayed(), "Verify if last backup time displayed");
        assertTrue(backupAndRestorePage.isDataBackupSuccessPopupDisplayed(), "Verify if backup successful popup displayed");
        backupAndRestorePage.clickOnCloseButton();

        backupAndRestorePage.clickOnRestoreButton();
        assertTrue(backupAndRestorePage.isRestoreInProgressPopupTextDisplayed(), "Verify if restore in progress displayed");
        assertTrue(backupAndRestorePage.isRestoreBackupSuccessPopUpDisplayed(), " Verify is restore backup successful popup displayed");
        backupAndRestorePage.clickOnCloseButton();

        assertTrue(backupAndRestorePage.isLastBackupTimeDisplayed(), "Verify if last backup time displayed");
        backupAndRestorePage.clickOnRestoreButton();
        assertTrue(backupAndRestorePage.isRestoreInProgressPopupTextDisplayed(), "Verify if restore in progress displayed");
        assertTrue(backupAndRestorePage.isRestoreBackupSuccessPopUpDisplayed(), " Verify is restore backup successful popup displayed");
        backupAndRestorePage.clickOnCloseButton();

        backupAndRestorePage.clickOnArrowLeftButton();
        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        homePage.clickOnHomeButton();

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
    }

//    @Test
//    public void VcRestoreWithoutBackup() throws InterruptedException {
//        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());
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
//        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), Target.ANDROID);
//
//        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
//        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), Target.ANDROID);
//
//        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
//        SettingsPage settingsPage = homePage.clickOnSettingIcon();
//
//        assertTrue(settingsPage.isdataBackupAndRestoreDisplayed(), "Verify if backup & restore displayed");
//        assertTrue(settingsPage.isNewlableDisplayed(), "Verify if backup & restore new tag displayed");
//        BackupAndRestorePage backupAndRestorePage = settingsPage.clickOnDataBackupAndRestoreButton();
//
//        assertTrue(backupAndRestorePage.isBackupProcessInfoDisplayed(), "Verify if backup information displayed");
//        assertTrue(backupAndRestorePage.isCloudInfoDisplayed(), "Verify if cloud information displayed");
//        backupAndRestorePage.clickOnProceedButton();
//
//        String mailWithNoBackup= TestDataReader.readData("noBackupMail");
//        backupAndRestorePage.enterEmailTextBox(mailWithNoBackup);
//        backupAndRestorePage.clickOnNextButton();
//        backupAndRestorePage.enterPasswordTextBox(TestDataReader.readData("emailPassword"));
//        backupAndRestorePage.clickOnNextButton();
//        backupAndRestorePage.clickOnAgreeButton();
//
//        backupAndRestorePage.clickOnRestoreButton();
//
//        assertTrue(backupAndRestorePage.isRestoreFailurePopupHeaderDisplayed(), " Verify is restore failure popup displayed");
//    }

    @Test
    @NeedsUIN
    public void VerifyBackUpAndRestorePageInMultipleLanguge() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        AddNewCardPage addNewCardPage = homePage.downloadCard();
        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();
        OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(getUIN()).clickOnGenerateCardButton();

        otpVerification.enterOtp(InjiWalletUtil.getOtp(), PlatformType.ANDROID);

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");

        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isDataBackupAndRestoreDisplayed(), "Verify if backup & restore displayed");
        assertTrue(settingsPage.isNewLableDisplayed(), "Verify if backup & restore new tag displayed");
        BackupAndRestorePage backupAndRestorePage = settingsPage.clickOnDataBackupAndRestoreButton();

        assertTrue(backupAndRestorePage.isBackupProcessInfoDisplayed(), "Verify if backup information displayed");
        assertTrue(backupAndRestorePage.isCloudInfoDisplayed(), "Verify if cloud information displayed");
        backupAndRestorePage.clickOnProceedButton();

        String email = TestDataReader.readData("emailsForBackupAndRestore");
        backupAndRestorePage.enterEmailTextBox("mosiptest20@gmail.com");
        backupAndRestorePage.clickOnNextButton();
        backupAndRestorePage.enterPasswordTextBox(TestDataReader.readData("Hello@20"));
        backupAndRestorePage.clickOnNextButton();
        backupAndRestorePage.clickOnAgreeButton();

//        backupAndRestorePage.clickOnEmailHeader();
        assertTrue(backupAndRestorePage.isLastBackupSectionHeaderDisplayed(), "Verify if last backup section displayed");
        backupAndRestorePage.clickOnBackUpButton();

//
        assertTrue(backupAndRestorePage.isAccountSectionHeaderDisplayed(), "Verify if account section header displayed");
        assertTrue(backupAndRestorePage.isStorageInfoDisplayed(), "Verify if account storage info displayed");
        assertTrue(backupAndRestorePage.isAssociatedAccountDisplayed(), "Verify if associated account displayed");
        assertTrue(backupAndRestorePage.isLastBackupTimeDisplayed(), "Verify if last backup time displayed");
        assertFalse(backupAndRestorePage.isDataBackupInProgressTextDisappear(), "Verify if last backup backup is progress pop up is dissappear");
        backupAndRestorePage.clickOnCloseButton();

        assertTrue(backupAndRestorePage.isRestoreSectionHeaderDisplayed(), " Verify is restore backup successful popup displayed");
        backupAndRestorePage.clickOnArrowLeftButton();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");

        settingsPage.clickOnLanguage().clickOnFilipinoLanguage();
        assertTrue(settingsPage.verifyFilipinoLanguage(), "Verify if language is changed to filipino");
        settingsPage.clickOnDataBackupAndRestoreButton();

        assertEquals(backupAndRestorePage.getLastBackupSectionHeaderText(), "Mga Detalye ng Huling Backup");
        assertEquals(backupAndRestorePage.getAccountSectionHeaderText(), "Mga Setting ng Google Drive");
        assertEquals(backupAndRestorePage.getStorageInfoText(), "Ang backup ay maiimbak sa Google Drive na nauugnay sa iyong napiling gmail account.");

        backupAndRestorePage.clickOnBackUpButton();
        assertEquals(backupAndRestorePage.getDataBackupInProgressText(), "Kasalukuyang isinasagawa ang backup ng data. Mangyaring huwag isara ang application.");
        assertTrue(backupAndRestorePage.isDataBackupSuccessPopupDisplayed(), "Verify if backup successful popup displayed");
        assertEquals(backupAndRestorePage.getDataBackupSuccessPopupText(), "Ang iyong backup ay matagumpay!");
        backupAndRestorePage.clickOnCloseButton();

        backupAndRestorePage.clickOnArrowLeftButton();
        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");

        UnlockApplicationPage unlockApplicationPage = settingsPage.clickOnLanguage().clickOnArabicLanguageButton();

        assertTrue(unlockApplicationPage.isUnlockApplicationPageLoadedInArabic(), "Verify if language is changed to arabic");
        unlockApplicationPage.clickOnUnlockApplicationButton();
        setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        //arabic
        homePage.clickOnSettingIcon();
        settingsPage.clickOnDataBackupAndRestoreButton();

        assertEquals(backupAndRestorePage.getLastBackupSectionHeaderText(), "تفاصيل النسخ الاحتياطي الأخير");
        assertEquals(backupAndRestorePage.getAccountSectionHeaderText(), "إعدادات جوجل درايف");
        assertEquals(backupAndRestorePage.getStorageInfoText(), "سيتم تخزين النسخة الاحتياطية في Google Drive المرتبط بحساب gmail الذي اخترته.");

        backupAndRestorePage.clickOnBackUpButton();
        assertEquals(backupAndRestorePage.getDataBackupInProgressText(), "النسخ الاحتياطي للبيانات قيد التقدم. من فضلك لا تغلق التطبيق.");
        assertTrue(backupAndRestorePage.isDataBackupSuccessPopupDisplayed(), "Verify if backup successful popup displayed");
        assertEquals(backupAndRestorePage.getDataBackupSuccessPopupText(), "تمت عملية النسخ الاحتياطي الخاصة بك بنجاح!");
        backupAndRestorePage.clickOnCloseButton();

        backupAndRestorePage.clickOnRestoreButton();
        assertEquals(backupAndRestorePage.getRestoreInProgressPopupText(), "استعادة البيانات قيد التقدم. من فضلك لا تغلق التطبيق.");
        assertTrue(backupAndRestorePage.isRestoreBackupSuccessPopUpDisplayed(), " Verify is restore backup successful popup displayed");
        assertEquals(backupAndRestorePage.getRestoreBackupSuccessPopUpText(), "تمت استعادة النسخة الاحتياطية الخاصة بك بنجاح");
        backupAndRestorePage.clickOnCloseButton();

        backupAndRestorePage.clickOnArrowLeftButton();
        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        settingsPage.clickOnLanguage().clickOnHindiLanguage();

        assertTrue(unlockApplicationPage.isUnlockApplicationPageLoadedInArabic(), "Verify if language is changed to arabic");
        unlockApplicationPage.clickOnUnlockApplicationButton();
        setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnSettingIcon();

        //hindi
//        assertEquals(settingsPage.getDataBackupAndRestoreText(), "बैकअप बहाल");
        settingsPage.clickOnDataBackupAndRestoreButton();
        assertEquals(backupAndRestorePage.getBackupAndRestoreHeaderText(), "बैकअप और पुनर्स्थापना");
        assertEquals(backupAndRestorePage.getLastBackupSectionHeaderText(), "अंतिम बैकअप विवरण");
        assertEquals(backupAndRestorePage.getAccountSectionHeaderText(), "Google ड्राइव सेटिंग्स");
        assertEquals(backupAndRestorePage.getStorageInfoText(), "बैकअप आपके चुने हुए gmail खाते से जुड़े Google Drive में संग्रहीत किया जाएगा।");

        backupAndRestorePage.clickOnBackUpButton();
        assertEquals(backupAndRestorePage.getDataBackupInProgressText(), "डेटा बैकअप चल रहा है. कृपया एप्लिकेशन को बंद न करें.");
        assertTrue(backupAndRestorePage.isDataBackupSuccessPopupDisplayed(), "Verify if backup successful popup displayed");
        assertEquals(backupAndRestorePage.getDataBackupSuccessPopupText(), "आपका बैकअप सफल रहा!");
        backupAndRestorePage.clickOnCloseButton();

        backupAndRestorePage.clickOnRestoreButton();
        assertEquals(backupAndRestorePage.getRestoreInProgressPopupText(), "डेटा पुनर्स्थापना प्रगति पर है. कृपया एप्लिकेशन को बंद न करें.");
        assertTrue(backupAndRestorePage.isRestoreBackupSuccessPopUpDisplayed(), " Verify is restore backup successful popup displayed");
        assertEquals(backupAndRestorePage.getRestoreBackupSuccessPopUpText(), "आपका बैकअप सफलतापूर्वक बहाल कर दिया गया है");
        backupAndRestorePage.clickOnCloseButton();

        backupAndRestorePage.clickOnArrowLeftButton();
        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");

        //kannada
        settingsPage.clickOnLanguage().clickOnKannadaLanguage();
        settingsPage.clickOnDataBackupAndRestoreButton();

        assertEquals(backupAndRestorePage.getBackupAndRestoreHeaderText(), "ಬ್ಯಾಕಪ್ ಮತ್ತು ಮರುಸ್ಥಾಪನೆ");
        assertEquals(backupAndRestorePage.getLastBackupSectionHeaderText(), "ಕೊನೆಯ ಬ್ಯಾಕಪ್ ವಿವರಗಳು");
        assertEquals(backupAndRestorePage.getAccountSectionHeaderText(), "Google Drive Settings");
        assertEquals(backupAndRestorePage.getStorageInfoText(), "ನೀವು ಆಯ್ಕೆ ಮಾಡಿದ gmail ಖಾತೆಗೆ ಸಂಯೋಜಿತವಾಗಿರುವ Google Drive ನಲ್ಲಿ ಬ್ಯಾಕಪ್ ಅನ್ನು ಸಂಗ್ರಹಿಸಲಾಗುತ್ತದೆ.");

        backupAndRestorePage.clickOnBackUpButton();
        assertEquals(backupAndRestorePage.getDataBackupInProgressText(), "ಡೇಟಾ ಬ್ಯಾಕಪ್ ಪ್ರಗತಿಯಲ್ಲಿದೆ. ದಯವಿಟ್ಟು ಅಪ್ಲಿಕೇಶನ್ ಅನ್ನು ಮುಚ್ಚಬೇಡಿ.");
        assertTrue(backupAndRestorePage.isDataBackupSuccessPopupDisplayed(), "Verify if backup successful popup displayed");
        assertEquals(backupAndRestorePage.getDataBackupSuccessPopupText(), "ನಿಮ್ಮ ಬ್ಯಾಕಪ್ ಯಶಸ್ವಿಯಾಗಿದೆ!");
        backupAndRestorePage.clickOnCloseButton();

        backupAndRestorePage.clickOnRestoreButton();
        assertEquals(backupAndRestorePage.getRestoreInProgressPopupText(), "ಡೇಟಾ ಮರುಸ್ಥಾಪನೆ ಪ್ರಗತಿಯಲ್ಲಿದೆ. ದಯವಿಟ್ಟು ಅಪ್ಲಿಕೇಶನ್ ಅನ್ನು ಮುಚ್ಚಬೇಡಿ.");
        assertTrue(backupAndRestorePage.isRestoreBackupSuccessPopUpDisplayed(), " Verify is restore backup successful popup displayed");
        assertEquals(backupAndRestorePage.getRestoreBackupSuccessPopUpText(), "ನಿಮ್ಮ ಬ್ಯಾಕಪ್ ಅನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಮರುಸ್ಥಾಪಿಸಲಾಗಿದೆ");
        backupAndRestorePage.clickOnCloseButton();

        backupAndRestorePage.clickOnArrowLeftButton();
        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");

        settingsPage.clickOnLanguage().clickOnTamilLanguage();

        settingsPage.clickOnDataBackupAndRestoreButton();
        assertEquals(backupAndRestorePage.getBackupAndRestoreHeaderText(), "காப்புப்பிரதி & மீட்டமை");
        assertEquals(backupAndRestorePage.getLastBackupSectionHeaderText(), "கடைசி காப்பு விவரங்கள்");
        assertEquals(backupAndRestorePage.getAccountSectionHeaderText(), "Google இயக்கக அமைப்புகள்");
        assertEquals(backupAndRestorePage.getStorageInfoText(), "நீங்கள் தேர்ந்தெடுத்த gmail கணக்குடன் தொடர்புடைய Google Drive இல் காப்புப்பிரதி சேமிக்கப்படும்.");

        backupAndRestorePage.clickOnBackUpButton();
        assertEquals(backupAndRestorePage.getDataBackupInProgressText(), "தரவு காப்புப்பிரதி செயலில் உள்ளது. தயவுசெய்து விண்ணப்பத்தை மூட வேண்டாம்.");
        assertTrue(backupAndRestorePage.isDataBackupSuccessPopupDisplayed(), "Verify if backup successful popup displayed");
        assertEquals(backupAndRestorePage.getDataBackupSuccessPopupText(), "உங்கள் காப்புப்பிரதி வெற்றிகரமாக இருந்தது!");
        backupAndRestorePage.clickOnCloseButton();

        backupAndRestorePage.clickOnRestoreButton();
        assertEquals(backupAndRestorePage.getRestoreInProgressPopupText(), "தரவு மீட்டெடுப்பு செயலில் உள்ளது. விண்ணப்பத்தை மூட வேண்டாம்.");
        assertTrue(backupAndRestorePage.isRestoreBackupSuccessPopUpDisplayed(), " Verify is restore backup successful popup displayed");
        assertEquals(backupAndRestorePage.getRestoreBackupSuccessPopUpText(), "உங்கள் காப்புப்பிரதி வெற்றிகரமாக மீட்டெடுக்கப்பட்டது");
        backupAndRestorePage.clickOnCloseButton();

        backupAndRestorePage.clickOnArrowLeftButton();
        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");

    }

    @Test
    @NeedsUIN
    public void ActiveVcAfterBackup() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        AddNewCardPage addNewCardPage = homePage.downloadCard();
        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();
        OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(getUIN()).clickOnGenerateCardButton();

        otpVerification.enterOtp(InjiWalletUtil.getOtp(), PlatformType.ANDROID);

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");

        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isDataBackupAndRestoreDisplayed(), "Verify if backup & restore displayed");
        assertTrue(settingsPage.isNewLableDisplayed(), "Verify if backup & restore new tag displayed");
        BackupAndRestorePage backupAndRestorePage = settingsPage.clickOnDataBackupAndRestoreButton();

        assertTrue(backupAndRestorePage.isBackupProcessInfoDisplayed(), "Verify if backup information displayed");
        assertTrue(backupAndRestorePage.isCloudInfoDisplayed(), "Verify if cloud information displayed");
        backupAndRestorePage.clickOnProceedButton();

        backupAndRestorePage.clickOnAddAnotherAccount();
        String email = TestDataReader.readData("emailsForBackupAndRestore");
        backupAndRestorePage.enterEmailTextBox(email);
        backupAndRestorePage.clickOnNextButton();
        backupAndRestorePage.enterPasswordTextBox(TestDataReader.readData("emailPassword"));
        backupAndRestorePage.clickOnNextButton();
        backupAndRestorePage.clickOnAgreeButton();

//        backupAndRestorePage.clickOnEmailHeader();

        assertTrue(backupAndRestorePage.isLastBackupSectionHeaderDisplayed(), "Verify if last backup section displayed");
        backupAndRestorePage.clickOnBackUpButton();
        assertTrue(backupAndRestorePage.isAccountSectionHeaderDisplayed(), "Verify if account section header displayed");
        assertTrue(backupAndRestorePage.isStorageInfoDisplayed(), "Verify if account storage info displayed");
        assertTrue(backupAndRestorePage.isAssociatedAccountDisplayed(), "Verify if associated account displayed");
        assertTrue(backupAndRestorePage.isLastBackupTimeDisplayed(), "Verify if last backup time displayed");
        assertTrue(backupAndRestorePage.isDataBackupSuccessPopupDisplayed(), "Verify if backup successful popup displayed");
        backupAndRestorePage.clickOnCloseButton();

        backupAndRestorePage.clickOnArrowLeftButton();
        homePage.clickOnHomeButton();

        MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();
        assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");
        PleaseConfirmPopupPage pleaseConfirmPopupPage = moreOptionsPage.clickOnActivationPending();

        assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if pop up page is displayed");
        OtpVerificationPage otpVerificationPage = pleaseConfirmPopupPage.clickOnConfirmButton();

        assertTrue(otpVerificationPage.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
        otpVerificationPage.enterOtp(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        assertTrue(moreOptionsPage.isVcActivatedForOnlineLogin(), "Verify if VC is activated");
    }

    @Test
    public void VerifyHelpInBackupAndRestore() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isDataBackupAndRestoreDisplayed(), "Verify if backup & restore displayed");
        assertTrue(settingsPage.isNewLableDisplayed(), "Verify if backup & restore new tag displayed");
        BackupAndRestorePage backupAndRestorePage = settingsPage.clickOnDataBackupAndRestoreButton();

        assertTrue(backupAndRestorePage.isBackupProcessInfoDisplayed(), "Verify if backup information displayed");
        assertTrue(backupAndRestorePage.isCloudInfoDisplayed(), "Verify if cloud information displayed");
        backupAndRestorePage.clickOnProceedButton();

//        backupAndRestorePage.clickOnAddAnotherAccount();
        String email = TestDataReader.readData("emailsForBackupAndRestore");
        backupAndRestorePage.enterEmailTextBox(email);
        backupAndRestorePage.clickOnNextButton();
        backupAndRestorePage.enterPasswordTextBox(TestDataReader.readData("emailPassword"));
        backupAndRestorePage.clickOnNextButton();
        backupAndRestorePage.clickOnAgreeButton();

        assertTrue(backupAndRestorePage.isLastBackupTimeDisplayed(), "Verify if help page is displayed");
        assertTrue(backupAndRestorePage.isHelpButtonDisplayed(), "Verify if help page is displayed");
        backupAndRestorePage.clickOnHelpButton();
        assertTrue(backupAndRestorePage.isBackupFQADisplayed(), "Verify if help frequntly asked quations is displayed");

    }

    @Test
    @NeedsUIN
    public void VerifyDeletingDownloadedvc() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        AddNewCardPage addNewCardPage = homePage.downloadCard();
        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();
        String uin = TestDataReader.readData("uin");
        OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(getUIN()).clickOnGenerateCardButton();

        otpVerification.enterOtp(InjiWalletUtil.getOtp(), PlatformType.ANDROID);

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");

        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isDataBackupAndRestoreDisplayed(), "Verify if backup & restore displayed");
        assertTrue(settingsPage.isNewLableDisplayed(), "Verify if backup & restore new tag displayed");
        BackupAndRestorePage backupAndRestorePage = settingsPage.clickOnDataBackupAndRestoreButton();

        assertTrue(backupAndRestorePage.isBackupProcessInfoDisplayed(), "Verify if backup information displayed");
        assertTrue(backupAndRestorePage.isCloudInfoDisplayed(), "Verify if cloud information displayed");
        backupAndRestorePage.clickOnProceedButton();

//        backupAndRestorePage.clickOnAddAnotherAccount();
        String email = TestDataReader.readData("emailsForBackupAndRestore");
        backupAndRestorePage.enterEmailTextBox(email);
        backupAndRestorePage.clickOnNextButton();
        backupAndRestorePage.enterPasswordTextBox(TestDataReader.readData("emailPassword"));
        backupAndRestorePage.clickOnNextButton();
        backupAndRestorePage.clickOnAgreeButton();

        assertTrue(backupAndRestorePage.isLastBackupSectionHeaderDisplayed(), "Verify if last backup section displayed");
        assertTrue(backupAndRestorePage.isLastBackupTimeDisplayed(), "Verify if last backup time displayed");
        backupAndRestorePage.clickOnBackUpButton();

        assertTrue(backupAndRestorePage.isAccountSectionHeaderDisplayed(), "Verify if account section header displayed");
        assertTrue(backupAndRestorePage.isStorageInfoDisplayed(), "Verify if account storage info displayed");
        assertTrue(backupAndRestorePage.isAssociatedAccountDisplayed(), "Verify if associated account displayed");
        assertTrue(backupAndRestorePage.isLastBackupTimeDisplayed(), "Verify if last backup time displayed");
        assertTrue(backupAndRestorePage.isDataBackupSuccessPopupDisplayed(), "Verify if backup successful popup displayed");
        backupAndRestorePage.clickOnCloseButton();

        backupAndRestorePage.clickOnRestoreButton();

        assertTrue(backupAndRestorePage.isRestoreSectionHeaderDisplayed(), " Verify is restore backup successful popup displayed");
        assertTrue(backupAndRestorePage.isRestoreBackupSuccessPopUpDisplayed(), " Verify is restore backup successful popup displayed");
        backupAndRestorePage.clickOnCloseButton();
        backupAndRestorePage.clickOnArrowLeftButton();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        homePage.clickOnHomeButton();

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        homePage.clickOnFirstVcsEllipsisButton();
        MoreOptionsPage moreOptionsPage = new MoreOptionsPage(getDriver());
        assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");

        PleaseConfirmPopupPage pleaseConfirmPopupPage = moreOptionsPage.clickOnActivationPending();

        assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if pop up page is displayed");
        OtpVerificationPage otpVerificationPage = pleaseConfirmPopupPage.clickOnConfirmButton();

        assertTrue(otpVerificationPage.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
        otpVerificationPage.enterOtp(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        assertTrue(moreOptionsPage.isVcActivatedForOnlineLogin(), "Verify if VC is activated");

        assertTrue(homePage.isActivatedVcPopupTextDisplayed(), "Verify if VC is activated popup displayed");
        homePage.clickPopupCloseButtonButton();

        IosUtil.scrollToElement(getDriver(), 100, 800, 100, 200);
        homePage.clickOnSecondVcsEllipsisButton();

        assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");

        moreOptionsPage.clickOnRemoveFromWallet();
        assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if pop up page is displayed");

        pleaseConfirmPopupPage.clickOnConfirmButton();
        assertTrue(moreOptionsPage.isVcActivatedDisplayed(), "Verify if VC is activated");

    }

    @Test
    @NeedsUIN
    public void VerifyDeletingRestoredvc() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        AddNewCardPage addNewCardPage = homePage.downloadCard();
        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();
        String uin = TestDataReader.readData("uin");
        OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(getUIN()).clickOnGenerateCardButton();

        otpVerification.enterOtp(InjiWalletUtil.getOtp(), PlatformType.ANDROID);

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");

        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isDataBackupAndRestoreDisplayed(), "Verify if backup & restore displayed");
        assertTrue(settingsPage.isNewLableDisplayed(), "Verify if backup & restore new tag displayed");
        BackupAndRestorePage backupAndRestorePage = settingsPage.clickOnDataBackupAndRestoreButton();

        assertTrue(backupAndRestorePage.isBackupProcessInfoDisplayed(), "Verify if backup information displayed");
        assertTrue(backupAndRestorePage.isCloudInfoDisplayed(), "Verify if cloud information displayed");
        backupAndRestorePage.clickOnProceedButton();

//        backupAndRestorePage.clickOnAddAnotherAccount();
        String email = TestDataReader.readData("emailsForBackupAndRestore");
        backupAndRestorePage.enterEmailTextBox(email);
        backupAndRestorePage.clickOnNextButton();
        backupAndRestorePage.enterPasswordTextBox(TestDataReader.readData("emailPassword"));
        backupAndRestorePage.clickOnNextButton();
        backupAndRestorePage.clickOnAgreeButton();

        assertTrue(backupAndRestorePage.isLastBackupSectionHeaderDisplayed(), "Verify if last backup section displayed");
        assertTrue(backupAndRestorePage.isLastBackupTimeDisplayed(), "Verify if last backup time displayed");
        backupAndRestorePage.clickOnBackUpButton();

        assertTrue(backupAndRestorePage.isAccountSectionHeaderDisplayed(), "Verify if account section header displayed");
        assertTrue(backupAndRestorePage.isStorageInfoDisplayed(), "Verify if account storage info displayed");
        assertTrue(backupAndRestorePage.isAssociatedAccountDisplayed(), "Verify if associated account displayed");
        assertTrue(backupAndRestorePage.isLastBackupTimeDisplayed(), "Verify if last backup time displayed");
        assertTrue(backupAndRestorePage.isDataBackupSuccessPopupDisplayed(), "Verify if backup successful popup displayed");
        backupAndRestorePage.clickOnCloseButton();

        backupAndRestorePage.clickOnRestoreButton();

        assertTrue(backupAndRestorePage.isRestoreSectionHeaderDisplayed(), " Verify is restore backup successful popup displayed");
        assertTrue(backupAndRestorePage.isRestoreInProgressPopupTextDisplayed(), " Verify is restore in progress popup displayed");
        assertTrue(backupAndRestorePage.isRestoreBackupSuccessPopUpDisplayed(), " Verify is restore backup successful popup displayed");
        backupAndRestorePage.clickOnCloseButton();
        backupAndRestorePage.clickOnArrowLeftButton();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        homePage.clickOnHomeButton();

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        IosUtil.scrollToElement(getDriver(), 100, 800, 100, 200);
        homePage.clickOnSecondVcsEllipsisButton();
        MoreOptionsPage moreOptionsPage = new MoreOptionsPage(getDriver());
        assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");

        PleaseConfirmPopupPage pleaseConfirmPopupPage = moreOptionsPage.clickOnActivationPending();

        assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if pop up page is displayed");
        OtpVerificationPage otpVerificationPage = pleaseConfirmPopupPage.clickOnConfirmButton();

        assertTrue(otpVerificationPage.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
        otpVerificationPage.enterOtp(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        assertTrue(moreOptionsPage.isVcActivatedForOnlineLogin(), "Verify if VC is activated");
        assertTrue(homePage.isActivatedVcPopupTextDisplayed(), "Verify if VC is activated popup displayed");
        homePage.clickPopupCloseButtonButton();

        homePage.clickOnFirstVcsEllipsisButton();
        assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");

        moreOptionsPage.clickOnRemoveFromWallet();
        assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if pop up page is displayed");

        pleaseConfirmPopupPage.clickOnConfirmButton();
        assertTrue(moreOptionsPage.isVcActivatedDisplayed(), "Verify if VC is activated");

    }

    @Test
    @NeedsUIN
    public void VerifyPiningDownloadedVc() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        AddNewCardPage addNewCardPage = homePage.downloadCard();
        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();
        OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(getUIN()).clickOnGenerateCardButton();

        otpVerification.enterOtp(InjiWalletUtil.getOtp(), PlatformType.ANDROID);
        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");

        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isDataBackupAndRestoreDisplayed(), "Verify if backup & restore displayed");
        assertTrue(settingsPage.isNewLableDisplayed(), "Verify if backup & restore new tag displayed");
        BackupAndRestorePage backupAndRestorePage = settingsPage.clickOnDataBackupAndRestoreButton();

        assertTrue(backupAndRestorePage.isBackupProcessInfoDisplayed(), "Verify if backup information displayed");
        assertTrue(backupAndRestorePage.isCloudInfoDisplayed(), "Verify if cloud information displayed");
        backupAndRestorePage.clickOnProceedButton();

//        backupAndRestorePage.clickOnAddAnotherAccount();
        String email = TestDataReader.readData("emailsForBackupAndRestore");
        backupAndRestorePage.enterEmailTextBox(email);
        backupAndRestorePage.clickOnNextButton();
        backupAndRestorePage.enterPasswordTextBox(TestDataReader.readData("emailPassword"));
        backupAndRestorePage.clickOnNextButton();
        backupAndRestorePage.clickOnAgreeButton();

        assertTrue(backupAndRestorePage.isLastBackupSectionHeaderDisplayed(), "Verify if last backup section displayed");
        assertTrue(backupAndRestorePage.isLastBackupTimeDisplayed(), "Verify if last backup time displayed");
        backupAndRestorePage.clickOnBackUpButton();

        assertTrue(backupAndRestorePage.isAccountSectionHeaderDisplayed(), "Verify if account section header displayed");
        assertTrue(backupAndRestorePage.isStorageInfoDisplayed(), "Verify if account storage info displayed");
        assertTrue(backupAndRestorePage.isAssociatedAccountDisplayed(), "Verify if associated account displayed");
        assertTrue(backupAndRestorePage.isLastBackupTimeDisplayed(), "Verify if last backup time displayed");
        assertTrue(backupAndRestorePage.isDataBackupSuccessPopupDisplayed(), "Verify if backup successful popup displayed");
        backupAndRestorePage.clickOnCloseButton();

        backupAndRestorePage.clickOnRestoreButton();

        assertTrue(backupAndRestorePage.isRestoreSectionHeaderDisplayed(), " Verify is restore backup successful popup displayed");
        assertTrue(backupAndRestorePage.isRestoreBackupSuccessPopUpDisplayed(), " Verify is restore backup successful popup displayed");
        backupAndRestorePage.clickOnCloseButton();
        backupAndRestorePage.clickOnArrowLeftButton();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        homePage.clickOnHomeButton();

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        IosUtil.scrollToElement(getDriver(), 100, 800, 100, 200);
        homePage.clickOnSecondVcsEllipsisButton();
        MoreOptionsPage moreOptionsPage = new MoreOptionsPage(getDriver());
        assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");

        PleaseConfirmPopupPage pleaseConfirmPopupPage = moreOptionsPage.clickOnActivationPending();

        assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if pop up page is displayed");
        OtpVerificationPage otpVerificationPage = pleaseConfirmPopupPage.clickOnConfirmButton();

        assertTrue(otpVerificationPage.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
        otpVerificationPage.enterOtp(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        assertTrue(moreOptionsPage.isVcActivatedForOnlineLogin(), "Verify if VC is activated");
        homePage.clickOnSecondVcsEllipsisButton();
        assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");
        moreOptionsPage.clickOnPinOrUnPinCard();
        assertTrue(homePage.isActivatedVcPopupTextDisplayed(), "Verify if VC is activated popup displayed");
        homePage.clickPopupCloseButtonButton();

        assertTrue(homePage.isPinIconDisplayed(), "Verify if VC is pined icon displayed");
        assertTrue(moreOptionsPage.isVcActivatedForOnlineLogin(), "Verify if VC is activaed for login use displayed");
    }

    @Test
    @NeedsUIN
    public void VerifyPiningRestoredVc() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        AddNewCardPage addNewCardPage = homePage.downloadCard();
        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();
        OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(getUIN()).clickOnGenerateCardButton();

        otpVerification.enterOtp(InjiWalletUtil.getOtp(), PlatformType.ANDROID);

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");

        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isDataBackupAndRestoreDisplayed(), "Verify if backup & restore displayed");
        assertTrue(settingsPage.isNewLableDisplayed(), "Verify if backup & restore new tag displayed");
        BackupAndRestorePage backupAndRestorePage = settingsPage.clickOnDataBackupAndRestoreButton();

        assertTrue(backupAndRestorePage.isBackupProcessInfoDisplayed(), "Verify if backup information displayed");
        assertTrue(backupAndRestorePage.isCloudInfoDisplayed(), "Verify if cloud information displayed");
        backupAndRestorePage.clickOnProceedButton();

        backupAndRestorePage.clickOnAddAnotherAccount();
        String email = TestDataReader.readData("emailsForBackupAndRestore");
        backupAndRestorePage.enterEmailTextBox(email);
        backupAndRestorePage.clickOnNextButton();
        backupAndRestorePage.enterPasswordTextBox(TestDataReader.readData("emailPassword"));
        backupAndRestorePage.clickOnNextButton();
        backupAndRestorePage.clickOnAgreeButton();

        assertTrue(backupAndRestorePage.isLastBackupSectionHeaderDisplayed(), "Verify if last backup section displayed");
        assertTrue(backupAndRestorePage.isLastBackupTimeDisplayed(), "Verify if last backup time displayed");
        backupAndRestorePage.clickOnBackUpButton();

        assertTrue(backupAndRestorePage.isAccountSectionHeaderDisplayed(), "Verify if account section header displayed");
        assertTrue(backupAndRestorePage.isStorageInfoDisplayed(), "Verify if account storage info displayed");
        assertTrue(backupAndRestorePage.isAssociatedAccountDisplayed(), "Verify if associated account displayed");
        assertTrue(backupAndRestorePage.isLastBackupTimeDisplayed(), "Verify if last backup time displayed");
        assertTrue(backupAndRestorePage.isDataBackupSuccessPopupDisplayed(), "Verify if backup successful popup displayed");
        backupAndRestorePage.clickOnCloseButton();

        backupAndRestorePage.clickOnRestoreButton();

        assertTrue(backupAndRestorePage.isRestoreSectionHeaderDisplayed(), " Verify is restore backup successful popup displayed");
        assertTrue(backupAndRestorePage.isRestoreBackupSuccessPopUpDisplayed(), " Verify is restore backup successful popup displayed");
        backupAndRestorePage.clickOnCloseButton();
        backupAndRestorePage.clickOnArrowLeftButton();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        homePage.clickOnHomeButton();

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        homePage.clickOnFirstVcsEllipsisButton();
        MoreOptionsPage moreOptionsPage = new MoreOptionsPage(getDriver());
        assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");

        PleaseConfirmPopupPage pleaseConfirmPopupPage = moreOptionsPage.clickOnActivationPending();

        assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if pop up page is displayed");
        OtpVerificationPage otpVerificationPage = pleaseConfirmPopupPage.clickOnConfirmButton();

        assertTrue(otpVerificationPage.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
        otpVerificationPage.enterOtp(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        assertTrue(moreOptionsPage.isVcActivatedForOnlineLogin(), "Verify if VC is activated");
        homePage.clickOnFirstVcsEllipsisButton();
        moreOptionsPage.clickOnPinOrUnPinCard();


        assertTrue(homePage.isActivatedVcPopupTextDisplayed(), "Verify if VC is activated popup displayed");
        homePage.clickPopupCloseButtonButton();

        assertTrue(homePage.isPinIconDisplayed(), "Verify if VC is pined icon displayed");
        assertTrue(moreOptionsPage.isVcActivatedForOnlineLogin(), "Verify if VC is activaed for login use displayed");
    }

    @Test
    @NeedsUIN
    public void ActiveVcBeforeAndAfterBackup() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        AddNewCardPage addNewCardPage = homePage.downloadCard();

        assertTrue(addNewCardPage.isAddNewCardPageLoaded(), "Verify if add new card page is displayed");
        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();

        assertTrue(retrieveIdPage.isRetrieveIdPageLoaded(), "Verify if retrieve id page is displayed");
        String uin = TestDataReader.readData("uin");
        OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(getUIN()).clickOnGenerateCardButton();

        assertTrue(otpVerification.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
        otpVerification.enterOtp(InjiWalletUtil.getOtp(), PlatformType.ANDROID);

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        MoreOptionsPage moreOptionsPage = homePage.clickOnMoreOptionsButton();

        assertTrue(moreOptionsPage.isMoreOptionsPageLoaded(), "Verify if more options page is displayed");
        PleaseConfirmPopupPage pleaseConfirmPopupPage = moreOptionsPage.clickOnActivationPending();

        assertTrue(pleaseConfirmPopupPage.isPleaseConfirmPopupPageLoaded(), "Verify if pop up page is displayed");
        OtpVerificationPage otpVerificationPage = pleaseConfirmPopupPage.clickOnConfirmButton();

        assertTrue(otpVerificationPage.isOtpVerificationPageLoaded(), "Verify if otp verification page is displayed");
        otpVerificationPage.enterOtp(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        assertTrue(moreOptionsPage.isVcActivatedForOnlineLogin(), "Verify if VC is activated");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isDataBackupAndRestoreDisplayed(), "Verify if backup & restore displayed");
        assertTrue(settingsPage.isNewLableDisplayed(), "Verify if backup & restore new tag displayed");
        BackupAndRestorePage backupAndRestorePage = settingsPage.clickOnDataBackupAndRestoreButton();

        assertTrue(backupAndRestorePage.isBackupProcessInfoDisplayed(), "Verify if backup information displayed");
        assertTrue(backupAndRestorePage.isCloudInfoDisplayed(), "Verify if cloud information displayed");
        backupAndRestorePage.clickOnProceedButton();

//        backupAndRestorePage.clickOnAddAnotherAccount();
        String email = TestDataReader.readData("emailsForBackupAndRestore");
        backupAndRestorePage.enterEmailTextBox(email);
        backupAndRestorePage.clickOnNextButton();
        backupAndRestorePage.enterPasswordTextBox(TestDataReader.readData("emailPassword"));
        backupAndRestorePage.clickOnNextButton();
        backupAndRestorePage.clickOnAgreeButton();

        backupAndRestorePage.clickOnEmailHeader();


        assertTrue(backupAndRestorePage.isLastBackupSectionHeaderDisplayed(), "Verify if last backup section displayed");
        backupAndRestorePage.clickOnBackUpButton();
        assertTrue(backupAndRestorePage.isAccountSectionHeaderDisplayed(), "Verify if account section header displayed");
        assertTrue(backupAndRestorePage.isStorageInfoDisplayed(), "Verify if account storage info displayed");
        assertTrue(backupAndRestorePage.isAssociatedAccountDisplayed(), "Verify if associated account displayed");
        assertTrue(backupAndRestorePage.isLastBackupTimeDisplayed(), "Verify if last backup time displayed");
        assertTrue(backupAndRestorePage.isDataBackupSuccessPopupDisplayed(), "Verify if backup successful popup displayed");
        backupAndRestorePage.clickOnCloseButton();

        backupAndRestorePage.clickOnRestoreButton();
        assertTrue(backupAndRestorePage.isRestoreSectionHeaderDisplayed(), " Verify is restore backup successful popup displayed");
        assertTrue(backupAndRestorePage.isRestoreBackupSuccessPopUpDisplayed(), " Verify is restore backup successful popup displayed");
        backupAndRestorePage.clickOnCloseButton();
        backupAndRestorePage.clickOnArrowLeftButton();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        homePage.clickOnHomeButton();

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");
        assertTrue(moreOptionsPage.isVcActivatedForOnlineLogin(), "Verify if VC is activated");
    }

    @Test
    @NeedsUIN
    public void VcBackupAndRestoreTestAndCheckBackupTosterInOtherPages() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        AddNewCardPage addNewCardPage = homePage.downloadCard();
        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();
        String uin = TestDataReader.readData("uin");
        OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(getUIN()).clickOnGenerateCardButton();

        otpVerification.enterOtp(InjiWalletUtil.getOtp(), PlatformType.ANDROID);

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");

        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isDataBackupAndRestoreDisplayed(), "Verify if backup & restore displayed");
        assertTrue(settingsPage.isNewLableDisplayed(), "Verify if backup & restore new tag displayed");
        BackupAndRestorePage backupAndRestorePage = settingsPage.clickOnDataBackupAndRestoreButton();

        assertTrue(backupAndRestorePage.isBackupProcessInfoDisplayed(), "Verify if backup information displayed");
        assertTrue(backupAndRestorePage.isCloudInfoDisplayed(), "Verify if cloud information displayed");
        backupAndRestorePage.clickOnProceedButton();

        backupAndRestorePage.clickOnAddAnotherAccount();
        String email = TestDataReader.readData("emailsForBackupAndRestore");
        backupAndRestorePage.enterEmailTextBox(email);
        backupAndRestorePage.clickOnNextButton();
        backupAndRestorePage.enterPasswordTextBox(TestDataReader.readData("emailPassword"));
        backupAndRestorePage.clickOnNextButton();
        backupAndRestorePage.clickOnAgreeButton();

//        backupAndRestorePage.clickOnEmailHeader();

        assertTrue(backupAndRestorePage.isLastBackupSectionHeaderDisplayed(), "Verify if last backup section displayed");
        backupAndRestorePage.clickOnBackUpButton();

        assertTrue(backupAndRestorePage.isDataBackupInProgressTextDisplayed(), "verify if data backup in progress popup displayed");
        assertTrue(backupAndRestorePage.isAccountSectionHeaderDisplayed(), "Verify if account section header displayed");
        assertTrue(backupAndRestorePage.isLastBackupTimeDisplayed(), "Verify if last backup time displayed");
        assertFalse(backupAndRestorePage.isDataBackupInProgressTextDisappear(), "verify if data backup in progress Disappear");
        assertTrue(backupAndRestorePage.isStorageInfoDisplayed(), "Verify if account storage info displayed");
        assertTrue(backupAndRestorePage.isAssociatedAccountDisplayed(), "Verify if associated account displayed");
        assertTrue(backupAndRestorePage.isLastBackupTimeDisplayed(), "Verify if last backup time displayed");
        assertTrue(backupAndRestorePage.isDataBackupSuccessPopupDisplayed(), "Verify if backup successful popup displayed");

        backupAndRestorePage.clickOnArrowLeftButton();
        assertTrue(backupAndRestorePage.isDataBackupSuccessPopupDisplayed(), "Verify if backup successful popup displayed");
        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        homePage.clickOnHomeButton();
        assertTrue(backupAndRestorePage.isDataBackupSuccessPopupDisplayed(), "Verify if backup successful popup displayed");

        homePage.clickOnSettingIcon();
        assertTrue(backupAndRestorePage.isDataBackupSuccessPopupDisplayed(), "Verify if backup successful popup displayed");
        settingsPage.clickOnDataBackupAndRestoreButton();
        backupAndRestorePage.clickOnRestoreButton();

        assertTrue(backupAndRestorePage.isRestoreSectionHeaderDisplayed(), " Verify is restore backup successful popup displayed");
        assertTrue(backupAndRestorePage.isRestoreBackupSuccessPopUpDisplayed(), " Verify is restore backup successful popup displayed");
        backupAndRestorePage.clickOnCloseButton();
        backupAndRestorePage.clickOnArrowLeftButton();

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        homePage.clickOnHomeButton();

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");

        homePage.clickOnHistoryButton();
        assertTrue(backupAndRestorePage.isDataBackupSuccessPopupDisplayed(), "Verify if backup successful popup displayed");

        homePage.clickOnHomeButton();
        homePage.clickOnHelpIcon();
        assertTrue(backupAndRestorePage.isDataBackupSuccessPopupDisplayed(), "Verify if backup successful popup displayed");

    }

    @Test
    @NeedsUIN
    public void VcBackupAndRestoreTestAndCheckRestoreTosterInOtherPages() throws InterruptedException {
        ChooseLanguagePage chooseLanguagePage = new ChooseLanguagePage(getDriver());

        assertTrue(chooseLanguagePage.isChooseLanguagePageLoaded(), "Verify if choose language page is displayed");
        WelcomePage welcomePage = chooseLanguagePage.clickOnSavePreference();

        assertTrue(welcomePage.isWelcomePageLoaded(), "Verify if welcome page is loaded");
        AppUnlockMethodPage appUnlockMethodPage = welcomePage.clickOnSkipButton();

        assertTrue(appUnlockMethodPage.isAppUnlockMethodPageLoaded(), "Verify if app unlocked page is displayed");
        SetPasscode setPasscode = appUnlockMethodPage.clickOnUsePasscode();

        assertTrue(setPasscode.isSetPassCodePageLoaded(), "Verify if set passcode page is displayed");
        ConfirmPasscode confirmPasscode = setPasscode.enterPasscode(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        assertTrue(confirmPasscode.isConfirmPassCodePageLoaded(), "Verify if confirm passcode page is displayed");
        HomePage homePage = confirmPasscode.enterPasscodeInConfirmPasscodePage(TestDataReader.readData("passcode"), PlatformType.ANDROID);

        homePage.clickOnNextButtonForInjiTour();
        AddNewCardPage addNewCardPage = homePage.downloadCard();
        RetrieveIdPage retrieveIdPage = addNewCardPage.clickOnDownloadViaUin();
        String uin = TestDataReader.readData("uin");
        OtpVerificationPage otpVerification = retrieveIdPage.setEnterIdTextBox(getUIN()).clickOnGenerateCardButton();

        otpVerification.enterOtp(InjiWalletUtil.getOtp(), PlatformType.ANDROID);

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");

        assertTrue(homePage.isHomePageLoaded(), "Verify if home page is displayed");
        SettingsPage settingsPage = homePage.clickOnSettingIcon();

        assertTrue(settingsPage.isDataBackupAndRestoreDisplayed(), "Verify if backup & restore displayed");
        assertTrue(settingsPage.isNewLableDisplayed(), "Verify if backup & restore new tag displayed");
        BackupAndRestorePage backupAndRestorePage = settingsPage.clickOnDataBackupAndRestoreButton();

        assertTrue(backupAndRestorePage.isBackupProcessInfoDisplayed(), "Verify if backup information displayed");
        assertTrue(backupAndRestorePage.isCloudInfoDisplayed(), "Verify if cloud information displayed");
        backupAndRestorePage.clickOnProceedButton();

        backupAndRestorePage.clickOnAddAnotherAccount();
        String email = TestDataReader.readData("emailsForBackupAndRestore");
        backupAndRestorePage.enterEmailTextBox(email);
        backupAndRestorePage.clickOnNextButton();
        backupAndRestorePage.enterPasswordTextBox(TestDataReader.readData("emailPassword"));
        backupAndRestorePage.clickOnNextButton();
        backupAndRestorePage.clickOnAgreeButton();

//        backupAndRestorePage.clickOnEmailHeader();

        assertTrue(backupAndRestorePage.isLastBackupSectionHeaderDisplayed(), "Verify if last backup section displayed");
        backupAndRestorePage.clickOnBackUpButton();

        assertTrue(backupAndRestorePage.isDataBackupInProgressTextDisplayed(), "verify if data backup in progress popup displayed");
        assertTrue(backupAndRestorePage.isAccountSectionHeaderDisplayed(), "Verify if account section header displayed");
        assertTrue(backupAndRestorePage.isLastBackupTimeDisplayed(), "Verify if last backup time displayed");
        assertFalse(backupAndRestorePage.isDataBackupInProgressTextDisappear(), "verify if data backup in progress Disappear");
        assertTrue(backupAndRestorePage.isStorageInfoDisplayed(), "Verify if account storage info displayed");
        assertTrue(backupAndRestorePage.isAssociatedAccountDisplayed(), "Verify if associated account displayed");
        assertTrue(backupAndRestorePage.isLastBackupTimeDisplayed(), "Verify if last backup time displayed");
        assertTrue(backupAndRestorePage.isDataBackupSuccessPopupDisplayed(), "Verify if backup successful popup displayed");
        backupAndRestorePage.clickOnCloseButton();
        backupAndRestorePage.clickOnRestoreButton();
        assertTrue(backupAndRestorePage.isRestoreBackupSuccessPopUpDisplayed(), " Verify is restore backup successful popup displayed");

        backupAndRestorePage.clickOnArrowLeftButton();
        assertTrue(backupAndRestorePage.isRestoreBackupSuccessPopUpDisplayed(), " Verify is restore backup successful popup displayed");
        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        homePage.clickOnHomeButton();
        assertTrue(backupAndRestorePage.isRestoreBackupSuccessPopUpDisplayed(), " Verify is restore backup successful popup displayed");

        homePage.clickOnSettingIcon();
        assertTrue(backupAndRestorePage.isRestoreBackupSuccessPopUpDisplayed(), " Verify is restore backup successful popup displayed");

        assertTrue(settingsPage.isSettingPageLoaded(), "Verify if setting page is displayed");
        homePage.clickOnHomeButton();

        addNewCardPage.clickOnDoneButton();
        assertTrue(homePage.isCredentialTypeValueDisplayed(), "Verify if credential type value is displayed");

        homePage.clickOnHistoryButton();
        assertTrue(backupAndRestorePage.isRestoreBackupSuccessPopUpDisplayed(), " Verify is restore backup successful popup displayed");

        homePage.clickOnHomeButton();
        homePage.clickOnHelpIcon();
        assertTrue(backupAndRestorePage.isRestoreBackupSuccessPopUpDisplayed(), " Verify is restore backup successful popup displayed");

    }
}