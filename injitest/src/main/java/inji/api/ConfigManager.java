package inji.api;


import inji.utils.UinGenerationUtil;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;


public class ConfigManager {

	private static final org.slf4j.Logger LOGGER= org.slf4j.LoggerFactory.getLogger(ConfigManager.class);

	private static final String USEPRECONFIGOTP = "usePreConfiguredOtp";
	private static final String PRECONFIGOTP = "preconfiguredOtp";

	private static final String MOSIP_IDREPO_CLIENT_SECRET = "mosip_idrepo_client_secret";
	private static final String MOSIP_IDREPO_CLIENT_ID = "mosip_idrepo_client_id";
	private static final String MOSIP_IDREPO_APP_ID = "mosip_idrepo_app_id";

	private static final String MOSIP_ADMIN_CLIENT_SECRET = "mosip_admin_client_secret";
	private static final String MOSIP_ADMIN_CLIENT_ID = "mosip_admin_client_id";
	private static final String MOSIP_ADMIN_APP_ID = "mosip_admin_app_id";

	private static final String MOSIP_REG_CLIENT_SECRET = "mosip_reg_client_secret";
	private static final String MOSIP_REG_CLIENT_ID = "mosip_reg_client_id";
	private static final String MOSIP_REGCLIENT_APP_ID = "mosip_regclient_app_id";



	private static final String MOSIP_AUTOMATION_CLIENT_SECRET = "mosip_testrig_client_secret";
	private static final String MOSIP_AUTOMATION_CLIENT_ID = "mosip_testrig_client_id";
	private static final String MOSIP_AUTOMATION_APP_ID = "mosip_automation_app_id";

	private static final String S3_HOST = "s3-host";
	private static String usePreConfiguredOtp;
	private static final String S3_REGION = "s3-region";
	private static final String S3_USER_KEY = "s3-user-key";
	private static final String S3_SECRET_KEY = "s3-user-secret";
	private static final String S3_ACCOUNT = "s3-account";
	private static final String PUSH_TO_S3 = "push-reports-to-s3";
	private static final String ENABLE_DEBUG = "enableDebug";
	private static final String THREAD_COUNT = "threadCount";
	private static final String LANG_SELECT = "langselect";
	private static String preconfiguredOtp;

	private static final String DB_PORT = "db-port";
	private static final String DB_DOMAIN = "db-server";
	private static final String HIBERNATE_CONNECTION_DRIVER_CLASS = "hibernate.connection.driver_class";
	private static final String HIBERNATE_CONNECTION_POOL_SIZE = "hibernate.connection.pool_size";
	private static final String HIBERNATE_DIALECT = "hibernate.dialect";
	private static final String HIBERNATE_SHOW_SQL = "hibernate.show_sql";
	private static final String HIBERNATE_CONTEXT_CLASS = "hibernate.current_session_context_class";

	private static final String AUDIT_DB_USER = "db-su-user";
	private static final String AUDIT_DB_PASS = "postgresql-password";
	private static final String AUDIT_DB_SCHEMA = "audit_db_schema";

	private static final String IDA_DB_USER = "db-su-user";
	private static final String IDA_DB_PASS = "postgresql-password";
	private static final String IDA_DB_SCHEMA = "ida_db_schema";

	private static final String PMS_DB_USER = "db-su-user";
	private static final String PMS_DB_PASS = "postgresql-password";
	private static final String PMS_DB_SCHEMA = "pms_db_schema";

	private static final String KM_DB_USER = "db-su-user";
	private static final String KM_DB_PASS = "postgresql-password";
	private static final String KM_DB_SCHEMA = "km_db_schema";

	private static final String MASTER_DB_USER = "db-su-user";
	private static final String MASTER_DB_PASS = "postgresql-password";
	private static final String MASTER_DB_SCHEMA = "master_db_schema";

	private static final String IAM_EXTERNAL_URL = "keycloak-external-url";
	private static final String IAM_ADMINPORTAL_PATH = "adminPortalPath";
	private static final String IAM_APIENVUSER = "apiEnvUser";
	private static final String IAM_APIINTERNALENDPOINT = "apiInternalEndPoint";
	private static final String IAM_REALM_ID = "keycloak-realm-id";
	private static final String IAM_USERS_TO_CREATE = "iam-users-to-create";
	private static final String IAM_USERS_PASSWORD = "iam-users-password";
	private static final String IAM_INSURANCEURL = "InsuranceUrl";
	private static final String AUTH_DEMO_SERVICE_PORT = "authDemoServicePort";
	private static final String AUTH_DEMO_SERVICE_BASE_URL = "authDemoServiceBaseURL";
	private static final String MOUNT_PATH = "mountPath";
	private static final String AUTHCERTS_PATH = "authCertsPath";
	private static final String MOUNT_PATH_FOR_SCENARIO = "mountPathForScenario";

	private static final String PACKET_UTILITY_BASE_URL = "packetUtilityBaseUrl";

	private static final String REPORT_EXPIRATION_IN_DAYS = "reportExpirationInDays";

	private static final String esignetErrorsUrl = "esignetErrorsUrl";

	private static final String esignetActuatorUrl = "esignetActuatorUrl";

	private static String esignet_actuator_url;
	private static String esignet_error_url;
	private static String idrepo_client_secret;
	private static String idrepo_client_id;
	private static String idrepo_app_id;

	private static String admin_client_secret;
	private static String admin_client_id;
	private static String admin_app_id;

	private static String regproc_client_secret;
	private static String regproc_client_id;
	private static String regproc_app_id;

	private static String automation_client_secret;
	private static String automation_client_id;
	private static String automation_app_id;

	private static String s3_region;
	private static String s3_host;
	private static String s3_user_key;
	private static String s3_account;
	private static String s3_secret_key;
	private static String push_reports_to_s3;
	private static String enableDebug;
	private static String threadCount;
	private static String langselect;

	private static String db_port;
	private static String db_domain;
	private static String hibernate_connection_driver_class;
	private static String hibernate_connection_pool_size;
	private static String hibernate_dialect;
	private static String hibernate_show_sql;
	private static String hibernate_current_session_context_class;

	private static String audit_db_user;
	private static String audit_db_pass;
	private static String audit_db_schema;

	private static String ida_db_user;
	private static String ida_db_pass;
	private static String ida_db_schema;

	private static String pms_db_user;
	private static String pms_db_pass;
	private static String pms_db_schema;

	private static String km_db_user;
	private static String km_db_pass;
	private static String km_db_schema;

	private static String master_db_user;
	private static String master_db_pass;
	private static String master_db_schema;

	private static String iam_insuranceurl;
	private static String iam_external_url;
	private static String iam_realm_id;
	private static String iam_users_to_create;
	private static String iam_adminportal_path;
	private static String iam_apienvuser;
	private static String iam_apiinternalendpoint;
	private static String iam_users_password;
	private static String authDemoServicePort;
	private static String authDemoServiceBaseUrl;

	private static String mountPath;
	private static String authCertsPath;
	private static String mountPathForScenario;
	private static String packetUtilityBaseUrl;
	public static Properties propsKernel;
	private static String reportExpirationInDays;
	public static void setProperty(String key, String value) {
		// Overwrite the value with only if the key exists
		if (propsKernel.containsKey(key)) {
			propsKernel.setProperty(key, value);
		}
	}

	public static String getValueForKey(String key) {
		String value = System.getenv(key) == null ? propsKernel.getProperty(key) : System.getenv(key);
		setProperty(key, value);

		return value;
	}

	public static void init() {
		// Loading Kernel property
		//LOGGER.info("file location"+TestRunner.getResourcePath() + "/config/));
		propsKernel = getproperty(UinGenerationUtil.getResourcePath() + "/config/"+ UinGenerationUtil.getKernalFilename());
		System.out.println(propsKernel);

		idrepo_client_secret = getValueForKey(MOSIP_IDREPO_CLIENT_SECRET);
		idrepo_client_id = getValueForKey(MOSIP_IDREPO_CLIENT_ID);
		idrepo_app_id = getValueForKey(MOSIP_IDREPO_APP_ID);
		admin_client_secret = getValueForKey(MOSIP_ADMIN_CLIENT_SECRET);
		admin_client_id = getValueForKey(MOSIP_ADMIN_CLIENT_ID);
		admin_app_id = getValueForKey(MOSIP_ADMIN_APP_ID);
		regproc_client_secret = getValueForKey(MOSIP_REG_CLIENT_SECRET);
		regproc_client_id = getValueForKey(MOSIP_REG_CLIENT_ID);
		regproc_app_id = getValueForKey(MOSIP_REGCLIENT_APP_ID);
		automation_client_secret = getValueForKey(MOSIP_AUTOMATION_CLIENT_SECRET);
		automation_client_id = getValueForKey(MOSIP_AUTOMATION_CLIENT_ID);
		automation_app_id = getValueForKey(MOSIP_AUTOMATION_APP_ID);
		s3_host = getValueForKey(S3_HOST);
		s3_region = getValueForKey(S3_REGION);
		s3_user_key = getValueForKey(S3_USER_KEY);
		s3_secret_key = getValueForKey(S3_SECRET_KEY);
		s3_account = getValueForKey(S3_ACCOUNT);
		iam_insuranceurl = getValueForKey(IAM_INSURANCEURL);

		iam_adminportal_path =System.getenv(IAM_ADMINPORTAL_PATH) == null
				? propsKernel.getProperty(IAM_ADMINPORTAL_PATH)
						: System.getenv(IAM_ADMINPORTAL_PATH);

		LOGGER.info("adminportal_path from config manager::" + iam_adminportal_path);
		iam_apienvuser = System.getenv(IAM_APIENVUSER) == null
				? propsKernel.getProperty(IAM_APIENVUSER)
						: System.getenv(IAM_APIENVUSER);
		LOGGER.info("apienvuser from config manager::" + iam_apienvuser);
		iam_apiinternalendpoint = System.getenv(IAM_APIINTERNALENDPOINT) == null
				? propsKernel.getProperty(IAM_APIINTERNALENDPOINT)
						: System.getenv(IAM_APIINTERNALENDPOINT);
		LOGGER.info("apiinternalendpoint from config manager::" + iam_apiinternalendpoint);
		//		push_reports_to_s3 = getValueForKey(PUSH_TO_S3);
		db_port = getValueForKey(DB_PORT);
		db_domain = getValueForKey(DB_DOMAIN);
		hibernate_connection_driver_class = getValueForKey(HIBERNATE_CONNECTION_DRIVER_CLASS);
		hibernate_connection_pool_size = getValueForKey(HIBERNATE_CONNECTION_POOL_SIZE);
		hibernate_dialect = getValueForKey(HIBERNATE_DIALECT);
		hibernate_show_sql = getValueForKey(HIBERNATE_SHOW_SQL);
		hibernate_current_session_context_class = getValueForKey(HIBERNATE_CONTEXT_CLASS);
		audit_db_user = getValueForKey(AUDIT_DB_USER);
		audit_db_pass = getValueForKey(AUDIT_DB_PASS);
		audit_db_schema = getValueForKey(AUDIT_DB_SCHEMA);
		ida_db_user = getValueForKey(IDA_DB_USER);
		ida_db_pass = getValueForKey(IDA_DB_PASS);
		ida_db_schema = getValueForKey(IDA_DB_SCHEMA);
		pms_db_user = getValueForKey(PMS_DB_USER);
		pms_db_pass = getValueForKey(PMS_DB_PASS);
		pms_db_schema = getValueForKey(PMS_DB_SCHEMA);
		km_db_user = getValueForKey(KM_DB_USER);
		km_db_pass = getValueForKey(KM_DB_PASS);
		km_db_schema = getValueForKey(KM_DB_SCHEMA);
		master_db_user = getValueForKey(MASTER_DB_USER);
		master_db_pass = getValueForKey(MASTER_DB_PASS);
		master_db_schema = getValueForKey(MASTER_DB_SCHEMA);
		iam_external_url = getValueForKey(IAM_EXTERNAL_URL);
		System.out.println("keycloakendpoint from config manager::" + iam_external_url);
		reportExpirationInDays = System.getenv(REPORT_EXPIRATION_IN_DAYS) == null
				? propsKernel.getProperty(REPORT_EXPIRATION_IN_DAYS)
						: System.getenv(REPORT_EXPIRATION_IN_DAYS);
		propsKernel.setProperty(REPORT_EXPIRATION_IN_DAYS, reportExpirationInDays);	
		iam_realm_id = getValueForKey(IAM_REALM_ID);
		iam_users_to_create = getValueForKey(IAM_USERS_TO_CREATE);
		iam_users_password = getValueForKey(IAM_USERS_PASSWORD);

		esignet_error_url = getValueForKey(esignetErrorsUrl);

		esignet_actuator_url = getValueForKey(esignetActuatorUrl);

		usePreConfiguredOtp = System.getenv(USEPRECONFIGOTP) == null ? propsKernel.getProperty(USEPRECONFIGOTP)
				: System.getenv(USEPRECONFIGOTP);
		propsKernel.setProperty(USEPRECONFIGOTP, usePreConfiguredOtp);

		preconfiguredOtp = System.getenv(PRECONFIGOTP) == null ? propsKernel.getProperty(PRECONFIGOTP)
				: System.getenv(PRECONFIGOTP);
		propsKernel.setProperty(PRECONFIGOTP, preconfiguredOtp);

		admin_client_secret = System.getenv(MOSIP_ADMIN_CLIENT_SECRET) == null
				? propsKernel.getProperty(MOSIP_ADMIN_CLIENT_SECRET)
						: System.getenv(MOSIP_ADMIN_CLIENT_SECRET);

		propsKernel.setProperty(MOSIP_ADMIN_CLIENT_SECRET, admin_client_secret);

		authDemoServicePort = System.getenv(AUTH_DEMO_SERVICE_PORT) == null
				? propsKernel.getProperty(AUTH_DEMO_SERVICE_PORT)
						: System.getenv(AUTH_DEMO_SERVICE_PORT);
		propsKernel.setProperty(AUTH_DEMO_SERVICE_PORT, authDemoServicePort);

		authDemoServiceBaseUrl = System.getenv(AUTH_DEMO_SERVICE_BASE_URL) == null
				? propsKernel.getProperty(AUTH_DEMO_SERVICE_BASE_URL)
						: System.getenv(AUTH_DEMO_SERVICE_BASE_URL);
		propsKernel.setProperty(AUTH_DEMO_SERVICE_BASE_URL, authDemoServiceBaseUrl);

		mountPath = System.getenv(MOUNT_PATH) == null ? propsKernel.getProperty(MOUNT_PATH) : System.getenv(MOUNT_PATH);
		propsKernel.setProperty(MOUNT_PATH, mountPath);

		authCertsPath = System.getenv(AUTHCERTS_PATH) == null ? propsKernel.getProperty(AUTHCERTS_PATH) : System.getenv(AUTHCERTS_PATH);
		propsKernel.setProperty(AUTHCERTS_PATH, authCertsPath);

		mountPathForScenario = System.getenv(MOUNT_PATH_FOR_SCENARIO) == null ? propsKernel.getProperty(MOUNT_PATH_FOR_SCENARIO) : System.getenv(MOUNT_PATH_FOR_SCENARIO);
		propsKernel.setProperty(MOUNT_PATH_FOR_SCENARIO, mountPathForScenario);

		packetUtilityBaseUrl = System.getenv(PACKET_UTILITY_BASE_URL) == null ? propsKernel.getProperty(PACKET_UTILITY_BASE_URL) : System.getenv(PACKET_UTILITY_BASE_URL);
		propsKernel.setProperty(PACKET_UTILITY_BASE_URL, packetUtilityBaseUrl);

		push_reports_to_s3 =System.getenv(PUSH_TO_S3) == null ? propsKernel.getProperty(PUSH_TO_S3) : System.getenv(PUSH_TO_S3);
		propsKernel.setProperty(PUSH_TO_S3, push_reports_to_s3);

		enableDebug =System.getenv(ENABLE_DEBUG) == null ? propsKernel.getProperty(ENABLE_DEBUG) : System.getenv(ENABLE_DEBUG);
		propsKernel.setProperty(ENABLE_DEBUG, enableDebug);

		threadCount =System.getenv(THREAD_COUNT) == null ? propsKernel.getProperty(THREAD_COUNT) : System.getenv(THREAD_COUNT);
		propsKernel.setProperty(THREAD_COUNT, threadCount);

		langselect =System.getenv(LANG_SELECT) == null ? propsKernel.getProperty(LANG_SELECT) : System.getenv(LANG_SELECT);
		propsKernel.setProperty(LANG_SELECT, langselect);



		//enableDebug threadCount  langselect

	}

	public static String getAuthDemoServicePort() {
		return authDemoServicePort;
	}

	public static String getAuthDemoServiceBaseUrl() {
		return authDemoServiceBaseUrl;

	}


	public static String getLangselect() {
		return langselect;

	}

	public static String getThreadCount() {
		return threadCount;

	}



	public static String getEnableDebug() {
		return enableDebug;

	}

	public static String getmountPath() {
		return mountPath;
	}

	public static String getmountPathForScenario() {
		return mountPathForScenario;
	}

	public static String getpacketUtilityBaseUrl() {
		return packetUtilityBaseUrl;
	}

	public static String getauthCertsPath() {
		return authCertsPath;
	}

	public static Properties init(String abc) {
		propsKernel = getproperty(UinGenerationUtil.getResourcePath() + "/" + "/config/Kernel.properties");

		return propsKernel;
	}


	public static String getAdminClientSecret() {
		return admin_client_secret;
	}

	public static Boolean IsDebugEnabled() {
		return enableDebug.equalsIgnoreCase("yes");
	}

	public static String getAdminClientId() {
		return admin_client_id;
	}

	public static String getAdminAppId() {
		return admin_app_id;
	}

	public static String getIdRepoClientSecret() {
		return idrepo_client_secret;
	}

	public static String getidRepoClientId() {
		return idrepo_client_id;
	}

	public static String getidRepoAppId() {
		return idrepo_app_id;
	}

	public static String getRegprocClientSecret() {
		return regproc_client_secret;
	}

	public static String getRegprocClientId() {
		return regproc_client_id;
	}

	public static String getRegprocAppId() {
		return regproc_app_id;
	}


	public static String getAutomationClientSecret() {
		return automation_client_secret;
	}

	public static String getAutomationClientId() {
		return automation_client_id;
	}

	public static String getAutomationAppId() {
		return automation_app_id;
	}

	public static String getS3Host() {
		return s3_host;
	}
	public static String getReportExpirationInDays() {
		return reportExpirationInDays;
	}

	public static String getS3Region() {
		return s3_region;
	}

	public static String getS3UserKey() {
		return s3_user_key;
	}

	public static String getS3SecretKey() {
		return s3_secret_key;
	}

	public static String getS3Account() {
		return s3_account;
	}

	public static String getPushReportsToS3() {
		return push_reports_to_s3;
	}

	public static String getIdaDbUrl() {
		return "jdbc:postgresql://" + db_domain + ":" + db_port + "/mosip_ida";
	}

	public static String getAuditDbUrl() {
		return "jdbc:postgresql://" + db_domain + ":" + db_port + "/mosip_audit";
	}

	public static String getDbDriverClass() {
		return hibernate_connection_driver_class;
	}

	public static String getDbConnectionPoolSize() {
		return hibernate_connection_pool_size;
	}

	public static String getDbDialect() {
		return hibernate_dialect;
	}

	public static String getShowSql() {
		return hibernate_show_sql;
	}
	public static String getiam_adminportal_path() {
		return iam_adminportal_path;
	}
	public static String getiam_apienvuser() {
		return iam_apienvuser;
	}
	public static String getiam_apiinternalendpoint() {
		return iam_apiinternalendpoint;
	}

	public static String getDbSessionContext() {
		return hibernate_current_session_context_class;
	}

	public static String getAuditDbUser() {
		return audit_db_user;
	}

	public static String getAuditDbPass() {
		System.out.println("DB Password from ENV::: " + System.getenv(AUDIT_DB_PASS));
		return audit_db_pass;
	}

	public static String getAuditDbSchema() {
		return audit_db_schema;
	}

	public static String getIdaDbUser() {
		return ida_db_user;
	}

	public static String getIdaDbPass() {
		return ida_db_pass;
	}

	public static String getIdaDbSchema() {
		return ida_db_schema;
	}

	public static String getPMSDbUrl() {
		return "jdbc:postgresql://" + db_domain + ":" + db_port + "/mosip_pms";
	}

	public static String getKMDbUrl() {
		return "jdbc:postgresql://" + db_domain + ":" + db_port + "/mosip_keymgr";
	}

	public static String getMASTERDbUrl() {
		return "jdbc:postgresql://" + db_domain + ":" + db_port + "/mosip_master";
	}

	public static String getPMSDbUser() {
		return pms_db_user;
	}

	public static String getPMSDbPass() {
		return pms_db_pass;
	}

	public static String getPMSDbSchema() {
		return pms_db_schema;
	}

	public static String getKMDbUser() {
		return km_db_user;
	}

	public static String getKMDbPass() {
		return km_db_pass;
	}

	public static String getKMDbSchema() {
		return km_db_schema;
	}

	public static String getMasterDbUser() {
		return master_db_user;
	}

	public static String getMasterDbPass() {
		return master_db_pass;
	}

	public static String getMasterDbSchema() {
		return master_db_schema;
	}

	public static String getiam_Insurance_path() {
		return iam_insuranceurl;
	}

	// from docker env getting only host url
	public static String getIAMUrl() {
		System.out.println("keycloak url from ENV::: " + System.getenv(IAM_EXTERNAL_URL) + "/auth");
		System.out.println("keycloak url from Property::: " + System.getProperty(IAM_EXTERNAL_URL) + "/auth");
		System.out.println("keycloak url from Config::: " + propsKernel.getProperty(IAM_EXTERNAL_URL) + "/auth");
		System.out.println("keycloak url is:::" + iam_external_url + "/auth");
		return iam_external_url + "/auth";
	}

	public static String getIAMRealmId() {
		return iam_realm_id;
	}

	public static String getIAMUsersToCreate() {
		return iam_users_to_create;
	}

	public static String getIAMUsersPassword() {
		return iam_users_password;
	}

	public static String getEsignetErrorsUrl() {
		return esignet_error_url;
	}

	public static String getEsignetActuatorUrl() {
		return esignet_actuator_url;
	}

	public static String getUsePreConfiguredOtp() {
		return usePreConfiguredOtp;
	}

	public static String getPreConfiguredOtp() {
		return preconfiguredOtp;

	}

	public static String getRolesForUser(String userId) {
		propsKernel = getproperty(UinGenerationUtil.getResourcePath() + "/" + "/config/Kernel.properties");
		return propsKernel.getProperty("roles." + userId);
	}

	private static Properties getproperty(String path) {
		Properties prop = new Properties();
		try {
			File file = new File(path);
			prop.load(new FileInputStream(file));
		} catch (IOException e) {
			LOGGER.error("Exception " + e.getMessage());
		}
		return prop;
	}

	public static String getAuthDemoServiceUrl() {
		return ConfigManager.getAuthDemoServiceBaseUrl() + ":" + ConfigManager.getAuthDemoServicePort();
	}

}