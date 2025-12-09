package inji.pages;

import io.appium.java_client.AppiumDriver;
import io.appium.java_client.pagefactory.AndroidFindBy;
import org.openqa.selenium.WebElement;

public class BackupAndRestorePage extends BasePage {

    @AndroidFindBy(accessibility = "backupAndRestore")
    private WebElement backupAndRestoreHeader;

    @AndroidFindBy(accessibility = "backupProcessInfo")
    private WebElement backupProcessInfo;

    @AndroidFindBy(accessibility = "cloudInfo")
    private WebElement cloudInfo;

    @AndroidFindBy(accessibility = "googleDriveTitle")
    private WebElement googleDriveTitle;

    @AndroidFindBy(accessibility = "googleDriveIcon")
    private WebElement googleDriveIcon;

    @AndroidFindBy(accessibility = "goBack")
    private WebElement goBackButton;

    @AndroidFindBy(className = "android.view.View")
    private WebElement proceedButton;

    @AndroidFindBy(uiAutomator = "new UiSelector().textContains(\"Add another account\")")
    public WebElement addAnotherAccount;

    @AndroidFindBy(xpath = "//android.widget.TextView[@resource-id=\"com.google.android.gms:id/main_title\"]")
    private WebElement chooseAccountHeader;

    @AndroidFindBy(xpath = "//android.widget.EditText")
    private WebElement enterEmail;

    @AndroidFindBy(uiAutomator = "new UiSelector().textContains(\"Next\")")
    public WebElement nextButton;

    @AndroidFindBy(uiAutomator = "new UiSelector().textContains(\"Cancel\")")
    public WebElement cancelButton;

    @AndroidFindBy(className = "android.widget.EditText")
    private WebElement enterPassword;

    @AndroidFindBy(uiAutomator = "new UiSelector().textContains(\"Turn on backup\")")
    public WebElement turnOnBackupButton;

    @AndroidFindBy(xpath = "//android.widget.Button[@text=\"I agree\"]")
    public WebElement agreeButton;

    @AndroidFindBy(accessibility = "backup")
    private WebElement BackupButton;

    @AndroidFindBy(accessibility = "restore")
    private WebElement restoreButton;

    @AndroidFindBy(accessibility = "lastBackupTime")
    private WebElement lastBackupTime;

    @AndroidFindBy(accessibility = "dataBackupSuccessPopupText")
    private WebElement dataBackupSuccessPopup;

    @AndroidFindBy(accessibility = "close")
    private WebElement closeButton;

    @AndroidFindBy(accessibility = "dataBackupInProgressText")
    private WebElement dataBackupInProgressText;

    @AndroidFindBy(accessibility = "arrow-left")
    private WebElement arrowLeftButton;

    @AndroidFindBy(accessibility = "associatedAccountEmail")
    private WebElement associatedAccountEmail;

    @AndroidFindBy(accessibility = "restoreBackupSuccessPopupText")
    private WebElement restoreBackupSuccessPopUp;

    @AndroidFindBy(accessibility = "CloudBackupConsentDeniedTitle")
    private WebElement permissionDeniedHeader;

    @AndroidFindBy(accessibility = "CloudBackupConsentDeniedMessage")
    private WebElement errorMessageDescription;

    @AndroidFindBy(accessibility = "errorHelpText")
    private WebElement errorHelpText;


    @AndroidFindBy(accessibility = "allowAccess")
    private WebElement allowAccessButton;

    @AndroidFindBy(accessibility = "LastBackupSectionHeader")
    private WebElement lastBackupSectionHeader;

    @AndroidFindBy(accessibility = "AccountSectionHeader")
    private WebElement AccountSectionHeader;

    @AndroidFindBy(accessibility = "storageInfo")
    private WebElement storageInfo;

    @AndroidFindBy(accessibility = "associatedAccountEmail")
    private WebElement associatedAccount;

    @AndroidFindBy(accessibility = "restoreSectionHeader")
    private WebElement restoreSectionHeader;

    @AndroidFindBy(accessibility = "restoreFailure-noBackupFilePopup")
    private WebElement restoreFailurePopup;

    @AndroidFindBy(accessibility = "restoreInfo")
    private WebElement restoreInfo;

    @AndroidFindBy(xpath = "//*[@resource-id=\"help\"]")
    private WebElement helpButton;

    @AndroidFindBy(xpath = "//*[@resource-id=\"com.google.android.gms:id/account_display_name\"]")
    private WebElement selectAccount;

    @AndroidFindBy(accessibility = "restoreInProgressText")
    private WebElement restoreInProgressPopupText;


    public BackupAndRestorePage(AppiumDriver driver) {
        super(driver);
    }

    public void clickOnProceedButton() {
        click(proceedButton, "Click on the Proceed button");
    }

    public boolean isBackupProcessInfoDisplayed() {
        return isElementVisible(backupProcessInfo, "Check if backup process info is displayed");
    }

    public boolean isCloudInfoDisplayed() {
        return isElementVisible(cloudInfo, "Check if cloud info is displayed");
    }

    public void clickOnAddAnotherAccount() {
        click(addAnotherAccount, "Click on 'Add Another Account' option");
    }

    public void enterEmailTextBox(String fullName) {
        enterText(enterEmail, fullName, "Enter email in the email text box");
    }

    public void enterPasswordTextBox(String password) {
        enterText(enterPassword, password, "Enter password in the password text box");
    }

    public void clickOnAgreeButton() {
        click(agreeButton, "Click on Agree button");
    }

    public void clickOnRestoreButton() {
        click(restoreButton, "Click on Restore button");
    }

    public void clickOnBackUpButton() {
        click(BackupButton, "Click on Backup button");
    }

    public boolean isLastBackupTimeDisplayed() {
        return isElementVisible(lastBackupTime, 40, "Check if last backup time is displayed");
    }

    public boolean isDataBackupSuccessPopupDisplayed() {
        return retryVisible(dataBackupSuccessPopup, "Check if Data Backup Success popup is displayed");
    }

    public void clickOnCloseButton() {
        click(closeButton, "Click on Close button");
    }

    public void clickOnArrowLeftButton() {
        click(arrowLeftButton, "Click on Left Arrow button");
    }

    public void clickOnNextButton() {
        click(nextButton, "Click on Next button");
    }

    public void clickOnCancelButton() {
        click(cancelButton, "Click on Cancel button");
    }

    public boolean isAssociatedAccountEmailDisplayed() {
        return isElementVisible(associatedAccountEmail, "Check if associated account email is displayed");
    }

    public boolean isRestoreBackupSuccessPopUpDisplayed() {
        return retryVisible(restoreBackupSuccessPopUp, "Check if Restore Backup Success popup is displayed");
    }

    public boolean isPermissionDeniedHeaderDisplayed() {
        return isElementVisible(permissionDeniedHeader, "Check if Permission Denied header is displayed");
    }

    public boolean isErrorMessageDescriptionDisplayed() {
        return isElementVisible(errorMessageDescription, "Check if error message description is displayed");
    }

    public boolean isErrorHelpTextDisplayed() {
        return isElementVisible(errorHelpText, "Check if error help text is displayed");
    }

    public void clickOnAllowAccessButton() {
        click(allowAccessButton, "Click on Allow Access button");
    }

    public void clickOnGoBackButton() {
        click(goBackButton, "Click on Go Back button");
    }

    public boolean isChooseAccountHeaderDisplayed() {
        return isElementVisible(chooseAccountHeader, "Check if Choose Account header is displayed");
    }

    public boolean isLastBackupSectionHeaderDisplayed() {
        return isElementVisible(lastBackupSectionHeader, 50, "Check if Last Backup section header is displayed");
    }

    public boolean isAccountSectionHeaderDisplayed() {
        return isElementVisible(AccountSectionHeader, "Check if Account section header is displayed");
    }

    public boolean isStorageInfoDisplayed() {
        return isElementVisible(storageInfo, "Check if storage info is displayed");
    }

    public boolean isAssociatedAccountDisplayed() {
        return isElementVisible(associatedAccount, "Check if associated account is displayed");
    }

    public boolean isRestoreSectionHeaderDisplayed() {
        return isElementVisible(restoreSectionHeader, "Check if Restore section header is displayed");
    }

    public boolean isRestoreFailurePopupHeaderDisplayed() {
        return isElementVisible(restoreFailurePopup, "Check if Restore Failure popup header is displayed");
    }

    public String getLastBackupSectionHeaderText() {
        return getText(lastBackupSectionHeader, "Get text of Last Backup section header");
    }

    public String getAccountSectionHeaderText() {
        return getText(AccountSectionHeader, "Get text of Account section header");
    }

    public String getStorageInfoText() {
        return getText(storageInfo, "Get text of storage info");
    }

    public String getRestoreInfoText() {
        return getText(restoreInfo, "Get text of restore info");
    }

    public String getBackupAndRestoreHeaderText() {
        return getText(backupAndRestoreHeader, "Get text of Backup and Restore header");
    }

    public boolean isHelpButtonDisplayed() {
        return isElementVisible(helpButton, 30, "Check if Help button is displayed");
    }

    public void clickOnHelpButton() {
        click(helpButton, "Click on Help button");
    }

    public void clickOnEmailHeader() {
        click(selectAccount, "Click on email account header to select it");
    }

    public boolean isBackupFQADisplayed() {
        String pageSource = driver.getPageSource();
        return pageSource.contains("Why should I take a backup?")
                && pageSource.contains("What is data backup? ")
                && pageSource.contains("How to backup to your google account?");
    }

    public boolean isDataBackupInProgressTextDisplayed() {
        return isElementVisible(dataBackupInProgressText, 30, "Check if Data Backup In Progress text is displayed");
    }

    public boolean isDataBackupInProgressTextDisappear() {
        return isElementVisible(dataBackupInProgressText, 20, "Check if Data Backup In Progress text disappeared");
    }

    public String getDataBackupInProgressText() {
        return getText(dataBackupInProgressText, "Get text of Data Backup In Progress popup");
    }

    public String getDataBackupSuccessPopupText() {
        return getText(dataBackupSuccessPopup, "Get text of Data Backup Success popup");
    }

    public String getRestoreBackupSuccessPopUpText() {
        return getText(restoreBackupSuccessPopUp, "Get text of Restore Backup Success popup");
    }

    public String getRestoreInProgressPopupText() {
        return getText(restoreInProgressPopupText, "Get text of Restore In Progress popup");
    }

    public boolean isRestoreInProgressPopupTextDisplayed() {
        return isElementVisible(restoreInProgressPopupText, 20, "Check if Restore In Progress popup is displayed");
    }

}