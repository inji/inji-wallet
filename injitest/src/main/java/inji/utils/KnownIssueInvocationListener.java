package inji.utils;
import org.testng.IInvokedMethod;
import org.testng.IInvokedMethodListener;
import org.testng.ITestResult;
import org.testng.SkipException;

public class KnownIssueInvocationListener implements IInvokedMethodListener {

    @Override
    public void beforeInvocation(IInvokedMethod method, ITestResult result) {

        if (!method.isTestMethod()) return;

        String desc = method.getTestMethod().getDescription();
        if (desc != null && desc.startsWith("KNOWN_ISSUE::")) {
            throw new SkipException(desc);
        }
    }
}
