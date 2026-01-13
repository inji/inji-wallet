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

	    for (IMethodInstance mi : methods) {
	        String methodName = mi.getMethod().getMethodName();
	        String bugId = knownIssues.get("*." + methodName);

	        if (bugId != null) {
	            mi.getMethod().setDescription("KNOWN_ISSUE::" + bugId);
	        }
	    }

	    return methods;
	}
}
