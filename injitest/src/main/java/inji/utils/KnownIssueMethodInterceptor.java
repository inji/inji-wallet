package inji.utils;

import java.util.List;
import java.util.Map;
import org.testng.IMethodInstance;
import org.testng.IMethodInterceptor;
import org.testng.ITestContext;
import inji.runner.MosipTestRunner;

public class KnownIssueMethodInterceptor implements IMethodInterceptor {

    @Override
    public List<IMethodInstance> intercept(List<IMethodInstance> methods, ITestContext context) {
        Map<String, String> knownIssues = MosipTestRunner.knownIssues;

        // Keep all tests in runnableTests
        for (IMethodInstance mi : methods) {
            String simpleKey = mi.getMethod().getTestClass().getRealClass().getSimpleName()
                    + "." + mi.getMethod().getMethodName();
            String fullKey = mi.getMethod().getTestClass().getRealClass().getName()
                    + "." + mi.getMethod().getMethodName();

            String bugId = knownIssues.get(simpleKey);
            if (bugId == null) bugId = knownIssues.get(fullKey);
            if (bugId == null) bugId = knownIssues.get("*." + mi.getMethod().getMethodName());

            // Attach bugId to description for reporting
            if (bugId != null) {
                mi.getMethod().setDescription("KNOWN_ISSUE::" + bugId);
            }
        }

        return methods; // Return all tests
    }
}
