package inji.pages;

import io.appium.java_client.AppiumDriver;
import io.appium.java_client.pagefactory.AndroidFindBy;
import io.appium.java_client.pagefactory.iOSXCUITFindBy;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

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

    @AndroidFindBy(accessibility = "1next")
    @iOSXCUITFindBy(accessibility = "1next")
    private WebElement firstNextButton;

    @AndroidFindBy(accessibility = "2next")
    @iOSXCUITFindBy(accessibility = "2next")
    private WebElement secondNextButton;

    @AndroidFindBy(accessibility = "3next")
    @iOSXCUITFindBy(accessibility = "3next")
    private WebElement thirdNextButton;

    @AndroidFindBy(accessibility = "4next")
    @iOSXCUITFindBy(accessibility = "4next")
    private WebElement forthNextButton;

    @AndroidFindBy(accessibility = "5done")
    @iOSXCUITFindBy(accessibility = "5done")
    private WebElement fifthDoneButton;

    @AndroidFindBy(accessibility = "5next")
    @iOSXCUITFindBy(accessibility = "5next")
    private WebElement fifthNextButton;

    @AndroidFindBy(accessibility = "2previous")
    @iOSXCUITFindBy(accessibility = "2previous")
    private WebElement  secondPreviousButton;

    @AndroidFindBy(accessibility = "3previous")
    @iOSXCUITFindBy(accessibility = "3previous")
    private WebElement  thirdPreviousButton;

    @AndroidFindBy(accessibility = "4previous")
    @iOSXCUITFindBy(accessibility = "4previous")
    private WebElement forthPreviousButton;

    @AndroidFindBy(accessibility = "5previous")
    @iOSXCUITFindBy(accessibility = "5previous")
    private WebElement fifthPreviousButton;

    @AndroidFindBy(accessibility = "6done")
    @iOSXCUITFindBy(accessibility = "6done")
    private WebElement doneButton;

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

    BasePage basePage = new BasePage(driver);
    public boolean isHomePageLoaded() {
        return this.isElementDisplayed(homeButton);
    }

    public AddNewCardPage downloadCard() {
        this.clickOnElement(downloadCardButton);
        return new AddNewCardPage(driver);
    }

    public DetailedVcViewPage openDetailedVcView() {
        clickOnElement(credentialTypeValue);
        return new DetailedVcViewPage(driver);
    }

    public SettingsPage clickOnSettingIcon() {
        clickOnElement(settingButton);
        return new SettingsPage(driver);
    }

    public HelpPage clickOnHelpIcon() {
        clickOnElement(helpButton);
        return new HelpPage(driver);
    }

    public HistoryPage clickOnHistoryButton() {
        clickOnElement(historyButton);
        return new HistoryPage(driver);
    }

    public MoreOptionsPage clickOnMoreOptionsButton() throws InterruptedException {
        clickOnElement(moreOptionsButton);
        return new MoreOptionsPage(driver);
    }

    public boolean isPinIconDisplayed() {
        return this.isElementDisplayed(pinIcon);
    }

    public String  verifyLanguageForNoVCDownloadedPageLoaded(){
        return getTextFromLocator(bringYourDigitalIdentity);
    }

    public boolean  verifyLanguageForNoInternetConnectionDisplayed(String language){
        String actualText = getTextFromLocator(noInternetConnection);

        switch (language) {
            case "English":
                boolean isEnglishMatch  = (actualText.equalsIgnoreCase("No internet connection")==true) ? true : false;
                return isEnglishMatch ;
            case "Tamil":
                boolean isTamilMatch  = (actualText.equalsIgnoreCase("இணைய இணைப்பு இல்லை")==true) ? true : false;
                return isTamilMatch ;
            case "Filipino":
                boolean isFilipinoMatch  = (actualText.equalsIgnoreCase("Pakisuri ang iyong koneksyon at subukang muli")==true) ? true : false;
                return isFilipinoMatch ;

        }
        return false;
    }

    public SharePage clickOnShareButton() {
        clickOnElement(shareButton);
        return new SharePage(driver);
    }

    public String getShareButton() {
        return getTextFromLocator(shareButtonByForText);
    }

    public boolean isIdTypeDisplayed() {
        return this.isElementDisplayed(idTypeValue);
    }

    public boolean  verifyLanguageForTryAgainButtonDisplayed(String language){
        String actualText = getTextFromLocator(tryAgainButton);

        switch (language) {
            case "English":
                boolean isEnglishMatch  = (actualText.equalsIgnoreCase("Try again")==true) ? true : false;
                return isEnglishMatch ;
            case "Tamil":
                boolean isTamilMatch  = (actualText.equalsIgnoreCase("மீண்டும் முயற்சி செய்")==true) ? true : false;
                return isTamilMatch ;
            case "Filipino":
                boolean isFilipinoMatch  = (actualText.equalsIgnoreCase("Subukan muli")==true) ? true : false;
                return isFilipinoMatch ;

        }
        return false;
    }

    public boolean isTryAgainButtonNotDisplayedInFlillpino() {
        return this.isElementInvisibleYet(tryAgainButtonInFillpino);
    }

    public boolean isTryAgainButtonDisplayedInFlillpino() {
        return this.isElementDisplayed(tryAgainButtonInFillpino);
    }

    public boolean isTryAgainButtonNotDisplayed() {
        return this.isElementInvisibleYet(tryAgainButton);
    }

    public void clickOnTryAgainButton() {
        clickOnElement(tryAgainButton);
    }

    public void clickOnTryAgainFillpinoButton() {
        clickOnElement(tryAgainButtonInFillpino);
    }

    public boolean isDownloadingVcPopupDisplayed() {
        return this.retryElementVisible(downloadingVcPopup);
    }

    public String getfullNameTitleText() {
        return this.getTextFromLocator(fullNameTitle);
    }
    public String  getFullNameValue(){
        return getTextFromLocator(fullNameValue);
    }
    public String GetIdTypeText() {
        return this.getTextFromLocator(idTypeValue);
    }

    public String GetActivationPendingText() {
        return this.getTextFromLocator(activationPending);
    }

    public String GetActivationPendingHeaderText() {
        return this.getTextFromLocator(offlineAuthDisabledHeader);
    }

    public void clickOnFirstVcsEllipsisButton() {
        clickOnElement(moreOptionsforFirstVc);
    }

    public void clickOnSecondVcsEllipsisButton() {
        clickOnElement(moreOptionsforSecondVc);
    }

    public boolean isActivatedVcPopupTextDisplayed() {
        return this.retryElementVisible(activatedVcPopupText);
    }

    public void clickPopupCloseButtonButton() {
        clickOnElement(popupCloseButton);
    }

    public void clickOnHomeButton() {
        clickOnElement(homeButton);
    }

    public void sendTextInIssuerSearchBar(String text) {
        clearTextBoxAndSendKeys(issuerSearchBar, text);
    }

    public boolean isIssuerSearchBarDisplayed() {
        return this.isElementDisplayed(issuerSearchBar);
    }

    public boolean isCardCountDisplayed() {
        return this.isElementDisplayed(visibleCard);
    }

    public boolean isCardCountAfterSearchDisplayed() {
        return this.isElementDisplayed(visibleCardOne);
    }

    public boolean isNoCardFoundTextDisplayed() {
        return this.isElementDisplayed(noCardFound);
    }

    public boolean isWalletUnactivatedIconDisplayed() {
        return this.isElementDisplayed(walletUnactivatedIcon);
    }

    public void clickOnSecondVcEllipsis() {
        clickOnElement(moreOptionsButtonForSecondVc);
    }

    public void clickOnFirstVcEllipsis() {
        clickOnElement(moreOptionsButtonForFirstVc);
    }

    public void clickOnReturnButton(){
        clickOnElement(ReturnButton);
    }

    public  String   getTextFromVerificationStatus(){
        return getTextFromLocator(verificationStatus);
    }

    public boolean  verifyLanguageForHelpAndFrequentlyAskedQuationsHeaderDisplayed(String language){
        String actualText = getTextFromLocator(HelpFAQsHeader);

        switch (language) {
            case "English":
                boolean isEnglishMatch  = (actualText.equalsIgnoreCase("Help/FAQs")==true) ? true : false;
                return isEnglishMatch ;
            case "Tamil":
                boolean isTamilMatch  = (actualText.equalsIgnoreCase("உதவி/FAQகள்")==true) ? true : false;
                return isTamilMatch ;
            case "Kannada":
                boolean isKannadaMatch  = (actualText.equalsIgnoreCase("ಸಹಾಯ/FAQಗಳು")==true) ? true : false;
                return isKannadaMatch ;
            case "Hindi":
                boolean isHindiMatch  = (actualText.equalsIgnoreCase("सहायता/अक्सर पूछे जाने वाले प्रश्न")==true) ? true : false;
                return isHindiMatch ;
            case "Arabic":
                boolean isArabicMatch  = (actualText.equalsIgnoreCase("المساعدة/الأسئلة الشائعة")==true) ? true : false;
                return isArabicMatch ;
            case "Filipino":
                boolean isFilipinoMatch  = (actualText.equalsIgnoreCase("Tulong/Mga FAQ")==true) ? true : false;
                return isFilipinoMatch ;

        }
        return false;
    }

    public boolean  verifyLanguageForHelpAndFrequentlyAskedQuationsDescriptionDisplayed(String language){
        String actualText = getTextFromLocator(HelpFAQsDescription);

        switch (language) {
            case "English":
                boolean isEnglishMatch  = (actualText.equalsIgnoreCase("Find answers to common questions and access helpful resources in our FAQ section, ensuring you have the support whenever you need it.")==true) ? true : false;
                return isEnglishMatch ;
            case "Tamil":
                boolean isTamilMatch  = (actualText.equalsIgnoreCase("பொதுவான கேள்விகளுக்கான பதில்களைக் கண்டறிந்து, எங்களின் அடிக்கடி கேட்கப்படும் கேள்விகள் பிரிவில் உதவிகரமான ஆதாரங்களை அணுகவும், உங்களுக்குத் தேவைப்படும்போது உங்களுக்கு ஆதரவு இருப்பதை உறுதிசெய்யவும்.")==true) ? true : false;
                return isTamilMatch ;
            case "Kannada":
                boolean isKannadaMatch  = (actualText.equalsIgnoreCase("ಸಾಮಾನ್ಯ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಗಳನ್ನು ಹುಡುಕಿ ಮತ್ತು ನಮ್ಮ FAQ ವಿಭಾಗದಲ್ಲಿ ಸಹಾಯಕವಾದ ಸಂಪನ್ಮೂಲಗಳನ್ನು ಪ್ರವೇಶಿಸಿ, ನಿಮಗೆ ಅಗತ್ಯವಿರುವಾಗ ನಿಮಗೆ ಬೆಂಬಲವಿದೆ ಎಂದು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.")==true) ? true : false;
                return isKannadaMatch ;
            case "Hindi":
                boolean isHindiMatch  = (actualText.equalsIgnoreCase("सामान्य प्रश्नों के उत्तर ढूंढें और हमारे FAQ अनुभाग में सहायक संसाधनों तक पहुंचें, यह सुनिश्चित करते हुए कि जब भी आपको आवश्यकता हो, आपको सहायता मिले।")==true) ? true : false;
                return isHindiMatch ;
            case "Arabic":
                boolean isArabicMatch  = (actualText.equalsIgnoreCase("يمكنك العثور على إجابات للأسئلة الشائعة والوصول إلى الموارد المفيدة في قسم الأسئلة الشائعة، مما يضمن حصولك على الدعم متى احتجت إليه.")==true) ? true : false;
                return isArabicMatch ;
            case "Filipino":
                boolean isFilipinoMatch  = (actualText.equalsIgnoreCase("Maghanap ng mga sagot sa mga karaniwang tanong at i-access ang mga kapaki-pakinabang na mapagkukunan sa aming seksyong FAQ, na tinitiyak na mayroon kang suporta sa tuwing kailangan mo ito.")==true) ? true : false;
                return isFilipinoMatch ;

        }
        return false;
    }

    public boolean  verifyLanguageForDownloadCardHeaderDisplayed(String language){
        String actualText = getTextFromLocator(downloadCardHeader);

        switch (language) {
            case "English":
                boolean isEnglishMatch  = (actualText.equalsIgnoreCase("Download Card")==true) ? true : false;
                return isEnglishMatch ;
            case "Tamil":
                boolean isTamilMatch  = (actualText.equalsIgnoreCase("கார்டைப் பதிவிறக்கவும்")==true) ? true : false;
                return isTamilMatch ;
            case "Kannada":
                boolean isKannadaMatch  = (actualText.equalsIgnoreCase("ಕಾರ್ಡ್ ಡೌನ್\u200Cಲೋಡ್ ಮಾಡಿ")==true) ? true : false;
                return isKannadaMatch ;
            case "Hindi":
                boolean isHindiMatch  = (actualText.equalsIgnoreCase("कार्ड डाउनलोड करें")==true) ? true : false;
                return isHindiMatch ;
            case "Arabic":
                boolean isArabicMatch  = (actualText.equalsIgnoreCase("تحميل البطاقة")==true) ? true : false;
                return isArabicMatch ;
            case "Filipino":
                boolean isFilipinoMatch  = (actualText.equalsIgnoreCase("I-download ang Card")==true) ? true : false;
                return isFilipinoMatch ;
        }
        return false;
    }

    public boolean  verifyLanguageForDownloadCardDescriptionDisplayed(String language){
        String actualText = getTextFromLocator(downloadCardDescription);

        switch (language) {
            case "English":
                boolean isEnglishMatch  = (actualText.equalsIgnoreCase("Easily download and securely store your card in the app for convenient access whenever you need them.")==true) ? true : false;
                return isEnglishMatch ;
            case "Tamil":
                boolean isTamilMatch  = (actualText.equalsIgnoreCase("உங்களுக்குத் தேவைப்படும் போதெல்லாம் வசதியான அணுகலுக்காக உங்கள் கார்டை எளிதாகப் பதிவிறக்கி, பாதுகாப்பாகச் சேமிக்கவும்.")==true) ? true : false;
                return isTamilMatch ;
            case "Kannada":
                boolean isKannadaMatch  = (actualText.equalsIgnoreCase("ನಿಮಗೆ ಅಗತ್ಯವಿರುವಾಗ ಅನುಕೂಲಕರ ಪ್ರವೇಶಕ್ಕಾಗಿ ಅಪ್ಲಿಕೇಶನ್\u200Cನಲ್ಲಿ ನಿಮ್ಮ ಕಾರ್ಡ್ ಅನ್ನು ಸುಲಭವಾಗಿ ಡೌನ್\u200Cಲೋಡ್ ಮಾಡಿ ಮತ್ತು ಸುರಕ್ಷಿತವಾಗಿ ಸಂಗ್ರಹಿಸಿ.")==true) ? true : false;
                return isKannadaMatch ;
            case "Hindi":
                boolean isHindiMatch  = (actualText.equalsIgnoreCase("जब भी आपको आवश्यकता हो, सुविधाजनक पहुंच के लिए अपने कार्ड को आसानी से डाउनलोड करें और ऐप में सुरक्षित रूप से संग्रहीत करें।")==true) ? true : false;
                return isHindiMatch ;
            case "Arabic":
                boolean isArabicMatch  = (actualText.equalsIgnoreCase("يمكنك بسهولة تنزيل بطاقتك وتخزينها بشكل آمن في التطبيق للوصول إليها بسهولة عندما تحتاج إليها.")==true) ? true : false;
                return isArabicMatch ;
            case "Filipino":
                boolean isFilipinoMatch  = (actualText.equalsIgnoreCase("Madaling i-download at secure na iimbak ang iyong card sa app para sa maginhawang pag-access sa tuwing kailangan mo ang mga ito.")==true) ? true : false;
                return isFilipinoMatch ;
        }
        return false;
    }

    public boolean  verifyLanguageForShareCardHeaderDisplayed(String language){
        String actualText = getTextFromLocator(shareCardHeader);

        switch (language) {
            case "English":
                boolean isEnglishMatch  = (actualText.equalsIgnoreCase("Share Card")==true) ? true : false;
                return isEnglishMatch ;
            case "Tamil":
                boolean isTamilMatch  = (actualText.equalsIgnoreCase("பகிர்வு அட்டை")==true) ? true : false;
                return isTamilMatch ;
            case "Kannada":
                boolean isKannadaMatch  = (actualText.equalsIgnoreCase("ಹಂಚಿಕೆ ಕಾರ್ಡ್")==true) ? true : false;
                return isKannadaMatch ;
            case "Hindi":
                boolean isHindiMatch  = (actualText.equalsIgnoreCase("कार्ड साझा करें")==true) ? true : false;
                return isHindiMatch ;
            case "Arabic":
                boolean isArabicMatch  = (actualText.equalsIgnoreCase("مشاركة البطاقة")==true) ? true : false;
                return isArabicMatch ;
            case "Filipino":
                boolean isFilipinoMatch  = (actualText.equalsIgnoreCase("Share Card")==true) ? true : false;
                return isFilipinoMatch ;
        }
        return false;
    }

    public boolean  verifyLanguageForShareCardDescriptionDisplayed(String language){
        String actualText = getTextFromLocator(shareCardDescription);

        switch (language) {
            case "English":
                boolean isEnglishMatch  = (actualText.equalsIgnoreCase("Share your card with ease in offline mode using bluetooth, empowering you to provide verified information whenever required.")==true) ? true : false;
                return isEnglishMatch ;
            case "Tamil":
                boolean isTamilMatch  = (actualText.equalsIgnoreCase("புளூடூத்தைப் பயன்படுத்தி ஆஃப்லைன் பயன்முறையில் உங்கள் கார்டை எளிதாகப் பகிரவும், தேவைப்படும் போதெல்லாம் சரிபார்க்கப்பட்ட தகவலை வழங்க உங்களுக்கு அதிகாரம் அளிக்கிறது.")==true) ? true : false;
                return isTamilMatch ;
            case "Kannada":
                boolean isKannadaMatch  = (actualText.equalsIgnoreCase("ಬ್ಲೂಟೂತ್ ಬಳಸಿಕೊಂಡು ಆಫ್\u200Cಲೈನ್ ಮೋಡ್\u200Cನಲ್ಲಿ ನಿಮ್ಮ ಕಾರ್ಡ್ ಅನ್ನು ಸುಲಭವಾಗಿ ಹಂಚಿಕೊಳ್ಳಿ, ಅಗತ್ಯವಿರುವಾಗ ಪರಿಶೀಲಿಸಿದ ಮಾಹಿತಿಯನ್ನು ಒದಗಿಸಲು ನಿಮಗೆ ಅಧಿಕಾರ ನೀಡುತ್ತದೆ.")==true) ? true : false;
                return isKannadaMatch ;
            case "Hindi":
                boolean isHindiMatch  = (actualText.equalsIgnoreCase("ब्लूटूथ का उपयोग करके अपने कार्ड को ऑफ़लाइन मोड में आसानी से साझा करें, जिससे आप आवश्यकता पड़ने पर सत्यापित जानकारी प्रदान करने में सक्षम होंगे।")==true) ? true : false;
                return isHindiMatch ;
            case "Arabic":
                boolean isArabicMatch  = (actualText.equalsIgnoreCase("شارك بطاقتك بسهولة في وضع عدم الاتصال باستخدام البلوتوث، مما يمكّنك من تقديم معلومات تم التحقق منها كلما لزم الأمر.")==true) ? true : false;
                return isArabicMatch ;
            case "Filipino":
                boolean isFilipinoMatch  = (actualText.equalsIgnoreCase("Ibahagi ang iyong card nang madali sa offline mode gamit ang bluetooth, na nagbibigay ng kapangyarihan sa iyong magbigay ng na-verify na impormasyon kapag kinakailangan.")==true) ? true : false;
                return isFilipinoMatch ;
        }
        return false;
    }

    public boolean  verifyLanguageForAccesstoHistoryHeaderDisplayed(String language){
        String actualText = getTextFromLocator(accesstoHistoryHeader);

        switch (language) {
            case "English":
                boolean isEnglishMatch  = (actualText.equalsIgnoreCase("Access to History")==true) ? true : false;
                return isEnglishMatch ;
            case "Tamil":
                boolean isTamilMatch  = (actualText.equalsIgnoreCase("வரலாற்றிற்கான அணுகல்")==true) ? true : false;
                return isTamilMatch ;
            case "Kannada":
                boolean isKannadaMatch  = (actualText.equalsIgnoreCase("ಇತಿಹಾಸಕ್ಕೆ ಪ್ರವೇಶ")==true) ? true : false;
                return isKannadaMatch ;
            case "Hindi":
                boolean isHindiMatch  = (actualText.equalsIgnoreCase("इतिहास तक पहुंच")==true) ? true : false;
                return isHindiMatch ;
            case "Arabic":
                boolean isArabicMatch  = (actualText.equalsIgnoreCase("الوصول إلى التاريخ")==true) ? true : false;
                return isArabicMatch ;
            case "Filipino":
                boolean isFilipinoMatch  = (actualText.equalsIgnoreCase("Access sa Kasaysayan")==true) ? true : false;
                return isFilipinoMatch ;
        }
        return false;
    }

    public boolean  verifyLanguageForaccesstoHistoryDescriptionDisplayed(String language){
        String actualText = getTextFromLocator(accesstoHistoryDescription);

        switch (language) {
            case "English":
                boolean isEnglishMatch  = (actualText.equalsIgnoreCase("View your activity history to track your interactions and stay informed about your past actions within the app.")==true) ? true : false;
                return isEnglishMatch ;
            case "Tamil":
                boolean isTamilMatch  = (actualText.equalsIgnoreCase("உங்களின் செயல்பாடுகளைக் கண்காணிக்க உங்கள் செயல்பாட்டு வரலாற்றைப் பார்க்கவும், மேலும் பயன்பாட்டில் உங்கள் கடந்தகாலச் செயல்களைப் பற்றித் தெரிந்துகொள்ளவும்.")==true) ? true : false;
                return isTamilMatch ;
            case "Kannada":
                boolean isKannadaMatch  = (actualText.equalsIgnoreCase("ನಿಮ್ಮ ಸಂವಹನಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಲು ನಿಮ್ಮ ಚಟುವಟಿಕೆಯ ಇತಿಹಾಸವನ್ನು ವೀಕ್ಷಿಸಿ ಮತ್ತು ಅಪ್ಲಿಕೇಶನ್\u200Cನಲ್ಲಿ ನಿಮ್ಮ ಹಿಂದಿನ ಕ್ರಿಯೆಗಳ ಬಗ್ಗೆ ಮಾಹಿತಿ ನೀಡಿ.")==true) ? true : false;
                return isKannadaMatch ;
            case "Hindi":
                boolean isHindiMatch  = (actualText.equalsIgnoreCase("अपने इंटरैक्शन को ट्रैक करने और ऐप के भीतर अपने पिछले कार्यों के बारे में सूचित रहने के लिए अपना गतिविधि इतिहास देखें।")==true) ? true : false;
                return isHindiMatch ;
            case "Arabic":
                boolean isArabicMatch  = (actualText.equalsIgnoreCase("اعرض سجل نشاطك لتتبع تفاعلاتك والبقاء على علم بإجراءاتك السابقة داخل التطبيق.")==true) ? true : false;
                return isArabicMatch ;
            case "Filipino":
                boolean isFilipinoMatch  = (actualText.equalsIgnoreCase("Tingnan ang iyong history ng aktibidad upang subaybayan ang iyong mga pakikipag-ugnayan at manatiling may alam tungkol sa iyong mga nakaraang pagkilos sa loob ng app.")==true) ? true : false;
                return isFilipinoMatch ;
        }
        return false;
    }

    public boolean  verifyLanguageForAppSettingsHeaderDisplayed(String language){
        String actualText = getTextFromLocator(appSettingsHeader);

        switch (language) {
            case "English":
                boolean isEnglishMatch  = (actualText.equalsIgnoreCase("App Settings")==true) ? true : false;
                return isEnglishMatch ;
            case "Tamil":
                boolean isTamilMatch  = (actualText.equalsIgnoreCase("பயன்பாட்டு அமைப்புகள்")==true) ? true : false;
                return isTamilMatch ;
            case "Kannada":
                boolean isKannadaMatch  = (actualText.equalsIgnoreCase("ಅಪ್ಲಿಕೇಶನ್ ಸೆಟ್ಟಿಂಗ್\u200Cಗಳು")==true) ? true : false;
                return isKannadaMatch ;
            case "Hindi":
                boolean isHindiMatch  = (actualText.equalsIgnoreCase("एप्लिकेशन सेटिंग")==true) ? true : false;
                return isHindiMatch ;
            case "Arabic":
                boolean isArabicMatch  = (actualText.equalsIgnoreCase("إعدادات التطبيقات")==true) ? true : false;
                return isArabicMatch ;
            case "Filipino":
                boolean isFilipinoMatch  = (actualText.equalsIgnoreCase("Mga Setting ng App")==true) ? true : false;
                return isFilipinoMatch ;
        }
        return false;
    }

    public boolean  verifyLanguageForAppSettingsDescriptionDisplayed(String language){
        String actualText = getTextFromLocator(appSettingsDescription);

        switch (language) {
            case "English":
                boolean isEnglishMatch  = (actualText.equalsIgnoreCase("Customize your app experience with personalized settings as per your preferences.")==true) ? true : false;
                return isEnglishMatch ;
            case "Tamil":
                boolean isTamilMatch  = (actualText.equalsIgnoreCase("உங்கள் விருப்பங்களின்படி தனிப்பயனாக்கப்பட்ட அமைப்புகளுடன் உங்கள் பயன்பாட்டு அனுபவத்தைத் தனிப்பயனாக்கவும்.")==true) ? true : false;
                return isTamilMatch ;
            case "Kannada":
                boolean isKannadaMatch  = (actualText.equalsIgnoreCase("ನಿಮ್ಮ ಆದ್ಯತೆಗಳ ಪ್ರಕಾರ ವೈಯಕ್ತೀಕರಿಸಿದ ಸೆಟ್ಟಿಂಗ್\u200Cಗಳೊಂದಿಗೆ ನಿಮ್ಮ ಅಪ್ಲಿಕೇಶನ್ ಅನುಭವವನ್ನು ಕಸ್ಟಮೈಸ್ ಮಾಡಿ.")==true) ? true : false;
                return isKannadaMatch ;
            case "Hindi":
                boolean isHindiMatch  = (actualText.equalsIgnoreCase("अपनी प्राथमिकताओं के अनुसार वैयक्तिकृत सेटिंग्स के साथ अपने ऐप अनुभव को अनुकूलित करें।")==true) ? true : false;
                return isHindiMatch ;
            case "Arabic":
                boolean isArabicMatch  = (actualText.equalsIgnoreCase("قم بتخصيص تجربة التطبيق الخاص بك من خلال الإعدادات المخصصة وفقًا لتفضيلاتك.")==true) ? true : false;
                return isArabicMatch ;
            case "Filipino":
                boolean isFilipinoMatch  = (actualText.equalsIgnoreCase("I-customize ang iyong karanasan sa app gamit ang mga naka-personalize na setting ayon sa iyong mga kagustuhan.")==true) ? true : false;
                return isFilipinoMatch ;
        }
        return false;
    }

    public boolean  verifyLanguageForCardViewTitleDisplayed(String language){
        String actualText = getTextFromLocator(cardViewTitle);

        switch (language) {
            case "English":
                boolean isEnglishMatch  = (actualText.equalsIgnoreCase("Card")==true) ? true : false;
                return isEnglishMatch ;
            case "Tamil":
                boolean isTamilMatch  = (actualText.equalsIgnoreCase("உங்கள் விருப்பங்களின்படி தனிப்பயனாக்கப்பட்ட அமைப்புகளுடன் உங்கள் பயன்பாட்டு அனுபவத்தைத் தனிப்பயனாக்கவும்.")==true) ? true : false;
                return isTamilMatch ;
            case "Kannada":
                boolean isKannadaMatch  = (actualText.equalsIgnoreCase("ನಿಮ್ಮ ಆದ್ಯತೆಗಳ ಪ್ರಕಾರ ವೈಯಕ್ತೀಕರಿಸಿದ ಸೆಟ್ಟಿಂಗ್\u200Cಗಳೊಂದಿಗೆ ನಿಮ್ಮ ಅಪ್ಲಿಕೇಶನ್ ಅನುಭವವನ್ನು ಕಸ್ಟಮೈಸ್ ಮಾಡಿ.")==true) ? true : false;
                return isKannadaMatch ;
            case "Hindi":
                boolean isHindiMatch  = (actualText.equalsIgnoreCase("अपनी प्राथमिकताओं के अनुसार वैयक्तिकृत सेटिंग्स के साथ अपने ऐप अनुभव को अनुकूलित करें।")==true) ? true : false;
                return isHindiMatch ;
            case "Arabic":
                boolean isArabicMatch  = (actualText.equalsIgnoreCase("قم بتخصيص تجربة التطبيق الخاص بك من خلال الإعدادات المخصصة وفقًا لتفضيلاتك.")==true) ? true : false;
                return isArabicMatch ;
            case "Filipino":
                boolean isFilipinoMatch  = (actualText.equalsIgnoreCase("I-customize ang iyong karanasan sa app gamit ang mga naka-personalize na setting ayon sa iyong mga kagustuhan.")==true) ? true : false;
                return isFilipinoMatch ;
        }
        return false;
    }

    public boolean  verifyLanguageForCardViewDescriptionDisplayed(String language){
        String actualText = getTextFromLocator(cardViewDescription);

        switch (language) {
            case "English":
                boolean isEnglishMatch  = (actualText.equalsIgnoreCase("Your card displays your verified identity information. Tap for a detailed view or click on … for additional options.")==true) ? true : false;
                return isEnglishMatch ;
            case "Tamil":
                boolean isTamilMatch  = (actualText.equalsIgnoreCase("உங்கள் விருப்பங்களின்படி தனிப்பயனாக்கப்பட்ட அமைப்புகளுடன் உங்கள் பயன்பாட்டு அனுபவத்தைத் தனிப்பயனாக்கவும்.")==true) ? true : false;
                return isTamilMatch ;
            case "Kannada":
                boolean isKannadaMatch  = (actualText.equalsIgnoreCase("ನಿಮ್ಮ ಆದ್ಯತೆಗಳ ಪ್ರಕಾರ ವೈಯಕ್ತೀಕರಿಸಿದ ಸೆಟ್ಟಿಂಗ್\u200Cಗಳೊಂದಿಗೆ ನಿಮ್ಮ ಅಪ್ಲಿಕೇಶನ್ ಅನುಭವವನ್ನು ಕಸ್ಟಮೈಸ್ ಮಾಡಿ.")==true) ? true : false;
                return isKannadaMatch ;
            case "Hindi":
                boolean isHindiMatch  = (actualText.equalsIgnoreCase("अपनी प्राथमिकताओं के अनुसार वैयक्तिकृत सेटिंग्स के साथ अपने ऐप अनुभव को अनुकूलित करें।")==true) ? true : false;
                return isHindiMatch ;
            case "Arabic":
                boolean isArabicMatch  = (actualText.equalsIgnoreCase("قم بتخصيص تجربة التطبيق الخاص بك من خلال الإعدادات المخصصة وفقًا لتفضيلاتك.")==true) ? true : false;
                return isArabicMatch ;
            case "Filipino":
                boolean isFilipinoMatch  = (actualText.equalsIgnoreCase("I-customize ang iyong karanasan sa app gamit ang mga naka-personalize na setting ayon sa iyong mga kagustuhan.")==true) ? true : false;
                return isFilipinoMatch ;
        }
        return false;
    }


    public void clickOnFirstNextButton() {
        clickOnElement(firstNextButton);
    }
    public void clickOnSecondNextButton() {
        clickOnElement(secondNextButton);
    }
    public void clickOnThirdNextButton() {
        clickOnElement(thirdNextButton);
    }

    public void clickOnForthNextButton() {
        clickOnElement(forthNextButton);
    }

    public void clickOnFifthDoneButton() {
        clickOnElement(fifthDoneButton);
    }

    public void clickOnFifthNextButton() {
        clickOnElement(fifthNextButton);
    }
    public void clickOnFifthPreviousButton() {
        clickOnElement(fifthPreviousButton);
    }
    public void clickOnForthPreviousButton() {
        clickOnElement(forthPreviousButton);
    }

    public void clickOnThirdPreviousButton() {
        clickOnElement(thirdPreviousButton);
    }

    public void clickOnSecondPreviousButton() {
        clickOnElement(secondPreviousButton);
    }

    public void clickOnDoneButton() {
        if(isElementDisplayed(doneButton))
            clickOnElement(doneButton);
    }

    public void clickOnNextButtonForInjiTour() {
        if(isElementDisplayed(firstNextButton)) {
            clickOnElement(firstNextButton);
            clickOnElement(secondNextButton);
            clickOnElement(thirdNextButton);
            clickOnElement(forthNextButton);
            clickOnElement(fifthDoneButton);
        }
    }

    public boolean isCredentialTypeValueDisplayed() {
        if(isElementDisplayed(doneButton)){
            clickOnElement(doneButton);
        }
        return this.isElementDisplayed(credentialTypeValue);

    }
    public boolean isInjiLogoDisplayed() {
        return  isElementDisplayed(injiLogo);
    }

    public void clickOnCrossIconButton() {
        clickOnElement(closeButton);
    }

}
