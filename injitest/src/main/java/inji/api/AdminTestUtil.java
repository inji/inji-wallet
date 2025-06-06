package inji.api;

import io.restassured.response.Response;
import org.apache.commons.lang.RandomStringUtils;
import org.apache.log4j.Logger;
import org.json.JSONArray;
import org.json.JSONObject;

import javax.ws.rs.core.MediaType;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.time.format.DateTimeFormatter;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.TimeZone;
import java.time.LocalDate;


public class AdminTestUtil extends BaseTestCase {

	private static final Logger logger = Logger.getLogger(AdminTestUtil.class);
	public static String token;
	public static final int OTP_CHECK_INTERVAL = 10000;
	public static String tokenRoleIdRepo = "idrepo";
	public static String tokenRoleAdmin = "admin";
	public static boolean initialized = false;
	public static String generateInsurance = "";
	public static  String policyNumber = "";
	public static String fullName = "";
	public static String insuranceId = "";

	public static String getUnUsedUIN(String role){

		return JsonPrecondtion
				.getValueFromJson(
						RestClient.getRequestWithCookie(ApplnURI + "/v1/idgenerator/uin", MediaType.APPLICATION_JSON,
								MediaType.APPLICATION_JSON, COOKIENAME,
								new KernelAuthentication().getTokenByRole(role)).asString(),
						"response.uin");
	}

	public static String getMasterDataSchema(String role){
		String url = ApplnURI + props.getProperty("masterSchemaURL");
		kernelAuthLib = new KernelAuthentication();
		String token = kernelAuthLib.getTokenByRole("admin");

		Response response = RestClient.getRequestWithCookie(url, MediaType.APPLICATION_JSON, MediaType.APPLICATION_JSON,
				"Authorization", token);

		return response.asString();
	}

	public static String generateCurrentUTCTimeStamp() {
		Date date = new Date();
		SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
		dateFormat.setTimeZone(TimeZone.getTimeZone("UTC"));
		return dateFormat.format(date);
	}

	public static boolean activateUIN(String inputJson, String role) {
		Response response = null;

		token = kernelAuthLib.getTokenByRole(role);
		response = RestClient.postRequestWithCookie(ApplnURI + props.getProperty("addIdentityURL"), inputJson, MediaType.APPLICATION_JSON,
				MediaType.APPLICATION_JSON, COOKIENAME, token);
		JSONObject responseJson = new JSONObject(response.asString());


		System.out.println("responseJson = " + responseJson);

		return responseJson.getJSONObject("response").getString("status").equalsIgnoreCase("ACTIVATED");
	}

	public static String buildaddIdentityRequestBody(String schemaJson, String uin, String rid) {
		JSONObject schemaresponseJson = new JSONObject(schemaJson);

		JSONObject schemaData = (JSONObject) schemaresponseJson.get("response");
		Double schemaVersion = (Double) schemaData.get("idVersion");
		String schemaJsonData = schemaData.getString("schemaJson");
		String schemaFile = schemaJsonData;

		JSONObject schemaFileJson = new JSONObject(schemaFile); // jObj
		JSONObject schemaPropsJson = schemaFileJson.getJSONObject("properties"); // objIDJson4
		JSONObject schemaIdentityJson = schemaPropsJson.getJSONObject("identity"); // objIDJson
		JSONObject identityPropsJson = schemaIdentityJson.getJSONObject("properties"); // objIDJson2
		JSONArray requiredPropsArray = schemaIdentityJson.getJSONArray("required"); // objIDJson1
		System.out.println("requiredPropsArray = " + requiredPropsArray);

		JSONObject requestJson = new JSONObject();

		requestJson.put("id", propsMap.getProperty("id"));
		requestJson.put("request", new HashMap<>());
		requestJson.getJSONObject("request").put("registrationId", rid);
		JSONObject identityJson = new JSONObject();
		identityJson.put("UIN", uin);

		for (int i = 0, size = requiredPropsArray.length(); i < size; i++) {
			String eachRequiredProp = requiredPropsArray.getString(i); // objIDJson3

			JSONObject eachPropDataJson = (JSONObject) identityPropsJson.get(eachRequiredProp); // rc1

			if (eachPropDataJson.has("$ref") && eachPropDataJson.get("$ref").toString().contains("simpleType")) {

				JSONArray eachPropDataArray = new JSONArray(); // jArray

				for (int j = 0; j < BaseTestCase.getLanguageList().size(); j++) {
					JSONObject eachValueJson = new JSONObject(); // studentJSON
					eachValueJson.put("language", BaseTestCase.getLanguageList().get(j));
					eachValueJson.put("value", propsMap.getProperty(eachRequiredProp) + BaseTestCase.getLanguageList().get(j));
					eachPropDataArray.put(eachValueJson);
				}
				identityJson.put(eachRequiredProp, eachPropDataArray);
			}
			else {
				if (eachRequiredProp.equals("proofOfIdentity")) {
					identityJson.put(eachRequiredProp, new HashMap<>());
					identityJson.getJSONObject(eachRequiredProp).put("format", "txt");
					identityJson.getJSONObject(eachRequiredProp).put("type", "DOC001");
					identityJson.getJSONObject(eachRequiredProp).put("value", "fileReferenceID");
				}
				else if (eachRequiredProp.equals("individualBiometrics")) {
					identityJson.put(eachRequiredProp, new HashMap<>());
					identityJson.getJSONObject(eachRequiredProp).put("format", "cbeff");
					identityJson.getJSONObject(eachRequiredProp).put("version", 1);
					identityJson.getJSONObject(eachRequiredProp).put("value", "fileReferenceID");
				}

				else if (eachRequiredProp.equals("IDSchemaVersion")) {
					identityJson.put(eachRequiredProp, schemaVersion);
				}

				else {
					identityJson.put(eachRequiredProp, propsMap.getProperty(eachRequiredProp));
					if (eachRequiredProp.equals("email")) {
						uinEmail = propsMap.getProperty(eachRequiredProp);
					}
					if (eachRequiredProp.equals("phone")) {
						uinPhone = propsMap.getProperty(eachRequiredProp);
					}
				}
			}
		}

		JSONArray requestDocArray = new JSONArray();
		JSONObject docJson = new JSONObject();
		docJson.put("value", propsBio.getProperty("BioValue"));
		docJson.put("category", "individualBiometrics");
		requestDocArray.put(docJson);

		requestJson.getJSONObject("request").put("documents", requestDocArray);
		requestJson.getJSONObject("request").put("identity", identityJson);
		requestJson.put("requesttime", generateCurrentUTCTimeStamp());
		requestJson.put("version", "v1");

		System.out.println(requestJson);
		return requestJson.toString();
	}

	private static String otpExpTime = "";
	public static int getOtpExpTimeFromActuator() {
		if (otpExpTime.isEmpty()) {
			String section = "/mosip-config/application-default.properties";
			if (!BaseTestCase.isTargetEnvLTS())
				section = "/mosip-config/sandbox/application-lts.properties";
			Response response = null;
			JSONObject responseJson = null;
			JSONArray responseArray = null;
			String url = ApplnURI + propsKernel.getProperty("actuatorIDAEndpoint");
			try {
				response = RestClient.getRequest(url, MediaType.APPLICATION_JSON, MediaType.APPLICATION_JSON);

				responseJson = new JSONObject(response.getBody().asString());
				responseArray = responseJson.getJSONArray("propertySources");

				for (int i = 0, size = responseArray.length(); i < size; i++) {
					JSONObject eachJson = responseArray.getJSONObject(i);
					System.out.println("eachJson is :" +eachJson.toString());
					logger.info("eachJson is :" + eachJson.toString());
					if (eachJson.get("name").toString().contains(section)) {

						JSONObject otpExpiryTime = (JSONObject) eachJson
								.getJSONObject(GlobalConstants.PROPERTIES).get("mosip.kernel.otp.expiry-time");
						otpExpTime = otpExpiryTime.getString(GlobalConstants.VALUE);
//						if (ConfigManager.IsDebugEnabled())
//							logger.info("Actuator: " +url +" otpExpTime: "+otpExpTime);
						break;
					}
				}
			} catch (Exception e) {
				logger.error(GlobalConstants.EXCEPTION_STRING_2 + e);
			}
		}
		return Integer.parseInt(otpExpTime);
	}


	public static String generateUIN() {
		String uin = "";

		initialize();

		DateFormat dateFormatter = new SimpleDateFormat("YYYYMMddHHmmss");
		Calendar cal = Calendar.getInstance();
		String timestampValue = dateFormatter.format(cal.getTime());
		String rid = "27847" + RandomStringUtils.randomNumeric(10) + timestampValue;

		// Make Unused UIN Api call to get the UIN Number
		uin = AdminTestUtil.getUnUsedUIN(tokenRoleIdRepo);

		// Call Masterdata Schema API To get the Schema Data Of the Env
		String responseString = AdminTestUtil.getMasterDataSchema(tokenRoleAdmin);

		// Build request body for add identity API
		String requestjson = AdminTestUtil.buildaddIdentityRequestBody(responseString, uin, rid);


		// Make Add Identity API Call and activate the UIN
		if (!AdminTestUtil.activateUIN(requestjson, tokenRoleIdRepo)) {
			// UIN activation failed
			return "";
		}

		return uin;
	}


	public static String generateVID(String uin, String vidType) {
		if (uin.isEmpty() || vidType.isEmpty()) {
			return "";
		}

		initialize();
		Response response = null;

		String token = BaseTestCase.kernelAuthLib.getTokenByRole(tokenRoleIdRepo);
		JSONObject requestJson = new JSONObject();

		requestJson.put("id", "mosip.vid.create");
		requestJson.put("metadata", new HashMap<>());
		requestJson.put("requesttime", AdminTestUtil.generateCurrentUTCTimeStamp());
		requestJson.put("version", "v1");
		requestJson.put("request", new HashMap<>());
		requestJson.getJSONObject("request").put("UIN", uin);
		requestJson.getJSONObject("request").put("vidType", vidType);

		response = RestClient.postRequestWithCookie(BaseTestCase.ApplnURI + BaseTestCase.props.getProperty("idRepoGenVidURL"), requestJson.toString(), MediaType.APPLICATION_JSON,
				MediaType.APPLICATION_JSON, BaseTestCase.COOKIENAME, token);
		JSONObject responseJson = new JSONObject(response.asString());


		System.out.println("responseJson = " + responseJson);

		if (responseJson.getJSONObject("response").getString("vidStatus").equalsIgnoreCase("ACTIVE")) {
			return responseJson.getJSONObject("response").getString("VID");
		}

		return "";
	}

	public static String generateInsurance() {

		if (!insuranceId.isEmpty()) {
			return insuranceId;
		}

		Response response = null;
		JSONArray benefitsArray = new JSONArray();
		JSONObject requestJson = new JSONObject();
		String currentDate = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE);

		requestJson.put("policyNumber", "1207205246");
		requestJson.put("policyName", "automationtest4");
		requestJson.put("policyExpiresOn", "2033-04-20T20:48:17.684Z");
		requestJson.put("policyIssuedOn", "2023-04-20T20:48:17.684Z");
		requestJson.put("fullName", "automationtest4");
		requestJson.put("dob", currentDate);

		benefitsArray.put("Critical Surgery");
		benefitsArray.put("Full body checkup");

		requestJson.put("benefits", benefitsArray);
		requestJson.put("gender", "Male");
		requestJson.put("mobile", "0123456789");
		requestJson.put("email", "abcd@gmail.com");

		// Trigger the API call only once
		response = RestClient.postRequestWithCookie(insuranceUrl, requestJson.toString(), MediaType.APPLICATION_JSON,
				MediaType.APPLICATION_JSON, BaseTestCase.COOKIENAME, token);
		JSONObject responseJson = new JSONObject(response.asString());

		System.out.println("responseJson = " + responseJson);

		if (responseJson.getJSONObject("params").getString("status").equalsIgnoreCase("SUCCESSFUL")) {
			// Set values to the static variables once the API returns a successful response
			insuranceId = responseJson.getJSONObject("result").getJSONObject("Insurance").getString("osid");
			policyNumber = requestJson.getString("policyNumber");
			fullName = requestJson.getString("fullName");

			return insuranceId;
		}

		return "";
	}




	public static String deleteInsurance() {

		Response response = null;
		JSONArray benefitsArray = new JSONArray();
		JSONObject requestJson = new JSONObject();

		response = RestClient.deleteRequestWithParam(insuranceUrl+"/"+insuranceId, "insuranceid",insuranceId,MediaType.APPLICATION_JSON,
				MediaType.APPLICATION_JSON, BaseTestCase.COOKIENAME, token);
		JSONObject responseJson = new JSONObject(response.asString());


		System.out.println("responseJson = " + responseJson);

		if (responseJson.getJSONObject("params").getString("status").equalsIgnoreCase("SUCCESSFUL")) {

		}

		return "";
	}
	public static void initialize() {
		if (!initialized) {
			ConfigManager.init();
			BaseTestCase.initialize();

			// Generate Keycloak Users
			KeycloakUserManager.createUsers();
			initialized = true;
		}
	}

}