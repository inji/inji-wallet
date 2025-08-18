package inji.pages;

import io.appium.java_client.AppiumDriver;
import io.appium.java_client.pagefactory.AndroidFindBy;
import io.appium.java_client.pagefactory.iOSXCUITFindBy;
import org.openqa.selenium.WebElement;

import java.util.HashMap;
import java.util.Map;

public class TrustedDigitalWalletPage extends BasePage {

    @AndroidFindBy(accessibility = "introTitle-three")
    @iOSXCUITFindBy(accessibility = "introTitle-three")
    private WebElement trustedDigitalWalletText;

    @AndroidFindBy(accessibility = "introText-three")
    @iOSXCUITFindBy(accessibility = "introText-three")
    private WebElement trustedDigitalWalletDescription;

    @AndroidFindBy(accessibility = "next")
    @iOSXCUITFindBy(accessibility = "next")
    private WebElement nextButton;

    @AndroidFindBy(accessibility = "injiLogo")
    @iOSXCUITFindBy(accessibility = "injiLogo")
    private WebElement injiLogo;

    @AndroidFindBy(accessibility = "helpText")
    @iOSXCUITFindBy(accessibility = "helpText")
    private WebElement helpText;

    public TrustedDigitalWalletPage(AppiumDriver driver) {
        super(driver);
    }

    private static final Map<String, Map<String, String>> LANGUAGE_TEXT_MAP = new HashMap<>();

    static {
        Map<String, String> trustedWalletMap = new HashMap<>();
        trustedWalletMap.put("English", "Trusted Digital Wallet");
        trustedWalletMap.put("Tamil", "நம்பகமான டிஜிட்டல் வாலட்");
        trustedWalletMap.put("Kannada", "ವಿಶ್ವಾಸಾರ್ಹ ಡಿಜಿಟಲ್ ವಾಲೆಟ್");
        trustedWalletMap.put("Hindi", "विश्वसनीय डिजिटल वॉलेट");
        trustedWalletMap.put("Arabic", "المحفظة الرقمية الموثوقة");
        trustedWalletMap.put("Filipino", "Pinagkakatiwalaang Digital Wallet");
        LANGUAGE_TEXT_MAP.put("TrustedDigitalWallet", trustedWalletMap);

        Map<String, String> trustedWalletDescMap = new HashMap<>();
        trustedWalletDescMap.put("English", "Store and carry all your important cards in a single trusted wallet.");
        trustedWalletDescMap.put("Tamil", "உங்கள் முக்கியமான கார்டுகளை ஒரே நம்பகமான பணப்பையில் சேமித்து எடுத்துச் செல்லுங்கள்.");
        trustedWalletDescMap.put("Kannada", "ನಿಮ್ಮ ಎಲ್ಲಾ ಪ್ರಮುಖ ಕಾರ್ಡ್\u200Cಗಳನ್ನು ಒಂದೇ ವಿಶ್ವಾಸಾರ್ಹ ವ್ಯಾಲೆಟ್\u200Cನಲ್ಲಿ ಸಂಗ್ರಹಿಸಿ ಮತ್ತು ಒಯ್ಯಿರಿ.");
        trustedWalletDescMap.put("Hindi", "अपने सभी महत्वपूर्ण कार्डों को एक ही विश्वसनीय वॉलेट में रखें और रखें।");
        trustedWalletDescMap.put("Arabic", "قم بتخزين وحمل جميع بطاقاتك المهمة في محفظة واحدة موثوقة.");
        trustedWalletDescMap.put("Filipino", "Itabi at dalhin ang lahat ng iyong mahahalagang card sa isang pinagkakatiwalaang wallet.");
        LANGUAGE_TEXT_MAP.put("TrustedDigitalWalletDescription", trustedWalletDescMap);
    }

    public boolean verifyLanguageText(String key, String language, String actualText) {
        Map<String, String> languageMap = LANGUAGE_TEXT_MAP.get(key);
        if (languageMap == null) return false;

        String expectedText = languageMap.get(language);
        if (expectedText == null) return false;

        return actualText.equalsIgnoreCase(expectedText);
    }

    public boolean verifyLanguageforTrustedDigitalWalletPageLoaded(String language) {
        return verifyLanguageText("TrustedDigitalWallet", language, getText(trustedDigitalWalletText));
    }


    public boolean getTrustedDigitalWalletDescription(String language) {
        return verifyLanguageText("TrustedDigitalWalletDescription", language, getText(trustedDigitalWalletDescription));
    }

    public AppUnlockMethodPage clickOnNextButton() {
        click(nextButton, "Click on Next button in App Unlock Method screen");
        return new AppUnlockMethodPage(driver);
    }

    public Boolean isInjiLogoDisplayed() {
        return isElementVisible(injiLogo, "Check if Inji logo is displayed on App Unlock Method screen");
    }

    public Boolean isHelpTextDisplayed() {
        return isElementVisible(helpText, "Check if Help text is displayed on App Unlock Method screen");
    }
}