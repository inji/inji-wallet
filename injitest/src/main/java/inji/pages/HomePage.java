package inji.pages;

import io.appium.java_client.AppiumDriver;
import io.appium.java_client.pagefactory.AndroidFindBy;
import io.appium.java_client.pagefactory.iOSXCUITFindBy;
import org.openqa.selenium.WebElement;

import java.util.HashMap;
import java.util.Map;

public class HomePage extends BasePage {
    @AndroidFindBy(accessibility = "plusIcon")
    @iOSXCUITFindBy(accessibility = "downloadCardButton")
    private WebElement downloadCardButton;

    @AndroidFindBy(accessibility = "home")
    @iOSXCUITFindBy(accessibility = "home")
    private WebElement homeButton;

    @AndroidFindBy(accessibility = "settings")
    @iOSXCUITFindBy(accessibility = "settings")
    private WebElement settingButton;

    @AndroidFindBy(accessibility = "helpText")
    @iOSXCUITFindBy(accessibility = "helpText")
    private WebElement helpButton;

    @AndroidFindBy(accessibility = "history")
    @iOSXCUITFindBy(accessibility = "history")
    private WebElement historyButton;

    @iOSXCUITFindBy(accessibility = "ellipsis")
    @AndroidFindBy(accessibility = "ellipsis")
    private WebElement moreOptionsButton;

    @iOSXCUITFindBy(accessibility = "close")
    @AndroidFindBy(accessibility = "close")
    private WebElement closeButton;

    @iOSXCUITFindBy(xpath = "(//XCUIElementTypeOther[@name=\"ellipsis\"])[2]")
    @AndroidFindBy(xpath = "(//android.view.ViewGroup[@content-desc=\"ellipsis\"])[2]")
    private WebElement moreOptionsButtonForSecondVc;

    @iOSXCUITFindBy(xpath = "(//XCUIElementTypeOther[@name=\"ellipsis\"])[1]")
    @AndroidFindBy(xpath = "(//android.view.ViewGroup[@content-desc=\"ellipsis\"])[1]")
    private WebElement moreOptionsButtonForFirstVc;

    @AndroidFindBy(xpath = "//*[contains(@text,'Secure Key Storage not found')]")
    private WebElement secureKeyStoragePopup;

    @AndroidFindBy(xpath = "//*[contains(@text,'Some security features will be unavailable')]")
    private WebElement securityFeatureUnavailablePopup;

    @AndroidFindBy(xpath = "//*[contains(@text,'OK, I')]")
    private WebElement riskItButton;

    @AndroidFindBy(xpath = "//*[contains(@text,'Ok')]")
    private WebElement okButton;

    @AndroidFindBy(accessibility = "pinIcon")
    @iOSXCUITFindBy(accessibility = "pinIcon")
    private WebElement pinIcon;

    @AndroidFindBy(accessibility = "bringYourDigitalID")
    @iOSXCUITFindBy(accessibility = "bringYourDigitalID")
    private WebElement bringYourDigitalIdentity;

    @AndroidFindBy(accessibility = "noInternetConnectionErrorTitle")
    @iOSXCUITFindBy(accessibility = "noInternetConnectionErrorTitle")
    private WebElement noInternetConnection;
    
    @AndroidFindBy(accessibility = "networkRequestFailedErrorTitle")
    @iOSXCUITFindBy(accessibility = "networkRequestFailedErrorTitle")
    private WebElement netWorkRequestFailed;

    
    
    @AndroidFindBy(accessibility = "share")
    @iOSXCUITFindBy(accessibility = "share")
    private WebElement shareButton;

    @AndroidFindBy(uiAutomator = "new UiSelector().className(\"android.widget.TextView\").instance(5)")
// fix with accecibility
    @iOSXCUITFindBy(accessibility = "share")
    private WebElement shareButtonByForText;

    @AndroidFindBy(accessibility = "idTypeValue")
    @iOSXCUITFindBy(accessibility = "idTypeValue")
    private WebElement idTypeValue;

    @AndroidFindBy(xpath = "//android.widget.TextView[@text=\"Try again\"]")
    @iOSXCUITFindBy(accessibility = "tryAgain")
    private WebElement tryAgainButton;

    @AndroidFindBy(uiAutomator = "new UiSelector().textContains(\"Subukan muli\")")
    private WebElement tryAgainButtonInFillpino;

    @AndroidFindBy(accessibility = "downloadingVcPopupText")
    @iOSXCUITFindBy(accessibility = "Downloading your card, this can take upto 5 minutes")
    private WebElement downloadingVcPopup;

    @AndroidFindBy(accessibility = "fullNameValue")
    @iOSXCUITFindBy(accessibility = "fullNameValue")
    private WebElement fullNameValue;

    @AndroidFindBy(accessibility = "verificationStatus")
    @iOSXCUITFindBy(accessibility = "verificationStatus")
    private WebElement credentialTypeValue;

    @AndroidFindBy(accessibility = "activationPending")
    @iOSXCUITFindBy(accessibility = "activationPending")
    private WebElement activationPending;

    @AndroidFindBy(accessibility = "offlineAuthDisabledHeader")
    @iOSXCUITFindBy(accessibility = "offlineAuthDisabledHeader")
    private WebElement offlineAuthDisabledHeader;

    @AndroidFindBy(xpath = "(//android.view.ViewGroup[@content-desc=\"ellipsis\"])[1]")
    private WebElement moreOptionsforFirstVc;

    @AndroidFindBy(xpath = "(//android.view.ViewGroup[@content-desc=\"ellipsis\"])[2]")
    private WebElement moreOptionsforSecondVc;

    @AndroidFindBy(accessibility = "close")
    @iOSXCUITFindBy(accessibility = "close")
    private WebElement popupCloseButton;

    @AndroidFindBy(accessibility = "activatedVcPopupText")
    @iOSXCUITFindBy(accessibility = "activatedVcPopupText")
    private WebElement activatedVcPopupText;

    @AndroidFindBy(accessibility = "fullNameTitle")
    @iOSXCUITFindBy(accessibility = "fullNameTitle")
    private WebElement fullNameTitle;

    @AndroidFindBy(xpath = "//android.widget.EditText[@resource-id=\"issuerSearchBar\"]")
    @iOSXCUITFindBy(accessibility = "issuerSearchBar")
    private WebElement issuerSearchBar;

    @AndroidFindBy(xpath = "//*[@text=\"2 card\"]")
    @iOSXCUITFindBy(xpath = "//*[@name=\"2 cards\"]")
    private WebElement visibleCard;

    @AndroidFindBy(xpath = "//*[@text=\"2 card\"]")
    @iOSXCUITFindBy(xpath = "//*[@name=\"1 card\"]")
    private WebElement visibleCardOne;


    @AndroidFindBy(xpath = "//*[@text=\"No Cards Found!\"]")
    @iOSXCUITFindBy(accessibility = "No Cards Found!")
    private WebElement noCardFound;

    @iOSXCUITFindBy(accessibility = "Return")
    private WebElement ReturnButton;

    @AndroidFindBy(accessibility = "wallet-unactivated-icon")
    @iOSXCUITFindBy(accessibility = "wallet-unactivated-icon")
    private WebElement walletUnactivatedIcon;

    @AndroidFindBy(accessibility = "verificationStatus")
    @iOSXCUITFindBy(accessibility = "verificationStatus")
    private WebElement verificationStatus;

    @AndroidFindBy(accessibility = "copilot-next-action")
    @iOSXCUITFindBy(accessibility = "copilot-next-action")
    private WebElement nextButton;

    @AndroidFindBy(accessibility = "copilot-prev-action")
    @iOSXCUITFindBy(accessibility = "copilot-prev-action")
    private WebElement previousButton;

    @AndroidFindBy(accessibility = "helpTitle")
    @iOSXCUITFindBy(accessibility = "helpTitle")
    private WebElement HelpFAQsHeader;

    @AndroidFindBy(accessibility = "helpDescription")
    @iOSXCUITFindBy(accessibility = "helpDescription")
    private WebElement HelpFAQsDescription;

    @AndroidFindBy(accessibility = "downloadTitle")
    @iOSXCUITFindBy(accessibility = "downloadTitle")
    private WebElement downloadCardHeader;

    @AndroidFindBy(accessibility = "downloadDescription")
    @iOSXCUITFindBy(accessibility = "downloadDescription")
    private WebElement downloadCardDescription;

    @AndroidFindBy(accessibility = "scanTitle")
    @iOSXCUITFindBy(accessibility = "scanTitle")
    private WebElement shareCardHeader;

    @AndroidFindBy(accessibility = "scanDescription")
    @iOSXCUITFindBy(accessibility = "scanDescription")
    private WebElement shareCardDescription;

    @AndroidFindBy(accessibility = "historyTitle")
    @iOSXCUITFindBy(accessibility = "historyTitle")
    private WebElement accesstoHistoryHeader;

    @AndroidFindBy(accessibility = "historyDescription")
    @iOSXCUITFindBy(accessibility = "historyDescription")
    private WebElement accesstoHistoryDescription;

    @AndroidFindBy(accessibility = "settingsTitle")
    @iOSXCUITFindBy(accessibility = "settingsTitle")
    private WebElement appSettingsHeader;

    @AndroidFindBy(accessibility = "settingsDescription")
    @iOSXCUITFindBy(accessibility = "settingsDescription")
    private WebElement appSettingsDescription;

    @AndroidFindBy(accessibility = "cardViewTitle")
    @iOSXCUITFindBy(accessibility = "cardViewTitle")
    private WebElement cardViewTitle;

    @AndroidFindBy(accessibility = "cardViewDescription")
    @iOSXCUITFindBy(accessibility = "cardViewDescription")
    private WebElement cardViewDescription;

    @AndroidFindBy(accessibility = "injiLogo")
    @iOSXCUITFindBy(accessibility = "injiLogo")
    private WebElement injiLogo;

    public HomePage(AppiumDriver driver) {
        super(driver);
    }

    public boolean isHomePageLoaded() {
        return isElementVisible(homeButton, "Checking if 'Home' button is visible");
    }

    public AddNewCardPage downloadCard() {
        click(downloadCardButton, "Clicking on 'Download Card' button");
        return new AddNewCardPage(driver);
    }

    public DetailedVcViewPage openDetailedVcView() {
        click(credentialTypeValue, "Clicking on credential to open Detailed VC View");
        return new DetailedVcViewPage(driver);
    }

    public SettingsPage clickOnSettingIcon() {
        click(settingButton, "Clicking on 'Settings' icon");
        return new SettingsPage(driver);
    }

    public HelpPage clickOnHelpIcon() {
        click(helpButton, "Clicking on 'Help' icon");
        return new HelpPage(driver);
    }

    public HistoryPage clickOnHistoryButton() {
        click(historyButton, "Clicking on 'History' button");
        return new HistoryPage(driver);
    }

    public MoreOptionsPage clickOnMoreOptionsButton() throws InterruptedException {
        click(moreOptionsButton, "Clicking on 'More Options' button");
        return new MoreOptionsPage(driver);
    }

    public boolean isPinIconDisplayed() {
        return isElementVisible(pinIcon, "Checking if 'PIN' icon is displayed");
    }

    public String verifyLanguageForNoVCDownloadedPageLoaded() {
        return getText(bringYourDigitalIdentity, "Getting text from 'Bring your digital identity' label");
    }

    public boolean verifyLanguageForNoInternetConnectionDisplayed(String language) {
        String actualText = getText(noInternetConnection, "Getting text from 'No internet connection' message");

        Map<String, String> expectedTexts = Map.of(
                "English", "No internet connection",
                "Tamil", "இணைய இணைப்பு இல்லை",
                "Filipino", "Pakisuri ang iyong koneksyon at subukang muli"
        );

        String expectedText = expectedTexts.get(language);
        return actualText.equalsIgnoreCase(expectedText);
    }
    
    public boolean verifyLanguageForNetWorkRequestFailedDisplayed(String language) {
        String actualText = getText(netWorkRequestFailed, "Getting text from 'Network Request Failed' message");

        Map<String, String> expectedTexts = Map.of(
                "English", "Network request failed",
                "Tamil", "நெட்வொர்க் கோரிக்கை தோல்வியடைந்தது",
                "Filipino", "Nabigo ang kahilingan sa network"
        );

        String expectedText = expectedTexts.get(language);
        return actualText.equalsIgnoreCase(expectedText);
    }

    public SharePage clickOnShareButton() {
        click(shareButton, "Clicking on 'Share' button");
        return new SharePage(driver);
    }

    public String getShareButton() {
        return getText(shareButtonByForText, "Getting text from 'Share' button");
    }

    public boolean isIdTypeDisplayed() {
        return isElementVisible(idTypeValue, "Checking if ID type is displayed");
    }

    public boolean verifyLanguageForTryAgainButtonDisplayed(String language) {
        String actualText = getText(tryAgainButton, "Getting text from 'Try Again' button");

        Map<String, String> expectedTexts = Map.of(
                "English", "Try again",
                "Tamil", "மீண்டும் முயற்சி செய்",
                "Filipino", "Subukan muli"
        );

        String expectedText = expectedTexts.get(language);
        return actualText.equalsIgnoreCase(expectedText);
    }

    public boolean isTryAgainButtonNotDisplayedInFillpino() {
        return isElementInvisible(tryAgainButtonInFillpino, "Verifying 'Try Again' button is not displayed in Filipino");
    }

    public boolean isTryAgainButtonDisplayedInFlillpino() {
        return isElementVisible(tryAgainButtonInFillpino, "Verifying 'Try Again' button is displayed in Filipino");
    }

    public boolean isTryAgainButtonNotDisplayed() {
        return isElementInvisible(tryAgainButton, "Verifying 'Try Again' button is not displayed");
    }

    public void clickOnTryAgainButton() {
        click(tryAgainButton, "Clicking on 'Try Again' button");
    }

    public void clickOnTryAgainFillpinoButton() {
        click(tryAgainButtonInFillpino, "Clicking on 'Try Again' button in Filipino");
    }

    public boolean isDownloadingVcPopupDisplayed() {
        return retryVisible(downloadingVcPopup, "Checking if 'Downloading VC' popup is displayed");
    }

    public String getFullNameTitleText() {
        return getText(fullNameTitle, "Getting text from 'Full Name' title");
    }

    public String getFullNameValue() {
        return getText(fullNameValue, "Getting text from 'Full Name' value");
    }

    public String GetIdTypeText() {
        return getText(idTypeValue, "Getting text from 'ID Type'");
    }

    public String GetActivationPendingText() {
        return getText(activationPending, "Getting text from 'Activation Pending' message");
    }

    public String GetActivationPendingHeaderText() {
        return getText(offlineAuthDisabledHeader, "Getting text from 'Offline Auth Disabled' header");
    }

    public void clickOnFirstVcsEllipsisButton() {
        click(moreOptionsforFirstVc, "Clicking on ellipsis button for first VC");
    }

    public void clickOnSecondVcsEllipsisButton() {
        click(moreOptionsforSecondVc, "Clicking on ellipsis button for second VC");
    }

    public boolean isActivatedVcPopupTextDisplayed() {
        return retryVisible(activatedVcPopupText, "Checking if 'Activated VC' popup text is displayed");
    }

    public void clickPopupCloseButtonButton() {
        click(popupCloseButton, "Clicking on close button of the popup");
    }

    public void clickOnHomeButton() {
        click(homeButton, "Clicking on 'Home' button");
    }

    public void sendTextInIssuerSearchBar(String text) {
        clearAndSendKeys(issuerSearchBar, text, "Entering text in issuer search bar");
    }

    public boolean isIssuerSearchBarDisplayed() {
        return isElementVisible(issuerSearchBar, "Checking if 'Issuer Search Bar' is displayed");
    }

    public boolean isCardCountDisplayed() {
        return isElementVisible(visibleCard, "Checking if card count is displayed");
    }

    public boolean isCardCountAfterSearchDisplayed() {
        return isElementVisible(visibleCardOne, "Checking if card count after search is displayed");
    }

    public boolean isNoCardFoundTextDisplayed() {
        return isElementVisible(noCardFound, "Checking if 'No Card Found' text is displayed");
    }

    public boolean isWalletUnactivatedIconDisplayed() {
        return isElementVisible(walletUnactivatedIcon, "Checking if 'Wallet Unactivated' icon is displayed");
    }

    public void clickOnSecondVcEllipsis() {
        click(moreOptionsButtonForSecondVc, "Clicking on ellipsis of second VC");
    }

    public void clickOnFirstVcEllipsis() {
        click(moreOptionsButtonForFirstVc, "Clicking on ellipsis of first VC");
    }

    public void clickOnReturnButton() {
        click(ReturnButton, "Clicking on 'Return' button");
    }

    public String getTextFromVerificationStatus() {
        return getText(verificationStatus, "Getting text from 'Verification Status'");
    }

    private static final Map<String, Map<String, String>> LANGUAGE_TEXT_MAP = new HashMap<>();

    static {
        Map<String, String> helpHeaderTexts = new HashMap<>();
        helpHeaderTexts.put("English", "Help/FAQs");
        helpHeaderTexts.put("Tamil", "உதவி/FAQகள்");
        helpHeaderTexts.put("Kannada", "ಸಹಾಯ/FAQಗಳು");
        helpHeaderTexts.put("Hindi", "सहायता/अक्सर पूछे जाने वाले प्रश्न");
        helpHeaderTexts.put("Arabic", "المساعدة/الأسئلة الشائعة");
        helpHeaderTexts.put("Filipino", "Tulong/Mga FAQ");
        LANGUAGE_TEXT_MAP.put("HelpFAQsHeader", helpHeaderTexts);

        Map<String, String> helpDescTexts = new HashMap<>();
        helpDescTexts.put("English", "Find answers to common questions and access helpful resources in our FAQ section, ensuring you have the support whenever you need it.");
        helpDescTexts.put("Tamil", "பொதுவான கேள்விகளுக்கான பதில்களைக் கண்டறிந்து, எங்களின் அடிக்கடி கேட்கப்படும் கேள்விகள் பிரிவில் உதவிகரமான ஆதாரங்களை அணுகவும், உங்களுக்குத் தேவைப்படும்போது உங்களுக்கு ஆதரவு இருப்பதை உறுதிசெய்யவும்.");
        helpDescTexts.put("Kannada", "ಸಾಮಾನ್ಯ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಗಳನ್ನು ಹುಡುಕಿ ಮತ್ತು ನಮ್ಮ FAQ ವಿಭಾಗದಲ್ಲಿ ಸಹಾಯಕವಾದ ಸಂಪನ್ಮೂಲಗಳನ್ನು ಪ್ರವೇಶಿಸಿ, ನಿಮಗೆ ಅಗತ್ಯವಿರುವಾಗ ನಿಮಗೆ ಬೆಂಬಲವಿದೆ ಎಂದು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.");
        helpDescTexts.put("Hindi", "सामान्य प्रश्नों के उत्तर ढूंढें और हमारे FAQ अनुभाग में सहायक संसाधनों तक पहुंचें, यह सुनिश्चित करते हुए कि जब भी आपको आवश्यकता हो, आपको सहायता मिले।");
        helpDescTexts.put("Arabic", "يمكنك العثور على إجابات للأسئلة الشائعة والوصول إلى الموارد المفيدة في قسم الأسئلة الشائعة، مما يضمن حصولك على الدعم متى احتجت إليه.");
        helpDescTexts.put("Filipino", "Maghanap ng mga sagot sa mga karaniwang tanong at i-access ang mga kapaki-pakinabang na mapagkukunan sa aming seksyong FAQ, na tinitiyak na mayroon kang suporta sa tuwing kailangan mo ito.");
        LANGUAGE_TEXT_MAP.put("HelpFAQsDescription", helpDescTexts);

        Map<String, String> downloadCardHeaderTexts = new HashMap<>();
        downloadCardHeaderTexts.put("English", "Download Card");
        downloadCardHeaderTexts.put("Tamil", "கார்டைப் பதிவிறக்கவும்");
        downloadCardHeaderTexts.put("Kannada", "ಕಾರ್ಡ್ ಡೌನ್\u200Cಲೋಡ್ ಮಾಡಿ");
        downloadCardHeaderTexts.put("Hindi", "कार्ड डाउनलोड करें");
        downloadCardHeaderTexts.put("Arabic", "تحميل البطاقة");
        downloadCardHeaderTexts.put("Filipino", "I-download ang Card");
        LANGUAGE_TEXT_MAP.put("DownloadCardHeader", downloadCardHeaderTexts);

        Map<String, String> downloadCardDescTexts = new HashMap<>();
        downloadCardDescTexts.put("English", "Easily download and securely store your card in the app for convenient access whenever you need them.");
        downloadCardDescTexts.put("Tamil", "உங்களுக்குத் தேவைப்படும் போதெல்லாம் வசதியான அணுகலுக்காக உங்கள் கார்டை எளிதாகப் பதிவிறக்கி, பாதுகாப்பாகச் சேமிக்கவும்.");
        downloadCardDescTexts.put("Kannada", "ನಿಮಗೆ ಅಗತ್ಯವಿರುವಾಗ ಅನುಕೂಲಕರ ಪ್ರವೇಶಕ್ಕಾಗಿ ಅಪ್ಲಿಕೇಶನ್\u200Cನಲ್ಲಿ ನಿಮ್ಮ ಕಾರ್ಡ್ ಅನ್ನು ಸುಲಭವಾಗಿ ಡೌನ್\u200Cಲೋಡ್ ಮಾಡಿ ಮತ್ತು ಸುರಕ್ಷಿತವಾಗಿ ಸಂಗ್ರಹಿಸಿ.");
        downloadCardDescTexts.put("Hindi", "जब भी आपको आवश्यकता हो, सुविधाजनक पहुंच के लिए अपने कार्ड को आसानी से डाउनलोड करें और ऐप में सुरक्षित रूप से संग्रहीत करें।");
        downloadCardDescTexts.put("Arabic", "يمكنك بسهولة تنزيل بطاقتك وتخزينها بشكل آمن في التطبيق للوصول إليها بسهولة عندما تحتاج إليها.");
        downloadCardDescTexts.put("Filipino", "Madaling i-download at secure na iimbak ang iyong card sa app para sa maginhawang pag-access sa tuwing kailangan mo ang mga ito.");
        LANGUAGE_TEXT_MAP.put("DownloadCardDescription", downloadCardDescTexts);

        Map<String, String> shareCardHeaderTexts = new HashMap<>();
        shareCardHeaderTexts.put("English", "Share Card");
        shareCardHeaderTexts.put("Tamil", "பகிர்வு அட்டை");
        shareCardHeaderTexts.put("Kannada", "ಹಂಚಿಕೆ ಕಾರ್ಡ್");
        shareCardHeaderTexts.put("Hindi", "कार्ड साझा करें");
        shareCardHeaderTexts.put("Arabic", "مشاركة البطاقة");
        shareCardHeaderTexts.put("Filipino", "Share Card");
        LANGUAGE_TEXT_MAP.put("ShareCardHeader", shareCardHeaderTexts);

        Map<String, String> shareCardDescTexts = new HashMap<>();
        shareCardDescTexts.put("English", "Share your card with ease in offline mode using bluetooth, empowering you to provide verified information whenever required.");
        shareCardDescTexts.put("Tamil", "புளூடூத்தைப் பயன்படுத்தி ஆஃப்லைன் பயன்முறையில் உங்கள் கார்டை எளிதாகப் பகிரவும், தேவைப்படும் போதெல்லாம் சரிபார்க்கப்பட்ட தகவலை வழங்க உங்களுக்கு அதிகாரம் அளிக்கிறது.");
        shareCardDescTexts.put("Kannada", "ಬ್ಲೂಟೂತ್ ಬಳಸಿಕೊಂಡು ಆಫ್\u200Cಲೈನ್ ಮೋಡ್\u200Cನಲ್ಲಿ ನಿಮ್ಮ ಕಾರ್ಡ್ ಅನ್ನು ಸುಲಭವಾಗಿ ಹಂಚಿಕೊಳ್ಳಿ, ಅಗತ್ಯವಿರುವಾಗ ಪರಿಶೀಲಿಸಿದ ಮಾಹಿತಿಯನ್ನು ಒದಗಿಸಲು ನಿಮಗೆ ಅಧಿಕಾರ ನೀಡುತ್ತದೆ.");
        shareCardDescTexts.put("Hindi", "ब्लूटूथ का उपयोग करके अपने कार्ड को ऑफ़लाइन मोड में आसानी से साझा करें, जिससे आप आवश्यकता पड़ने पर सत्यापित जानकारी प्रदान करने में सक्षम होंगे।");
        shareCardDescTexts.put("Arabic", "شارك بطاقتك بسهولة في وضع عدم الاتصال باستخدام البلوتوث، مما يمكّنك من تقديم معلومات تم التحقق منها كلما لزم الأمر.");
        shareCardDescTexts.put("Filipino", "Ibahagi ang iyong card nang madali sa offline mode gamit ang bluetooth, na nagbibigay ng kapangyarihan sa iyong magbigay ng na-verify na impormasyon kapag kinakailangan.");
        LANGUAGE_TEXT_MAP.put("ShareCardDescription", shareCardDescTexts);

        Map<String, String> accessToHistoryHeaderTexts = new HashMap<>();
        accessToHistoryHeaderTexts.put("English", "Access to History");
        accessToHistoryHeaderTexts.put("Tamil", "வரலாற்றிற்கான அணுகல்");
        accessToHistoryHeaderTexts.put("Kannada", "ಇತಿಹಾಸಕ್ಕೆ ಪ್ರವೇಶ");
        accessToHistoryHeaderTexts.put("Hindi", "इतिहास तक पहुंच");
        accessToHistoryHeaderTexts.put("Arabic", "الوصول إلى التاريخ");
        accessToHistoryHeaderTexts.put("Filipino", "Access sa Kasaysayan");
        LANGUAGE_TEXT_MAP.put("AccessToHistoryHeader", accessToHistoryHeaderTexts);

        Map<String, String> accessToHistoryDescTexts = new HashMap<>();
        accessToHistoryDescTexts.put("English", "View your activity history to track your interactions and stay informed about your past actions within the app.");
        accessToHistoryDescTexts.put("Tamil", "உங்களின் செயல்பாடுகளைக் கண்காணிக்க உங்கள் செயல்பாட்டு வரலாற்றைப் பார்க்கவும், மேலும் பயன்பாட்டில் உங்கள் கடந்தகாலச் செயல்களைப் பற்றித் தெரிந்துகொள்ளவும்.");
        accessToHistoryDescTexts.put("Kannada", "ನಿಮ್ಮ ಸಂವಹನಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಲು ನಿಮ್ಮ ಚಟುವಟಿಕೆಯ ಇತಿಹಾಸವನ್ನು ವೀಕ್ಷಿಸಿ ಮತ್ತು ಅಪ್ಲಿಕೇಶನ್\u200Cನಲ್ಲಿ ನಿಮ್ಮ ಹಿಂದಿನ ಕ್ರಿಯೆಗಳ ಬಗ್ಗೆ ಮಾಹಿತಿ ನೀಡಿ.");
        accessToHistoryDescTexts.put("Hindi", "अपने इंटरैक्शन को ट्रैक करने और ऐप के भीतर अपने पिछले कार्यों के बारे में सूचित रहने के लिए अपना गतिविधि इतिहास देखें।");
        accessToHistoryDescTexts.put("Arabic", "اعرض سجل نشاطك لتتبع تفاعلاتك والبقاء على علم بإجراءاتك السابقة داخل التطبيق.");
        accessToHistoryDescTexts.put("Filipino", "Tingnan ang iyong history ng aktibidad upang subaybayan ang iyong mga pakikipag-ugnayan at manatiling may alam tungkol sa iyong mga nakaraang pagkilos sa loob ng app.");
        LANGUAGE_TEXT_MAP.put("AccessToHistoryDescription", accessToHistoryDescTexts);

        Map<String, String> appSettingHeader = new HashMap<>();
        appSettingHeader.put("English", "App Settings");
        appSettingHeader.put("Tamil", "பயன்பாட்டு அமைப்புகள்");
        appSettingHeader.put("Kannada", "ಅಪ್ಲಿಕೇಶನ್ ಸೆಟ್ಟಿಂಗ್\u200Cಗಳು");
        appSettingHeader.put("Hindi", "एप्लिकेशन सेटिंग");
        appSettingHeader.put("Arabic", "إعدادات التطبيقات");
        appSettingHeader.put("Filipino", "Mga Setting ng App");
        LANGUAGE_TEXT_MAP.put("AppSettingHeader", appSettingHeader);

        Map<String, String> appSettingDescription = new HashMap<>();
        appSettingDescription.put("English", "Customize your app experience with personalized settings as per your preferences.");
        appSettingDescription.put("Tamil", "உங்கள் விருப்பங்களின்படி தனிப்பயனாக்கப்பட்ட அமைப்புகளுடன் உங்கள் பயன்பாட்டு அனுபவத்தைத் தனிப்பயனாக்கவும்.");
        appSettingDescription.put("Kannada", "ನಿಮ್ಮ ಆದ್ಯತೆಗಳ ಪ್ರಕಾರ ವೈಯಕ್ತೀಕರಿಸಿದ ಸೆಟ್ಟಿಂಗ್\u200Cಗಳೊಂದಿಗೆ ನಿಮ್ಮ ಅಪ್ಲಿಕೇಶನ್ ಅನುಭವವನ್ನು ಕಸ್ಟಮೈಸ್ ಮಾಡಿ.");
        appSettingDescription.put("Hindi", "अपनी प्राथमिकताओं के अनुसार वैयक्तिकृत सेटिंग्स के साथ अपने ऐप अनुभव को अनुकूलित करें।");
        appSettingDescription.put("Arabic", "قم بتخصيص تجربة التطبيق الخاص بك من خلال الإعدادات المخصصة وفقًا لتفضيلاتك.");
        appSettingDescription.put("Filipino", "I-customize ang iyong karanasan sa app gamit ang mga naka-personalize na setting ayon sa iyong mga kagustuhan.");
        LANGUAGE_TEXT_MAP.put("AppSettingDescription", appSettingDescription);

        Map<String, String> cardViewTitle = new HashMap<>();
        cardViewTitle.put("English", "Card");
        cardViewTitle.put("Tamil", "அட்டை");
        cardViewTitle.put("Kannada", "ಕಾರ್ಡ್");
        cardViewTitle.put("Hindi", "कार्ड");
        cardViewTitle.put("Arabic", "بطاقة");
        cardViewTitle.put("Filipino", "Card");
        LANGUAGE_TEXT_MAP.put("CardViewTitle", cardViewTitle);

        Map<String, String> cardViewDescription = new HashMap<>();
        cardViewDescription.put("English", "Your card displays your verified identity information. Tap for a detailed view or click on … for additional options.");
        cardViewDescription.put("Tamil", "உங்கள் அடையாளத் தகவலை உங்கள் அட்டை காண்பிக்கிறது. விரிவான பார்வைக்காக தட்டவும் அல்லது கூடுதல் விருப்பங்களுக்காக … ஐ கிளிக் செய்யவும்.");
        cardViewDescription.put("Kannada", "ನಿಮ್ಮ ಕಾರ್ಡ್ ಪರಿಶೀಲಿಸಿದ ಗುರುತಿನ ಮಾಹಿತಿಯನ್ನು ಪ್ರದರ್ಶಿಸುತ್ತದೆ. ವಿವರವಾದ ವೀಕ್ಷಣೆಗೆ ಟ್ಯಾಪ್ ಮಾಡಿ ಅಥವಾ ಹೆಚ್ಚಿನ ಆಯ್ಕೆಗಳಿಗೆ … ಕ್ಲಿಕ್ ಮಾಡಿ.");
        cardViewDescription.put("Hindi", "आपका कार्ड आपकी सत्यापित पहचान की जानकारी प्रदर्शित करता है। विस्तृत दृश्य के लिए टैप करें या अतिरिक्त विकल्पों के लिए … क्लिक करें।");
        cardViewDescription.put("Arabic", "تعرض بطاقتك معلومات هويتك المُحققة. انقر لعرض مفصل أو على … لمزيد من الخيارات.");
        cardViewDescription.put("Filipino", "Ipinapakita ng iyong card ang iyong na-verify na impormasyon ng pagkakakilanlan. I-tap para sa detalyadong view o i-click ang … para sa karagdagang mga opsyon.");
        LANGUAGE_TEXT_MAP.put("CardViewDescription", cardViewDescription);

    }

    public boolean verifyLanguageText(String key, String language, String actualText) {
        Map<String, String> languageMap = LANGUAGE_TEXT_MAP.get(key);
        if (languageMap == null) return false;

        String expectedText = languageMap.get(language);
        if (expectedText == null) return false;

        return actualText.equalsIgnoreCase(expectedText);
    }

    public boolean verifyHelpFAQsHeader(String language) {
        return verifyLanguageText("HelpFAQsHeader", language, getText(HelpFAQsHeader));
    }

    public boolean verifyHelpFAQsDescription(String language) {
        return verifyLanguageText("HelpFAQsDescription", language, getText(HelpFAQsDescription));
    }

    public boolean verifyDownloadCardHeader(String language) {
        return verifyLanguageText("DownloadCardHeader", language, getText(downloadCardHeader));
    }

    public boolean verifyDownloadCardDescription(String language) {
        return verifyLanguageText("DownloadCardDescription", language, getText(downloadCardDescription));
    }

    public boolean verifyShareCardHeader(String language) {
        return verifyLanguageText("ShareCardHeader", language, getText(shareCardHeader));
    }

    public boolean verifyShareCardDescription(String language) {
        return verifyLanguageText("ShareCardDescription", language, getText(shareCardDescription));
    }

    public boolean verifyAccessToHistoryHeader(String language) {
        return verifyLanguageText("AccessToHistoryHeader", language, getText(accesstoHistoryHeader));
    }

    public boolean verifyAccessToHistoryDescription(String language) {
        return verifyLanguageText("AccessToHistoryDescription", language, getText(accesstoHistoryDescription));
    }

    public boolean verifyAppSettingsHeader(String language) {
        return verifyLanguageText("AppSettingHeader", language, getText(appSettingsHeader));
    }

    public boolean verifyAppSettingDescription(String language) {
        return verifyLanguageText("AppSettingDescription", language, getText(appSettingsDescription));
    }

    public boolean verifyCardViewTitle(String language) {
        return verifyLanguageText("CardViewTitle", language, getText(cardViewTitle));
    }

    public boolean verifyCardViewDescription(String language) {
        return verifyLanguageText("CardViewDescription", language, getText(cardViewDescription));
    }

    public void clickOnNextButton() {
        click(nextButton, "Clicking on the Next button");
    }

    public void clickOnPreviousButton() {
        click(previousButton, "Clicking on the Previous button");
    }

    public void clickOnDoneButton() {
        click(nextButton, "Clicking on the Done button (same as nextButton)");
    }

    public void clickOnNextButtonForInjiTour() {
        for (int i = 0; i < 5; i++) {
            click(nextButton, "Clicking through Inji Tour Next button step " + (i + 1));
        }
    }

    public boolean isCredentialTypeValueDisplayed() {
        return isElementVisible(credentialTypeValue, "Checking if Credential Type Value is displayed");
    }

    public boolean isInjiLogoDisplayed() {
        return isElementVisible(injiLogo, "Checking if Inji logo is displayed");
    }

    public void clickOnCrossIconButton() {
        click(closeButton, "Clicking on the Close (cross) button");
    }
    
    /*
     * Scrolls to the download button and clicks it to download the card.
     * Use this method when the download button may be off-screen and requires scrolling to become visible.
     */
    public  AddNewCardPage scrollanddownloadCard() {
        scrollAndClickByAccessibilityId("downloadCardButton", 4, "scroll to downlaodbutton");
        return new AddNewCardPage(driver);
    }
}
