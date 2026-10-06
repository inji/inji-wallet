package inji.pages;

import io.appium.java_client.AppiumDriver;
import io.appium.java_client.pagefactory.AndroidFindBy;
import io.appium.java_client.pagefactory.iOSXCUITFindBy;
import org.openqa.selenium.WebElement;

public class WelcomePage extends BasePage {

    @AndroidFindBy(accessibility = "introTitle-one")
    @iOSXCUITFindBy(accessibility = "introTitle-one")
    private WebElement welcomeText;

    @AndroidFindBy(accessibility = "introText-one")
    @iOSXCUITFindBy(accessibility = "introText-one")
    private WebElement welcomeTextDescription;

    @AndroidFindBy(accessibility = "skipButton-one")
    @iOSXCUITFindBy(accessibility = "skipButton-one")
    private WebElement skipButton;

    @AndroidFindBy(accessibility = "next")
    @iOSXCUITFindBy(accessibility = "next")
    private WebElement nextButton;

    @AndroidFindBy(accessibility = "backButton-one")
    @iOSXCUITFindBy(accessibility = "backButton-one")
    public WebElement backButton;

    @AndroidFindBy(accessibility = "header")
    @iOSXCUITFindBy(accessibility = "header")
    private WebElement selectAppUnlockMethodHeader;

    @AndroidFindBy(accessibility = "description")
    @iOSXCUITFindBy(accessibility = "description")
    private WebElement description;

    @AndroidFindBy(accessibility = "passwordTypeDescription")
    @iOSXCUITFindBy(accessibility = "passwordTypeDescription")
    private WebElement passwordTypeDescription;

    @AndroidFindBy(xpath = "//android.widget.TextView[@text=\"Requester\"]")
    @iOSXCUITFindBy(accessibility = "passwordTypeDescription")
    private WebElement RequesterHeader;

    @AndroidFindBy(accessibility = "injiLogo")
    @iOSXCUITFindBy(accessibility = "injiLogo")
    private WebElement injiLogo;

    @AndroidFindBy(accessibility = "helpText")
    @iOSXCUITFindBy(accessibility = "helpText")
    private WebElement helpText;

    @AndroidFindBy(accessibility = "AccountSectionHeader")
    @iOSXCUITFindBy(accessibility = "AccountSectionHeader")
    private WebElement AccountSectionHeader;

    @AndroidFindBy(accessibility = "LastBackupSectionHeader")
    @iOSXCUITFindBy(accessibility = "LastBackupSectionHeader")
    private WebElement LastBackupSectionHeader;

    @AndroidFindBy(xpath = "(//android.widget.TextView[@text=\"Backup & Restore\"])[2]")
    @iOSXCUITFindBy(accessibility = "AccountSectionHeader")
    private WebElement BackupAndRestore;

    public WelcomePage(AppiumDriver driver) {
        super(driver);
    }

    public String verifyLanguageForWelcomePageLoaded() {
        return getText(welcomeText); // You may optionally add description support to getText as well
    }

    public boolean isWelcomePageLoaded() {
        return isElementVisible(welcomeText, "Check if Welcome page is loaded");
    }

    public AppUnlockMethodPage clickOnSkipButton() {
        click(skipButton, "Click on Skip button on Welcome page");
        return new AppUnlockMethodPage(driver);
    }

    public void clickOnNextButton() {
        click(nextButton, "Click on Next button on Welcome page");
        new AppUnlockMethodPage(driver);
    }

    public void clickOnBackButton() {
        click(backButton, "Click on Back button on Welcome page");
    }

    public Boolean isSelectAppUnlockMethodHeaderTextDisplayed() {
        return isElementVisible(selectAppUnlockMethodHeader, "Check if 'Select App Unlock Method' header is displayed");
    }

    public Boolean isWelcomePageDescriptionTextDisplayed() {
        return isElementVisible(description, "Check if Welcome page description text is displayed");
    }

    public Boolean isPasswordTypeDescriptionTextDisplayed() {
        return isElementVisible(passwordTypeDescription, "Check if Password type description text is displayed");
    }

    public boolean getWelcomeDescription(String language) {
        String actualText = getText(welcomeTextDescription);

        return switch (language) {
            case "English" ->
                    actualText.equalsIgnoreCase("Keep your digital credential with you at all times. Inji helps you manage and use them effectively. To get started, add cards to your profile.");
            case "Tamil" ->
                    actualText.equalsIgnoreCase("உங்கள் டிஜிட்டல் நற்சான்றிதழை எப்போதும் உங்களுடன் வைத்திருக்கவும். அவற்றை திறம்பட நிர்வகிக்கவும் பயன்படுத்தவும் இன்ஜி உதவுகிறது. தொடங்குவதற்கு, உங்கள் சுயவிவரத்தில் கார்டுகளைச் சேர்க்கவும்.");
            case "Filipino" ->
                    actualText.equalsIgnoreCase("Panatilihin ang iyong digital na kredensyal sa iyo sa lahat ng oras. Tinutulungan ka ng Inji na pamahalaan at gamitin ang mga ito nang epektibo. Upang makapagsimula, magdagdag ng mga card sa iyong profile.");
            case "Hindi" ->
                    actualText.equalsIgnoreCase("अपने डिजिटल क्रेडेंशियल को हमेशा अपने पास रखें। Inji आपको उन्हें प्रभावी ढंग से प्रबंधित करने और उपयोग करने में मदद करता है। आरंभ करने के लिए, अपनी प्रोफ़ाइल में कार्ड जोड़ें।");
            case "Kannada" ->
                    actualText.equalsIgnoreCase("ನಿಮ್ಮ ಡಿಜಿಟಲ್ ರುಜುವಾತುಗಳನ್ನು ಯಾವಾಗಲೂ ನಿಮ್ಮೊಂದಿಗೆ ಇರಿಸಿಕೊಳ್ಳಿ. ಅವುಗಳನ್ನು ಪರಿಣಾಮಕಾರಿಯಾಗಿ ನಿರ್ವಹಿಸಲು ಮತ್ತು ಬಳಸಲು ಇಂಜಿ ನಿಮಗೆ ಸಹಾಯ ಮಾಡುತ್ತದೆ. ಪ್ರಾರಂಭಿಸಲು, ನಿಮ್ಮ ಪ್ರೊಫೈಲ್\u200Cಗೆ ಕಾರ್ಡ್\u200Cಗಳನ್ನು ಸೇರಿಸಿ.");
            case "Arabic" ->
                    actualText.equalsIgnoreCase("احتفظ ببياناتك الرقمية معك دائمًا. يساعدك Inji على إدارتها واستخدامها بفعالية. للبدء، أضف بطاقات إلى ملفك الشخصي.");
            default -> false;
        };
    }
}