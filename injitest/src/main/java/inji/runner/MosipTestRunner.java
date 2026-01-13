package inji.runner;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

import org.apache.log4j.Level;
import org.apache.log4j.Logger;
import org.testng.TestNG;
import org.testng.xml.SuiteXmlParser;
import org.testng.xml.XmlClass;
import org.testng.xml.XmlInclude;
import org.testng.xml.XmlSuite;
import org.testng.xml.XmlTest;

import inji.constants.InjiWalletConstants;
import inji.utils.InjiWalletConfigManager;
import inji.utils.InjiWalletUtil;
import io.mosip.testrig.apirig.dataprovider.BiometricDataProvider;
import io.mosip.testrig.apirig.dbaccess.DBManager;
import io.mosip.testrig.apirig.testrunner.BaseTestCase;
import io.mosip.testrig.apirig.testrunner.ExtractResource;
import io.mosip.testrig.apirig.testrunner.HealthChecker;
import io.mosip.testrig.apirig.testrunner.OTPListener;
import io.mosip.testrig.apirig.utils.AdminTestUtil;
import io.mosip.testrig.apirig.utils.AuthTestsUtil;
import io.mosip.testrig.apirig.utils.CertsUtil;
import io.mosip.testrig.apirig.utils.GlobalConstants;
import io.mosip.testrig.apirig.utils.JWKKeyUtil;
import io.mosip.testrig.apirig.utils.KernelAuthentication;
import io.mosip.testrig.apirig.utils.KeyCloakUserAndAPIKeyGeneration;
import io.mosip.testrig.apirig.utils.KeycloakUserManager;
import io.mosip.testrig.apirig.utils.MispPartnerAndLicenseKeyGeneration;
import io.mosip.testrig.apirig.utils.OutputValidationUtil;
import io.mosip.testrig.apirig.utils.PartnerRegistration;

/**
 * Class to initiate mosip api test execution
 *
 * @author Vignesh
 */
public class MosipTestRunner {
	private static final Logger LOGGER = Logger.getLogger(MosipTestRunner.class);
	private static String cachedPath = null;

	public static String jarUrl = MosipTestRunner.class.getProtectionDomain().getCodeSource().getLocation().getPath();


	public static Map<String, String> knownIssues = new HashMap<>();

	/**
	 * C Main method to start mosip test execution
	 */

	public static void main(String[] args) {

		try {
			LOGGER.info(
					"** ------------- Inji Mobile Test Rig Run Started --------------------------------------------- **");

			BaseTestCase.setRunContext(getRunType(), jarUrl);
			ExtractResource.removeOldMosipTestTestResource();
			if (getRunType().equalsIgnoreCase("JAR")) {
				ExtractResource.extractCommonResourceFromJar();
			} else {
				ExtractResource.copyCommonResources();
			}
			AdminTestUtil.init();
			InjiWalletConfigManager.init();
			suiteSetup(getRunType());
			setLogLevels();
			loadKnownIssues();
			HealthChecker healthCheck = new HealthChecker();
			healthCheck.setCurrentRunningModule(BaseTestCase.currentModule);
			Thread trigger = new Thread(healthCheck);
			trigger.start();

			KeycloakUserManager.removeUser();
			KeycloakUserManager.createUsers();
			KeycloakUserManager.closeKeycloakInstance();
			AdminTestUtil.getRequiredField();

			// Generate device certificates to be consumed by Mock-MDS
			PartnerRegistration.deleteCertificates();
			AdminTestUtil.createAndPublishPolicy();
			AdminTestUtil.createEditAndPublishPolicy();
			PartnerRegistration.deviceGeneration();

			// Generating biometric details with mock MDS
			BiometricDataProvider.generateBiometricTestData("Registration");

			startTestRunner();
		} catch (Exception e) {
			LOGGER.error("Exception " + e.getMessage());
			System.exit(1);
		}

		KeycloakUserManager.removeUser();
		KeycloakUserManager.closeKeycloakInstance();

		OTPListener.bTerminate = true;

		HealthChecker.bTerminate = true;

		System.exit(0);

	}

	public static void suiteSetup(String runType) {
		if (InjiWalletConfigManager.IsDebugEnabled())
			LOGGER.setLevel(Level.ALL);
		else
			LOGGER.info("Test Framework for Mosip Inji Mobile Initialized");
		BaseTestCase.initialize();
		LOGGER.info("Done with BeforeSuite and test case setup! su TEST EXECUTION!\n\n");

		if (!runType.equalsIgnoreCase("JAR")) {
			AuthTestsUtil.removeOldMosipTempTestResource();
		}
		BaseTestCase.currentModule = InjiWalletConstants.INJI_WALLET;
		BaseTestCase.certsForModule = InjiWalletConstants.INJI_WALLET;
		BaseTestCase.copymoduleSpecificAndConfigFile(InjiWalletConstants.INJI_WALLET);
		BaseTestCase.otpListener = new OTPListener();
		BaseTestCase.otpListener.run();
	}

	private static void setLogLevels() {
		AdminTestUtil.setLogLevel();
		OutputValidationUtil.setLogLevel();
		PartnerRegistration.setLogLevel();
		KeyCloakUserAndAPIKeyGeneration.setLogLevel();
		MispPartnerAndLicenseKeyGeneration.setLogLevel();
		JWKKeyUtil.setLogLevel();
		CertsUtil.setLogLevel();
		KernelAuthentication.setLogLevel();
		BaseTestCase.setLogLevel();
		InjiWalletUtil.setLogLevel();
		KeycloakUserManager.setLogLevel();
		DBManager.setLogLevel();
		BiometricDataProvider.setLogLevel();
	}

	/**
	 * The method to start mosip testng execution
	 *
	 * @throws IOException
	 */
	public static void startTestRunner() throws IOException {
		File homeDir;
		String os = System.getProperty("os.name");
		LOGGER.info(os);
		if (getRunType().contains("IDE") || os.toLowerCase().contains("windows")) {
			homeDir = new File(System.getProperty("user.dir") + "/testNgXmlFiles");
			LOGGER.info("IDE :" + homeDir);
		} else {
			File dir = new File(System.getProperty("user.dir"));
			homeDir = new File(dir.getParent() + "/mosip/testNgXmlFiles");
			LOGGER.info("ELSE :" + homeDir);
		}

		String testCasesProperty = InjiWalletConfigManager.getproperty("testcases_toRun"); // e.g., "method1,method2"
		List<String> testCases = null;
		if (testCasesProperty != null && !testCasesProperty.trim().isEmpty()) {
			testCases = Arrays.asList(testCasesProperty.split(","));
			LOGGER.info("Running only selected test cases: " + testCases);
		}

		File[] files = homeDir.listFiles();
		if (files != null) {
			for (File file : files) {					
					String testngXmlFile = System.getProperty("testngXmlFile");
					if (testngXmlFile != null && file.getName().toLowerCase().contains(testngXmlFile.toLowerCase())) {

					TestNG runner = new TestNG();
					runner.setMethodInterceptor(new inji.utils.KnownIssueMethodInterceptor());

//                    TestNG runner = new TestNG();
					List<String> suitefiles = new ArrayList<>();

					BaseTestCase.setReportName(InjiWalletConstants.INJI_WALLET);
					System.getProperties().setProperty("testng.output.dir", "testng-report");
					runner.setOutputDirectory("testng-report");

					if (testCases != null) {
						// ---- normalize and split the filter: support both ClassName.method and plain
						// method ----
						Set<String> raw = testCases.stream().map(String::trim).filter(s -> !s.isEmpty())
								.collect(Collectors.toSet());
						Map<String, List<String>> byClass = new HashMap<>(); // fqcn/simple -> methods
						List<String> methodOnly = new ArrayList<>();

						for (String s : raw) {
							int dot = s.lastIndexOf('.');
							if (dot > 0 && dot < s.length() - 1) {
								String cls = s.substring(0, dot);
								String mth = s.substring(dot + 1);
								byClass.computeIfAbsent(cls, k -> new ArrayList<>()).add(mth);
								// also index by simple class name for convenience
								String simple = cls.substring(cls.lastIndexOf('.') + 1);
								byClass.computeIfAbsent(simple, k -> new ArrayList<>()).add(mth);
							} else {
								methodOnly.add(s);
							}
						}

						SuiteXmlParser parser = new SuiteXmlParser();

						// ---- parse the top-level regression xml ----
						XmlSuite topSuite;
						try (FileInputStream fis = new FileInputStream(file)) {
							topSuite = parser.parse(file.getAbsolutePath(), fis, true);
						}

						// ---- collect target suites to modify: either child suite-files, or the suite
						// itself if none ----
						List<XmlSuite> targets = new ArrayList<>();
						List<String> suiteFiles = topSuite.getSuiteFiles(); // entries from <suite-files>
						if (suiteFiles != null && !suiteFiles.isEmpty()) {
							for (String childPath : suiteFiles) {
								File childFile = new File(file.getParentFile(), childPath); // resolve relative to
																							// parent folder
								try (FileInputStream cfis = new FileInputStream(childFile)) {
									XmlSuite child = parser.parse(childFile.getAbsolutePath(), cfis, true);
									filterSuite(child, byClass, methodOnly); // <- apply method filtering
									targets.add(child);
								}
							}
						} else {
							// topSuite directly contains tests (no <suite-files>)
							filterSuite(topSuite, byClass, methodOnly);
							targets.add(topSuite);
						}

						// ---- run only the filtered suites ----
						runner.setXmlSuites(targets);
					} else {
						// Run full suite unchanged
						suitefiles.add(file.getAbsolutePath());
						runner.setTestSuites(suitefiles);
					}

					runner.run();
				}
			}
		} else {
			LOGGER.error("No files found in directory: " + homeDir);
		}
	}

	private static void filterSuite(XmlSuite suite, Map<String, List<String>> byClass, List<String> methodOnly) {
		for (XmlTest xmlTest : suite.getTests()) {
			List<XmlClass> kept = new ArrayList<>();
			for (XmlClass xc : xmlTest.getClasses()) {
				List<XmlInclude> includes = new ArrayList<>();

				// reflect to avoid including non-existing methods
				Set<String> methodNames = new HashSet<>();
				try {
					Class<?> clazz = Class.forName(xc.getName());
					for (java.lang.reflect.Method m : clazz.getMethods()) {
						methodNames.add(m.getName());
					}
				} catch (ClassNotFoundException ignore) {
					/* keep empty set */ }

				// class-qualified filters (FQCN or simple name)
				List<String> classList = new ArrayList<>();
				classList.addAll(byClass.getOrDefault(xc.getName(), Collections.emptyList()));
				classList.addAll(byClass.getOrDefault(simpleName(xc.getName()), Collections.emptyList()));
				for (String m : classList) {
					if (methodNames.isEmpty() || methodNames.contains(m)) {
						includes.add(new XmlInclude(m));
					}
				}

				// plain method-only filters (apply only if present on the class)
				for (String m : methodOnly) {
					if (methodNames.isEmpty() || methodNames.contains(m)) {
						includes.add(new XmlInclude(m));
					}
				}

				if (!includes.isEmpty()) {
					xc.setIncludedMethods(includes);
					kept.add(xc);
				}
			}
			// if at least one class has includes, restrict the test to those classes
			if (!kept.isEmpty()) {
				xmlTest.setXmlClasses(kept);
			}
		}
	}

	private static String simpleName(String fqcn) {
		int i = fqcn.lastIndexOf('.');
		return i >= 0 ? fqcn.substring(i + 1) : fqcn;
	}

	public static String getGlobalResourcePath() {
		if (cachedPath != null) {
			return cachedPath;
		}

		String path = null;
		if (getRunType().equalsIgnoreCase("JAR")) {
			path = new File(jarUrl).getParentFile().getAbsolutePath() + "/MosipTestResource/MosipTemporaryTestResource";
		} else if (getRunType().equalsIgnoreCase("IDE")) {
			path = new File(MosipTestRunner.class.getClassLoader().getResource("").getPath()).getAbsolutePath()
					+ "/MosipTestResource/MosipTemporaryTestResource";
			if (path.contains(GlobalConstants.TESTCLASSES))
				path = path.replace(GlobalConstants.TESTCLASSES, "classes");
		}

		if (path != null) {
			cachedPath = path;
			return path;
		} else {
			return "Global Resource File Path Not Found";
		}
	}

	public static String getResourcePath() {
		return getGlobalResourcePath();
	}

	public static Properties getproperty(String path) {
		Properties prop = new Properties();
		FileInputStream inputStream = null;
		try {
			File file = new File(path);
			inputStream = new FileInputStream(file);
			prop.load(inputStream);
		} catch (Exception e) {
			LOGGER.error(GlobalConstants.EXCEPTION_STRING_2 + e.getMessage());
		} finally {
			AdminTestUtil.closeInputStream(inputStream);
		}
		return prop;
	}

	/**
	 * The method will return mode of application started either from jar or eclipse
	 * ide
	 *
	 * @return
	 */
	public static String getRunType() {
		if (MosipTestRunner.class.getResource("MosipTestRunner.class").getPath().contains(".jar"))
			return "JAR";
		else
			return "IDE";
	}
	
	
	private static void loadKnownIssues() {

	    String platform = InjiWalletConfigManager.getproperty("browserstack_platformName");
	    if (platform == null || platform.trim().isEmpty()) {
	        throw new RuntimeException("browserstack_platformName not set");
	    }

	    String knownIssuesFile;
	    switch (platform.trim().toLowerCase()) {
	        case "android":
	            knownIssuesFile = "Known_Issues_Android.txt";
	            break;
	        case "ios":
	            knownIssuesFile = "Known_Issues_ios.txt";
	            break;
	        default:
	            throw new IllegalArgumentException("Unsupported platform: " + platform);
	    }

	    String knownIssuesPath = getResourcePath() + "/config/" + knownIssuesFile;
	    LOGGER.info("Loading Known Issues from: " + knownIssuesPath);

	    try (BufferedReader br = new BufferedReader(
	            new InputStreamReader(new FileInputStream(knownIssuesPath), StandardCharsets.UTF_8))) {

	        String line;
	        while ((line = br.readLine()) != null) {
	            line = line.trim();

	            if (line.isEmpty() || line.startsWith("#") || !line.contains("------")) {
	                continue;
	            }

	            String[] parts = line.split("------", 2);
	            String bugId = parts[0].trim();
	            String methodName = parts[1].trim();

	            if (bugId.isEmpty() || methodName.isEmpty()) {
	                LOGGER.warn("Skipping malformed known issue line: " + line);
	                continue;
	            }

	            // Enforce method-name only (shared standard)
	            if (!methodName.matches("^[A-Za-z0-9_]+$")) {
	                LOGGER.warn(
	                    "Skipping known issue entry. Expected method name only but found: " + methodName
	                );
	                continue;
	            }

	            knownIssues.put("*." + methodName, bugId);
	        }

	        LOGGER.info("Known Issues Loaded: " + knownIssues);

	    } catch (Exception e) {
	        LOGGER.warn(knownIssuesFile + " not found or unreadable: " + e.getMessage());
	    }
	}
}