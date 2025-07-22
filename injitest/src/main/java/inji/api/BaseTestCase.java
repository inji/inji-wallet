package inji.api;

import inji.utils.FetchErrorMessages;
import inji.utils.UinGenerationUtil;
import io.restassured.response.Response;
import org.apache.log4j.PropertyConfigurator;
import org.json.simple.JSONObject;

import javax.ws.rs.core.MediaType;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.*;


public class BaseTestCase {
	private static final org.slf4j.Logger logger= org.slf4j.LoggerFactory.getLogger(BaseTestCase.class);
	public static String environment;
	public static List<String> languageList = new ArrayList<>();
	public static String ApplnURI;

	private static final String[] uinArray = new String[5];
	private static final Random random = new Random();
	public static String ApplnURIForKeyCloak;
	public static String testLevel;
	protected static MockSMTPListener mockSMTPListener = null;
	public static Properties props = getproperty(
			UinGenerationUtil.getResourcePath() + "/config/application.properties");
	public static Properties propsKernel = getproperty(
			UinGenerationUtil.getResourcePath() + "/config/"+ UinGenerationUtil.getKernalFilename());


	public static Properties propsMap = getproperty(
			UinGenerationUtil.getResourcePath() + "/config/valueMapping.properties");
	public static Properties propsBio = getproperty(
			UinGenerationUtil.getResourcePath() + "/config/bioValue.properties");
	public static String SEPRATOR = "";
	public static String currentModule = "residentui1";
	public final static String COOKIENAME = "Authorization";

	public static String insuranceUrl;
	public static CommonLibrary kernelCmnLib = null;
	public static KernelAuthentication kernelAuthLib = null;
	public String adminCookie = null;
	public String idrepoCookie = null;
	public static String uinEmail;
	public static String uinPhone;

	public static String uin="";
	public static String uin2="";
	public static String uin3="";
	public static String uin4="";
	public static String uin5="";

	public static String perpetualVid="";
	public static String onetimeuseVid="";
	public static String temporaryVid="";
	public static String InsuranceNum="";


	public static void main( String[] args ) {



	}

	public static void intiateUINGenration() {


		uin = AdminTestUtil.generateUIN();
		FetchErrorMessages.fetchAndPrintErrors();
			for (int i = 0; i < uinArray.length; i++) {
				uinArray[i] = AdminTestUtil.generateUIN();

				System.out.println(uinArray[i]);
			}

		System.out.println(uinArray);

		insuranceUrl= ConfigManager.getiam_Insurance_path();
		InsuranceNum= AdminTestUtil.generateInsurance();

		if (uin != null) {
			perpetualVid = AdminTestUtil.generateVID(uin, "perpetual");
			onetimeuseVid = AdminTestUtil.generateVID(uin, "onetimeuse");
			temporaryVid= AdminTestUtil.generateVID(uin, "temporary");
			
//			mockSMTPListener = new MockSMTPListener();
//			mockSMTPListener.run();
		}
	}

	public static String getRandomUIN() {
		int index = random.nextInt(uinArray.length);
		return uinArray[index];
	}


	public static String getOSType() {
		String type = System.getProperty("os.name");
		if (type.toLowerCase().contains("windows")) {
			SEPRATOR = "\\\\";
			return "WINDOWS";
		} else if (type.toLowerCase().contains("linux") || type.toLowerCase().contains("unix")) {
			SEPRATOR = "/";
			return "OTHERS";
		}
		return null;
	}

	public static List<String> getLanguageList() {
		logger.info("We have created a Config Manager. Beginning to read properties!");

		environment = ConfigManager.getiam_apienvuser();
		logger.info("Environemnt is  ==== :" + environment);
		ApplnURI = ConfigManager.getiam_apiinternalendpoint();
		logger.info("Application URI ======" + ApplnURI);


		logger.info("Configs from properties file are set.");
		if (!languageList.isEmpty()) {
			return languageList;
		}
		String url = ApplnURI + props.getProperty("preregLoginConfigUrl");
		Response response = RestClient.getRequest(url, MediaType.APPLICATION_JSON, MediaType.APPLICATION_JSON);
		org.json.JSONObject responseJson = new org.json.JSONObject(response.asString());
		org.json.JSONObject responseValue = (org.json.JSONObject) responseJson.get("response");
		String mandatoryLanguage = (String) responseValue.get("mosip.mandatory-languages");

		languageList.add(mandatoryLanguage);
		languageList.addAll(Arrays.asList(((String) responseValue.get("mosip.optional-languages")).split(",")));

		return languageList;
	}

	public static Properties getproperty(String path) {
		Properties prop = new Properties();

		try {
			File file = new File(path);
			prop.load(new FileInputStream(file));
		} catch (IOException e) {
			logger.error("Exception " + e.getMessage());
		}
		return prop;
	}

	public static void initialize() {
		PropertyConfigurator.configure(getLoggerPropertyConfig());
		kernelAuthLib = new KernelAuthentication();
		kernelCmnLib = new CommonLibrary();
		/**
		 * Make sure test-output is there
		 */

		getOSType();
		logger.info("We have created a Config Manager. Beginning to read properties!");

		environment = ConfigManager.getiam_apienvuser();
		logger.info("Environemnt is  ==== :" + environment);
		ApplnURI = ConfigManager.getiam_apiinternalendpoint();
		logger.info("Application URI ======" + ApplnURI);
		ApplnURIForKeyCloak = ConfigManager.getIAMUrl();
		logger.info("Application URI ======" + ApplnURIForKeyCloak);
		testLevel = System.getProperty("env.testLevel");
		logger.info("Test Level ======" + testLevel);
		logger.info("Test Level ======" + languageList);

		logger.info("Configs from properties file are set.");

	}

	private static String targetEnvVersion = "";

	public static boolean isTargetEnvLTS() {

		if (targetEnvVersion.isEmpty()) {

			Response response = null;
			org.json.JSONObject responseJson = null;
			String url = ApplnURI + "/v1/auditmanager/actuator/info";
			try {
				response = RestClient.getRequest(url, MediaType.APPLICATION_JSON, MediaType.APPLICATION_JSON);
				GlobalMethods.reportResponse(response.getHeaders().asList().toString(), url, response);

				responseJson = new org.json.JSONObject(response.getBody().asString());

				targetEnvVersion = responseJson.getJSONObject("build").getString("version");

			} catch (Exception e) {
				logger.error(GlobalConstants.EXCEPTION_STRING_2 + e);
			}
		}
		return targetEnvVersion.contains("1.2");
	}

	private static Properties getLoggerPropertyConfig() {
		Properties logProp = new Properties();
		logProp.setProperty("log4j.rootLogger", "INFO, Appender1,Appender2");
		logProp.setProperty("log4j.appender.Appender1", "org.apache.log4j.ConsoleAppender");
		logProp.setProperty("log4j.appender.Appender1.layout", "org.apache.log4j.PatternLayout");
		logProp.setProperty("log4j.appender.Appender1.layout.ConversionPattern", "%-7p %d [%t] %c %x - %m%n");
		logProp.setProperty("log4j.appender.Appender2", "org.apache.log4j.FileAppender");
		logProp.setProperty("log4j.appender.Appender2.File", "src/logs/mosip-api-test.log");
		logProp.setProperty("log4j.appender.Appender2.layout", "org.apache.log4j.PatternLayout");
		logProp.setProperty("log4j.appender.Appender2.layout.ConversionPattern", "%-7p %d [%t] %c %x - %m%n");
		return logProp;
	}

	//ToDo - Need to address this
	 public static String getOtp() {
//		 ConfigManager.init();
//		 mockSMTPListener = new MockSMTPListener();
//		 mockSMTPListener.run();
	  	  String otp="111111";
//	  	  String externalemail = TestDataReader.readData("externalemail");
//	  	  otp = MockSMTPListener.getOtp(externalemail);
	  	  return otp;
	    }

	public static JSONObject getRequestJson(String filepath) {
		return kernelCmnLib.readJsonData(filepath, true);

	}
}