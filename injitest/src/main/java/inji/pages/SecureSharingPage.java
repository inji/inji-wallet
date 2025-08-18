package inji.pages;

import io.appium.java_client.AppiumDriver;
import io.appium.java_client.pagefactory.AndroidFindBy;
import io.appium.java_client.pagefactory.iOSXCUITFindBy;
import org.openqa.selenium.WebElement;

import java.util.HashMap;
import java.util.Map;

public class SecureSharingPage extends BasePage {

    @AndroidFindBy(accessibility = "introTitle-two")
    @iOSXCUITFindBy(accessibility = "introTitle-two")
    private WebElement secureSharingText;

    @AndroidFindBy(accessibility = "introText-two")
    @iOSXCUITFindBy(accessibility = "introText-two")
    private WebElement secureSharingDescription;

    @AndroidFindBy(accessibility = "next")
    @iOSXCUITFindBy(accessibility = "next")
    private WebElement nextButton;

    @AndroidFindBy(xpath = "//android.widget.TextView[@text=\"Requester\"]")
    @iOSXCUITFindBy(accessibility = "passwordTypeDescription")
    private WebElement RequesterHeader;

    @AndroidFindBy(xpath = "//android.widget.TextView[@text=\"Please select an ID\"]")
    @iOSXCUITFindBy(accessibility = "passwordTypeDescription")
    private WebElement pleaseSelectId;


    public SecureSharingPage(AppiumDriver driver) {
        super(driver);
    }

    private static final Map<String, Map<String, String>> LANGUAGE_TEXT_MAP = new HashMap<>();

    static {
        Map<String, String> secureSharingText = new HashMap<>();
        secureSharingText.put("English", "Secure Sharing");
        secureSharingText.put("Tamil", "பாதுகாப்பான பகிர்வு");
        secureSharingText.put("Kannada", "ಸುರಕ್ಷಿತ ಹಂಚಿಕೆ");
        secureSharingText.put("Hindi", "सुरक्षित साझाकरण");
        secureSharingText.put("Arabic", "المشاركة الآمنة");
        secureSharingText.put("Filipino", "Ligtas na Pagbabahagi");
        LANGUAGE_TEXT_MAP.put("SecureSharingText", secureSharingText);

        Map<String, String> secureSharingDescription = new HashMap<>();
        secureSharingDescription.put("English", "Share your cards securely in a hassle free way and avail various services.");
        secureSharingDescription.put("Tamil", "தொந்தரவு இல்லாத வகையில் உங்கள் கார்டுகளைப் பாதுகாப்பாகப் பகிர்ந்து, பல்வேறு சேவைகளைப் பெறுங்கள்.");
        secureSharingDescription.put("Kannada", "ನಿಮ್ಮ ಕಾರ್ಡ್‌ಗಳನ್ನು ಜಗಳ ಮುಕ್ತ ರೀತಿಯಲ್ಲಿ ಸುರಕ್ಷಿತವಾಗಿ ಹಂಚಿಕೊಳ್ಳಿ ಮತ್ತು ವಿವಿಧ ಸೇವೆಗಳನ್ನು ಪಡೆದುಕೊಳ್ಳಿ.");
        secureSharingDescription.put("Hindi", "परेशानी मुक्त तरीके से अपने कार्ड सुरक्षित रूप से साझा करें और विभिन्न सेवाओं का लाभ उठाएं।");
        secureSharingDescription.put("Arabic", "شارك بطاقاتك بأمان وبطريقة خالية من المتاعب واستفد من الخدمات المتنوعة.");
        secureSharingDescription.put("Filipino", "Ibahagi ang iyong mga card nang ligtas sa isang walang problemang paraan at mag-avail ng iba't ibang serbisyo.");
        LANGUAGE_TEXT_MAP.put("SecureSharingDescription", secureSharingDescription);
    }

    public boolean verifyLanguageText(String key, String language, String actualText) {
        Map<String, String> languageMap = LANGUAGE_TEXT_MAP.get(key);
        if (languageMap == null) return false;

        String expectedText = languageMap.get(language);
        if (expectedText == null) return false;

        return actualText.equalsIgnoreCase(expectedText);
    }


    public boolean verifyLanguageForSecureSharingPageLoaded(String language) {
        return verifyLanguageText("SecureSharingText", language, getText(secureSharingText));
    }

    public boolean getSecureSharingDescription(String language) {
        return verifyLanguageText("SecureSharingDescription", language, getText(secureSharingDescription));
    }

    public void clickOnNextButton() {
        click(nextButton, "Click on 'Next' button to proceed to App Unlock Method Page");
        new AppUnlockMethodPage(driver);
    }

    public Boolean isRequesterHeaderTextDisplayed() {
        return isElementVisible(RequesterHeader, "Check if 'Requester' header text is displayed");
    }

    public Boolean isPleaseSelectIdTextDisplayed() {
        return isElementVisible(pleaseSelectId, "Check if 'Please select ID' text is displayed");
    }

}