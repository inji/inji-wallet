package inji.pages;

import io.appium.java_client.AppiumDriver;
import io.appium.java_client.pagefactory.AndroidFindBy;
import io.appium.java_client.pagefactory.iOSXCUITFindBy;
import org.openqa.selenium.WebElement;

import java.util.HashMap;
import java.util.Map;

public class BackupDataTourPage extends BasePage {

    @AndroidFindBy(accessibility = "introTitle-five")
    @iOSXCUITFindBy(accessibility = "introTitle-five")
    private WebElement backupDataText;

    @AndroidFindBy(accessibility = "introText-five")
    @iOSXCUITFindBy(accessibility = "introText-five")
    private WebElement backupDataDescription;

    @AndroidFindBy(accessibility = "goBack")
    @iOSXCUITFindBy(accessibility = "goBack")
    public WebElement goBackButton;

    @AndroidFindBy(accessibility = "AccountSectionHeader")
    @iOSXCUITFindBy(accessibility = "AccountSectionHeader")
    private WebElement AccountSectionHeader;

    @AndroidFindBy(accessibility = "LastBackupSectionHeader")
    @iOSXCUITFindBy(accessibility = "LastBackupSectionHeader")
    private WebElement LastBackupSectionHeader;

    @AndroidFindBy(xpath = "(//android.widget.TextView[@text=\"Backup & Restore\"])[2]")
    @iOSXCUITFindBy(accessibility = "AccountSectionHeader")
    private WebElement BackupAndRestore;

    public BackupDataTourPage(AppiumDriver driver) {
        super(driver);
    }

    private static final Map<String, Map<String, String>> LANGUAGE_TEXT_MAP = new HashMap<>();

    static {
        Map<String, String> backupAndRestore = new HashMap<>();
        backupAndRestore.put("English", "Backup & Restore");
        backupAndRestore.put("Tamil", "காப்புப்பிரதி மற்றும் மீட்டமை");
        backupAndRestore.put("Kannada", "ಬ್ಯಾಕಪ್ & ಮರುಸ್ಥಾಪಿಸಿ");
        backupAndRestore.put("Hindi", "बैकअप & पुनर्स्थापित करना");
        backupAndRestore.put("Arabic", "دعم & يعيد");
        backupAndRestore.put("Filipino", "Backup & Ibalik");
        LANGUAGE_TEXT_MAP.put("BackupAndRestore", backupAndRestore);

        Map<String, String> backupDataDescription = new HashMap<>();
        backupDataDescription.put("English", "Protect your data with ease using our Backup & Restore feature. Safely store your VCs against loss or accidents by creating regular backups and recover it effortlessly whenever needed for seamless continuity.");
        backupDataDescription.put("Tamil", "எங்கள் காப்புப் பிரதி & மீட்டமை அம்சத்தைப் பயன்படுத்தி உங்கள் தரவை எளிதாகப் பாதுகாக்கவும். வழக்கமான காப்புப்பிரதிகளை உருவாக்குவதன் மூலம் இழப்பு அல்லது விபத்துகளுக்கு எதிராக உங்கள் VC களை பாதுகாப்பாக சேமித்து, தடையற்ற தொடர்ச்சிக்கு தேவைப்படும் போதெல்லாம் அதை சிரமமின்றி மீட்டெடுக்கவும்.");
        backupDataDescription.put("Kannada", "ನಮ್ಮ ಬ್ಯಾಕಪ್ ಮತ್ತು ಮರುಸ್ಥಾಪನೆ ವೈಶಿಷ್ಟ್ಯವನ್ನು ಬಳಸಿಕೊಂಡು ನಿಮ್ಮ ಡೇಟಾವನ್ನು ಸುಲಭವಾಗಿ ರಕ್ಷಿಸಿ. ನಿಯಮಿತ ಬ್ಯಾಕಪ್\u200Cಗಳನ್ನು ರಚಿಸುವ ಮೂಲಕ ನಷ್ಟ ಅಥವಾ ಅಪಘಾತಗಳ ವಿರುದ್ಧ ನಿಮ್ಮ VC ಗಳನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಸಂಗ್ರಹಿಸಿ ಮತ್ತು ತಡೆರಹಿತ ನಿರಂತರತೆಗಾಗಿ ಅಗತ್ಯವಿರುವಾಗ ಅದನ್ನು ಸಲೀಸಾಗಿ ಮರುಪಡೆಯಿರಿ.");
        backupDataDescription.put("Hindi", "हमारे बैकअप और रीस्टोर सुविधा का उपयोग करके आसानी से अपने डेटा की सुरक्षा करें। नियमित बैकअप बनाकर अपने VC को नुकसान या दुर्घटनाओं से सुरक्षित रखें और जब भी ज़रूरत हो, निर्बाध निरंतरता के लिए इसे आसानी से रिकवर करें।");
        backupDataDescription.put("Arabic", "احمِ بياناتك بسهولة باستخدام ميزة النسخ الاحتياطي والاستعادة. خزّن بياناتك الافتراضية بأمان من الضياع أو الحوادث عن طريق إنشاء نسخ احتياطية منتظمة واستعادتها بسهولة عند الحاجة لضمان استمرارية العمل بسلاسة.");
        backupDataDescription.put("Filipino", "Protektahan ang iyong data nang madali gamit ang aming tampok na Backup & Restore. Ligtas na iimbak ang iyong mga VC laban sa pagkawala o mga aksidente sa pamamagitan ng paggawa ng mga regular na backup at i-recover ito nang walang kahirap-hirap sa tuwing kinakailangan para sa tuluy-tuloy na pagpapatuloy.");
        LANGUAGE_TEXT_MAP.put("BackupDataDescription", backupDataDescription);
    }

    public boolean verifyLanguageText(String key, String language, String actualText) {
        Map<String, String> languageMap = LANGUAGE_TEXT_MAP.get(key);
        if (languageMap == null) return false;

        String expectedText = languageMap.get(language);
        if (expectedText == null) return false;

        return actualText.equalsIgnoreCase(expectedText);
    }

    public boolean verifyBackupDataAndRestoreTitle(String language) {
        return verifyLanguageText("BackupAndRestore", language, getText(backupDataText));
    }

    public boolean verifyBackupDataDescription(String language) {
        return verifyLanguageText("BackupDataDescription", language, getText(backupDataDescription));
    }

    public BackupDataTourPage clickOnGoBack() {
        click(goBackButton, "Click on 'Go Back' button on Backup Data Tour page");
        return this;
    }

    public Boolean isAccountSectionHeaderDisplayed() {
        return isElementVisible(AccountSectionHeader, "Check if the 'Account' section header is displayed");
    }

    public Boolean isLastBackupSectionHeaderDisplayed() {
        return isElementVisible(LastBackupSectionHeader, "Check if the 'Last Backup' section header is displayed");
    }

    public Boolean isBackupAndRestoreDisplayed() {
        return isElementVisible(BackupAndRestore, "Check if the 'Backup and Restore' heading is displayed");
    }

}