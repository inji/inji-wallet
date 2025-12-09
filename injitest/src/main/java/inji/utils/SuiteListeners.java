package inji.utils;

import org.testng.ISuite;
import org.testng.ISuiteListener;
import org.testng.ITestResult;

public interface SuiteListeners extends ISuiteListener {

    void onTestFailure(ISuite suite);
}
