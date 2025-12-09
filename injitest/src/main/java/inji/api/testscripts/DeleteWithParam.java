package inji.api.testscripts;

import inji.utils.InjiWalletConfigManager;
import inji.utils.InjiWalletUtil;
import io.mosip.testrig.apirig.dto.OutputValidationDto;
import io.mosip.testrig.apirig.dto.TestCaseDTO;
import io.mosip.testrig.apirig.testrunner.HealthChecker;
import io.mosip.testrig.apirig.utils.*;
import io.restassured.response.Response;
import org.apache.log4j.Level;
import org.apache.log4j.Logger;
import org.json.JSONObject;
import org.testng.*;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;
import org.testng.internal.BaseTestMethod;
import org.testng.internal.TestResult;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class DeleteWithParam extends InjiWalletUtil implements ITest {
    private static final Logger logger = Logger.getLogger(DeleteWithParam.class);
    protected String testCaseName = "";
    public Response response = null;

    @BeforeClass
    public static void setLogLevel() {
        if (InjiWalletConfigManager.IsDebugEnabled())
            logger.setLevel(Level.ALL);
        else
            logger.setLevel(Level.ERROR);
    }

    /**
     * get current testcaseName
     */
    @Override
    public String getTestName() {
        return testCaseName;
    }

    /**
     * Data provider class provides test case list
     *
     * @return object of data provider
     */
    @DataProvider(name = "testcaselist")
    public Object[] getTestCaseList(ITestContext context) {
        String ymlFile = context.getCurrentXmlTest().getLocalParameters().get("ymlFile");
        logger.info("Started executing yml: " + ymlFile);
        return getYmlTestData(ymlFile);
    }

    /**
     * Test method for OTP Generation execution
     *
     * @param testCaseDTO
     * @throws AuthenticationTestException
     * @throws AdminTestException
     * @throws SecurityXSSException
     */
    @Test(dataProvider = "testcaselist")
    public void test(TestCaseDTO testCaseDTO) throws AuthenticationTestException, AdminTestException, SecurityXSSException {
        testCaseName = testCaseDTO.getTestCaseName();
        testCaseDTO = InjiWalletUtil.isTestCaseValidForTheExecution(testCaseDTO);
        if (HealthChecker.signalTerminateExecution) {
            throw new SkipException(
                    GlobalConstants.TARGET_ENV_HEALTH_CHECK_FAILED + HealthChecker.healthCheckFailureMapS);
        }
        String[] templateFields = testCaseDTO.getTemplateFields();

        if (testCaseDTO.getTemplateFields() != null && templateFields.length > 0) {
            ArrayList<JSONObject> inputtestCases = AdminTestUtil.getInputTestCase(testCaseDTO);
            ArrayList<JSONObject> outputtestcase = AdminTestUtil.getOutputTestCase(testCaseDTO);

            for (int i = 0; i < languageList.size(); i++) {
                response = deleteWithPathParamAndCookie(ApplnURI + testCaseDTO.getEndPoint(),
                        getJsonFromTemplate(inputtestCases.get(i).toString(), testCaseDTO.getInputTemplate()),
                        COOKIENAME, testCaseDTO.getRole(), testCaseDTO.getTestCaseName());

                Map<String, List<OutputValidationDto>> ouputValid = OutputValidationUtil.doJsonOutputValidation(
                        response.asString(),
                        getJsonFromTemplate(outputtestcase.get(i).toString(), testCaseDTO.getOutputTemplate()),
                        testCaseDTO, response.getStatusCode());
                Reporter.log(ReportUtil.getOutputValidationReport(ouputValid));

                if (!OutputValidationUtil.publishOutputResult(ouputValid))
                    throw new AdminTestException("Failed at output validation");
            }
        } else {

            String inputJson = getJsonFromTemplate(testCaseDTO.getInput(), testCaseDTO.getInputTemplate());
            inputJson = InjiWalletUtil.inputstringKeyWordHandeler(inputJson, testCaseName);

            if (testCaseDTO.getEndPoint().startsWith("$SUNBIRDBASEURL$") && testCaseName.contains("SunBirdR")) {
                String tempUrl = ApplnURI;
                if (InjiWalletConfigManager.isInServiceNotDeployedList("sunbirdrc"))
                    throw new SkipException(GlobalConstants.SERVICE_NOT_DEPLOYED_MESSAGE);

                if (InjiWalletConfigManager.getSunbirdBaseURL() != null && !InjiWalletConfigManager.getSunbirdBaseURL().isBlank())
                    tempUrl = InjiWalletConfigManager.getSunbirdBaseURL();
                testCaseDTO.setEndPoint(testCaseDTO.getEndPoint().replace("$SUNBIRDBASEURL$", ""));


                response = deleteWithPathParamAndCookie(tempUrl + testCaseDTO.getEndPoint(), inputJson, COOKIENAME,
                        testCaseDTO.getRole(), testCaseDTO.getTestCaseName());

            } else {
                response = deleteWithPathParamAndCookie(ApplnURI + testCaseDTO.getEndPoint(), inputJson, COOKIENAME,
                        testCaseDTO.getRole(), testCaseDTO.getTestCaseName());
            }
            Map<String, List<OutputValidationDto>> ouputValid = OutputValidationUtil.doJsonOutputValidation(
                    response.asString(), getJsonFromTemplate(testCaseDTO.getOutput(), testCaseDTO.getOutputTemplate()),
                    testCaseDTO, response.getStatusCode());
            Reporter.log(ReportUtil.getOutputValidationReport(ouputValid));
            if (!OutputValidationUtil.publishOutputResult(ouputValid))
                throw new AdminTestException("Failed at output validation");
        }
    }

    /**
     * The method ser current test name to result
     *
     * @param result
     */
    @AfterMethod(alwaysRun = true)
    public void setResultTestName(ITestResult result) {
        try {
            Field method = TestResult.class.getDeclaredField("m_method");
            method.setAccessible(true);
            method.set(result, result.getMethod().clone());
            BaseTestMethod baseTestMethod = (BaseTestMethod) result.getMethod();
            Field f = baseTestMethod.getClass().getSuperclass().getDeclaredField("m_methodName");
            f.setAccessible(true);
            f.set(baseTestMethod, testCaseName);
        } catch (Exception e) {
            Reporter.log("Exception : " + e.getMessage());
        }
    }
}