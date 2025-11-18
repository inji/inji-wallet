package inji.pages;

import com.aventstack.extentreports.Status;
import inji.utils.ExtentReportManager;
import inji.utils.InjiWalletConfigManager;
import io.appium.java_client.AppiumBy;
import io.appium.java_client.AppiumDriver;
import io.appium.java_client.pagefactory.AppiumFieldDecorator;
import org.apache.log4j.Logger;
import org.openqa.selenium.*;
import org.openqa.selenium.interactions.PointerInput;
import org.openqa.selenium.interactions.Sequence;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.Collections;
import java.util.List;

public class BasePage {
    protected AppiumDriver driver;
    protected WebDriverWait wait;
    protected static final Logger logger = Logger.getLogger(BasePage.class);

    private static final int DEFAULT_WAIT = Integer.parseInt(InjiWalletConfigManager.getproperty("element_wait_time"));
    private static final int maxPageScrolls = Integer.parseInt(InjiWalletConfigManager.getproperty("max_pageScroll"));
    private static final int POLLING_INTERVAL = 500;

    public BasePage(AppiumDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(DEFAULT_WAIT));
        PageFactory.initElements(new AppiumFieldDecorator(driver), this);
    }

    // -------- Enhanced Logging Methods --------

    private void logStep(String description, WebElement element) {
        ExtentReportManager.getTest().log(Status.INFO,
                description + "<details><summary>Locator Details</summary><pre>" + element + "</pre></details>");
    }

    private void logStep(String description, By locator) {
        ExtentReportManager.getTest().log(Status.INFO,
                description + "<details><summary>Locator Details</summary><pre>" + formatLocator(locator) + "</pre></details>");
    }

    // ---------- Element Visibility ----------

    protected boolean isElementVisible(By locator) {
        return isElementVisible(locator, DEFAULT_WAIT);
    }

    protected boolean isElementVisible(By locator, long seconds) {
        try {
            getWait(seconds).until(ExpectedConditions.visibilityOfElementLocated(locator));
            return true;
        } catch (TimeoutException e) {
            return false;
        }
    }

    protected boolean isElementVisible(By locator, String stepDesc) {
        return isElementVisible(locator, DEFAULT_WAIT, stepDesc);
    }

    protected boolean isElementVisible(By locator, long seconds, String stepDesc) {
        try {
            getWait(seconds).until(ExpectedConditions.visibilityOfElementLocated(locator));
            logStep(stepDesc, locator);
            return true;
        } catch (TimeoutException e) {
            ExtentReportManager.getTest().log(Status.WARNING, "Element not visible: " + locator.toString());
            return false;
        }
    }

    protected boolean isElementVisible(WebElement element) {
        return isElementVisible(element, DEFAULT_WAIT);
    }

    protected boolean isElementVisible(WebElement element, long waitTime) {
        try {
            getWait(waitTime).until(ExpectedConditions.visibilityOf(element));
            return true;
        } catch (TimeoutException e) {
            return false;
        }
    }

    protected boolean isElementVisible(WebElement element, String stepDesc) {
        return isElementVisible(element, DEFAULT_WAIT, stepDesc);
    }

    protected boolean isElementVisible(WebElement element, long waitTime, String stepDesc) {
        try {
            getWait(waitTime).until(ExpectedConditions.visibilityOf(element));
            logStep(stepDesc, element);
            return true;
        } catch (TimeoutException e) {
            ExtentReportManager.getTest().log(Status.WARNING, stepDesc + " - But Element not visible: " + element);
            return false;
        }
    }

    protected boolean isElementInvisible(WebElement element, long waitTime) {
        try {
            getWait(waitTime).until(ExpectedConditions.invisibilityOf(element));
            return true;
        } catch (TimeoutException e) {
            return false;
        }
    }

    protected boolean isElementInvisible(WebElement element) {
        return isElementInvisible(element, DEFAULT_WAIT);
    }

    protected boolean isElementInvisible(WebElement element, long waitTime, String stepDesc) {
        try {
            getWait(waitTime).until(ExpectedConditions.invisibilityOf(element));
            logStep(stepDesc, element);
            return true;
        } catch (TimeoutException e) {
            ExtentReportManager.getTest().log(Status.WARNING, "Element did not become invisible: " + describeElement(element));
            return false;
        }
    }

    protected boolean isElementInvisible(WebElement element, String stepDesc) {
        return isElementInvisible(element, DEFAULT_WAIT, stepDesc);
    }

    // ---------- Element Actions ----------

    protected void click(WebElement element, String stepDesc) {
        if (isElementVisible(element)) {
            try {
                element.click();
                logStep(stepDesc + " - Clicked", element);
            } catch (Exception e) {
                ExtentReportManager.getTest().log(Status.FAIL, "Failed to click on element: " + describeElement(element));
                throw e;
            }
        } else {
            throw new RuntimeException("Element not visible: " + stepDesc);
        }
    }

    protected void click(By locator, String stepDesc) {
        WebElement element = driver.findElement(locator);
        click(element, stepDesc);
    }

    protected void retryClick(WebElement element, int maxRetries, String stepDesc) {
        for (int attempt = 0; attempt < maxRetries; attempt++) {
            try {
                click(element, stepDesc);
                ExtentReportManager.getTest().log(Status.INFO, "Clicked after retry #" + (attempt + 1));
                return;
            } catch (StaleElementReferenceException | ElementClickInterceptedException e) {
                sleep(500);
            }
        }
        ExtentReportManager.getTest().log(Status.FAIL, "Unable to click element after " + maxRetries + " retries: " + describeElement(element));
        throw new RuntimeException("Unable to click element after " + maxRetries + " retries");
    }

    protected void enterText(WebElement element, String text, String stepDesc) {
        if (isElementVisible(element)) {
            element.sendKeys(text);
            logStep(stepDesc + " - Entered text: '" + text + "'", element);
        } else {
            throw new RuntimeException("Element not visible: " + stepDesc);
        }
    }

    protected void clearAndSendKeys(WebElement element, String text, String stepDesc) {
        if (isElementVisible(element)) {
            element.clear();
            element.sendKeys(text);
            logStep(stepDesc + " - Cleared and entered: '" + text + "'", element);
        } else {
            throw new RuntimeException("Element not visible: " + stepDesc);
        }
    }

    // ---------- Element State ----------

    protected boolean isElementEnabled(WebElement element) {
        boolean enabled = isElementVisible(element, 30) && element.isEnabled();
        ExtentReportManager.getTest().log(Status.INFO, "Element " + describeElement(element) + " enabled: " + enabled);
        return enabled;
    }

    protected boolean isElementEnabled(WebElement element, String stepDesc) {
        boolean enabled = isElementVisible(element, 30) && element.isEnabled();
        logStep(stepDesc, element);
        return enabled;
    }

    protected String getText(WebElement element, String stepDesc) {
        if (isElementVisible(element)) {
            String text = element.getText();
            logStep(stepDesc + " - Text from element: '" + text + "'", element);
            return text;
        }
        return "";
    }

    protected String retryGetText(WebElement element, String stepDesc) {
        for (int i = 0; i < 3; i++) {
            try {
                return getText(element, stepDesc);
            } catch (StaleElementReferenceException e) {
                sleep(500);
            }
        }
        ExtentReportManager.getTest().log(Status.FAIL, "Failed to get text after retries: " + describeElement(element));
        throw new RuntimeException("Unable to get text after retries");
    }

    protected String getText(WebElement element) {
        if (isElementVisible(element)) {
            String text = element.getText();
            ExtentReportManager.getTest().log(Status.INFO, "Text from element " + describeElement(element) + ": " + text);
            return text;
        }
        return "";
    }

    protected String retryGetText(WebElement element) {
        for (int i = 0; i < 3; i++) {
            try {
                return getText(element);
            } catch (StaleElementReferenceException e) {
                sleep(500);
            }
        }
        ExtentReportManager.getTest().log(Status.FAIL, "Failed to get text after retries: " + describeElement(element));
        throw new RuntimeException("Unable to get text after retries");
    }

    protected boolean retryVisible(WebElement element, String stepDesc) {
        for (int i = 0; i < 3; i++) {
            if (isElementVisible(element, stepDesc)) return true;
            sleep(500);
        }
        ExtentReportManager.getTest().log(Status.WARNING, "Element not visible after retries: " + describeElement(element));
        return false;
    }

    protected boolean retryVisible(WebElement element) {
        for (int i = 0; i < 3; i++) {
            if (isElementVisible(element)) return true;
            sleep(500);
        }
        ExtentReportManager.getTest().log(Status.WARNING, "Element not visible after retries: " + describeElement(element));
        return false;
    }

    protected void clickIfVisible(WebElement element) {
        if (isElementVisible(element)) {
            element.click();
            ExtentReportManager.getTest().log(Status.INFO, "ClickIfVisible executed: " + describeElement(element));
        }
    }

    // ---------- Wait Helpers ----------

    private WebDriverWait getWait(long seconds) {
        return (WebDriverWait) new WebDriverWait(driver, Duration.ofSeconds(seconds))
                .pollingEvery(Duration.ofMillis(POLLING_INTERVAL))
                .ignoring(NoSuchElementException.class)
                .ignoring(StaleElementReferenceException.class);
    }

    void sleep(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException ignored) {
        }
    }

    protected void waitUntilElementIsInvisible(WebElement element, int waitTimeInSeconds, String stepDesc) {
        try {
            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(waitTimeInSeconds));
            wait.until(ExpectedConditions.invisibilityOf(element));
            logStep(stepDesc + " - Waited until element is invisible: '", element);
            ExtentReportManager.getTest().log(Status.INFO, "Waited until element is invisible: " + describeElement(element));
        } catch (TimeoutException e) {
            ExtentReportManager.getTest().log(Status.FAIL, "Element did not become invisible within " + waitTimeInSeconds + "s: " + describeElement(element));
            throw new RuntimeException("Element did not become invisible within timeout", e);
        }
    }

    protected void waitUntilElementIsInvisible(WebElement element, int waitTimeInSeconds) {
        try {
            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(waitTimeInSeconds));
            wait.until(ExpectedConditions.invisibilityOf(element));
            ExtentReportManager.getTest().log(Status.INFO, "Waited until element is invisible: " + describeElement(element));
        } catch (TimeoutException e) {
            ExtentReportManager.getTest().log(Status.FAIL, "Element did not become invisible within " + waitTimeInSeconds + "s: " + describeElement(element));
            throw new RuntimeException("Element did not become invisible within timeout", e);
        }
    }

    protected void waitUntilElementIsVisible(WebElement element, int waitTimeInSeconds) {
        try {
            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(waitTimeInSeconds));
            wait.until(ExpectedConditions.visibilityOf(element));
            ExtentReportManager.getTest().log(Status.INFO, "Waited until element is visible: " + describeElement(element));
        } catch (TimeoutException e) {
            ExtentReportManager.getTest().log(Status.FAIL, "Element was not visible within " + waitTimeInSeconds + "s: " + describeElement(element));
            throw new RuntimeException("Element was not visible within timeout", e);
        }
    }

    protected List<WebElement> waitForAllInputs(By locator, int expectedSize) {
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.numberOfElementsToBeMoreThan(locator, expectedSize - 1));
        ExtentReportManager.getTest().log(Status.INFO, "Located at least " + expectedSize + " elements for: " + locator.toString());
        return driver.findElements(locator);
    }

    //Log Helpers
    private String describeElement(WebElement element) {
        try {
            String contentDesc = element.getAttribute("content-desc");
            String id = element.getAttribute("resource-id");
            String text = element.getText();

            if (contentDesc != null && !contentDesc.isEmpty()) {
                return "\"" + contentDesc + "\"";
            } else if (text != null && !text.isEmpty()) {
                return "\"" + text + "\"";
            } else if (id != null && !id.isEmpty()) {
                return "\"" + id.substring(id.lastIndexOf("/") + 1) + "\""; // just the id name
            } else {
                return "[Unnamed element]";
            }
        } catch (Exception e) {
            return "[Element details unavailable]";
        }
    }

    private String formatLocator(By locator) {
        String locatorStr = locator.toString();
        // Typically looks like "By.id: xyz"
        if (locatorStr.contains(": ")) {
            String[] parts = locatorStr.split(": ", 2);
            String method = parts[0].replace("By.", "");
            String value = parts[1];
            return "By." + method + "(\"" + value + "\")";
        }
        return locatorStr;
    }

    // Scroll Helpers
    public void scrollAndClickByAccessibilityId(String accessibilityId, int maxScrolls, String stepDesc) {
        for (int attempts = 0; attempts < maxScrolls; attempts++) {
            try {
                int waitTime = (attempts == 0) ? 10 : 2; // long wait first time, short later
                WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(waitTime));

                // Wait for element to be visible
                WebElement element = wait.until(
                        ExpectedConditions.visibilityOfElementLocated(AppiumBy.accessibilityId(accessibilityId))
                );

                // Click it
                element.click();
                logStep(stepDesc + " - Clicked", element);
                return; // success, exit method

            } catch (TimeoutException | NoSuchElementException e) {
                scrollDown(); // only scroll if not found
            } catch (Exception e) {
                ExtentReportManager.getTest().log(Status.FAIL, "Failed to click on element: " + accessibilityId);
                throw e;
            }
        }

        // If we reach here, element was never found/clicked → fail the test
        String errorMsg = "Element with accessibilityId '" + accessibilityId + "' was not found after " + maxScrolls + " scroll attempts.";
        ExtentReportManager.getTest().log(Status.FAIL, errorMsg);
        throw new AssertionError(errorMsg);
    }

    public void scrollAndClickByAccessibilityId(String accessibilityId, String stepDesc) {
        for (int attempts = 0; attempts < maxPageScrolls; attempts++) {
            try {
                int waitTime = (attempts == 0) ? 10 : 2; // long wait first time, short later
                WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(waitTime));

                // Wait for element to be visible
                WebElement element = wait.until(
                        ExpectedConditions.visibilityOfElementLocated(AppiumBy.accessibilityId(accessibilityId))
                );

                // Click it
                element.click();
                logStep(stepDesc + " - Clicked", element);
                return; // success, exit method

            } catch (TimeoutException | NoSuchElementException e) {
                scrollDown(); // only scroll if not found
            } catch (Exception e) {
                ExtentReportManager.getTest().log(Status.FAIL, "Failed to click on element: " + accessibilityId);
                throw e;
            }
        }

        // If we reach here, element was never found/clicked → fail the test
        String errorMsg = "Element with accessibilityId '" + accessibilityId + "' was not found after " + maxPageScrolls + " scroll attempts.";
        ExtentReportManager.getTest().log(Status.FAIL, errorMsg);
        throw new AssertionError(errorMsg);
    }

    public void scrollDown() {
        Dimension size = driver.manage().window().getSize();
        int startX = size.width / 2;
        int startY = (int) (size.height * 0.7);
        int endY = (int) (size.height * 0.3);

        PointerInput finger = new PointerInput(PointerInput.Kind.TOUCH, "finger");
        Sequence swipe = new Sequence(finger, 1);

        swipe.addAction(finger.createPointerMove(Duration.ZERO, PointerInput.Origin.viewport(), startX, startY));
        swipe.addAction(finger.createPointerDown(PointerInput.MouseButton.LEFT.asArg()));
        swipe.addAction(finger.createPointerMove(Duration.ofMillis(700), PointerInput.Origin.viewport(), startX, endY));
        swipe.addAction(finger.createPointerUp(PointerInput.MouseButton.LEFT.asArg()));

        driver.perform(Collections.singletonList(swipe));
    }
}