package inji.pages;

import io.appium.java_client.AppiumDriver;
import io.appium.java_client.pagefactory.AndroidFindBy;
import io.appium.java_client.pagefactory.iOSXCUITFindBy;
import org.openqa.selenium.WebElement;

import java.util.HashMap;
import java.util.Map;

public class QuickAccessPage extends BasePage {

    @AndroidFindBy(accessibility = "introTitle-four")
    @iOSXCUITFindBy(accessibility = "introTitle-four")
    private WebElement quickAccessText;

    @AndroidFindBy(accessibility = "introText-four")
    @iOSXCUITFindBy(accessibility = "introText-four")
    private WebElement quickAccessDescription;

    @AndroidFindBy(accessibility = "next")
    @iOSXCUITFindBy(accessibility = "next")
    private WebElement nextButton;

    @AndroidFindBy(accessibility = "scanningGuideText")
    @iOSXCUITFindBy(accessibility = "scanningGuideText")
    private WebElement holdPhoneSteadyMessage;

    public QuickAccessPage(AppiumDriver driver) {
        super(driver);
    }

    private static final Map<String, Map<String, String>> LANGUAGE_TEXT_MAP = new HashMap<>();

    static {
        Map<String, String> quickAccessText = new HashMap<>();
        quickAccessText.put("English", "Quick Access");
        quickAccessText.put("Tamil", "விரைவான அணுகல்");
        quickAccessText.put("Kannada", "ತ್ವರಿತ ಪ್ರವೇಶ");
        quickAccessText.put("Hindi", "त्वरित ऐक्सेस");
        quickAccessText.put("Arabic", "الوصول السريع");
        quickAccessText.put("Filipino", "Mabilis na pagpasok");
        LANGUAGE_TEXT_MAP.put("QuickAccessText", quickAccessText);

        Map<String, String> quickAccessDescription = new HashMap<>();
        quickAccessDescription.put("English", "Authenticate yourself with ease using the stored digital credential.");
        quickAccessDescription.put("Tamil", "சேமிக்கப்பட்ட டிஜிட்டல் நற்சான்றிதழைப் பயன்படுத்தி உங்களை எளிதாக அங்கீகரிக்கவும்.");
        quickAccessDescription.put("Kannada", "ಸಂಗ್ರಹಿಸಿದ ಡಿಜಿಟಲ್ ರುಜುವಾತುಗಳನ್ನು ಬಳಸಿಕೊಂಡು ಸುಲಭವಾಗಿ ನಿಮ್ಮನ್ನು ದೃಢೀಕರಿಸಿ.");
        quickAccessDescription.put("Hindi", "संग्रहीत डिजिटल क्रेडेंशियल का उपयोग करके आसानी से स्वयं को प्रमाणित करें।");
        quickAccessDescription.put("Arabic", "قم بالمصادقة على نفسك بسهولة باستخدام بيانات الاعتماد الرقمية المخزنة.");
        quickAccessDescription.put("Filipino", "I-authenticate ang iyong sarili nang madali gamit ang nakaimbak na digital na kredensyal.");
        LANGUAGE_TEXT_MAP.put("QuickAccessDescription", quickAccessDescription);
    }

    public boolean verifyLanguageText(String key, String language, String actualText) {
        Map<String, String> languageMap = LANGUAGE_TEXT_MAP.get(key);
        if (languageMap == null) return false;

        String expectedText = languageMap.get(language);
        if (expectedText == null) return false;

        return actualText.equalsIgnoreCase(expectedText);
    }

    public boolean verifyQuickAccessTitle(String language) {
        return verifyLanguageText("QuickAccessText", language, getText(quickAccessText));
    }

    public boolean VerifyQuickAccessDescription(String language) {
        return verifyLanguageText("QuickAccessDescription", language, getText(quickAccessDescription));
    }

    public AppUnlockMethodPage clickOnNextButton() {
        click(nextButton, "Click on Next button to proceed to App Unlock Method page");
        return new AppUnlockMethodPage(driver);
    }

    public Boolean isHoldPhoneSteadyMessageDisplayed() {
        return isElementVisible(holdPhoneSteadyMessage, "Verify 'Hold phone steady' message is displayed");
    }

}