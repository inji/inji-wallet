package inji.utils;

import io.restassured.RestAssured;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;

import java.io.IOException;

public class UpdateNetworkSettings {


    public UpdateNetworkSettings() throws IOException {
    }

    public static void setNoNetworkProfile(String sessionID) {
        String baseURL = "https://api-cloud.browserstack.com";
        String endpoint = "/app-automate/sessions/" + sessionID + "/update_network.json";
        String accessKey = InjiWalletConfigManager.getproperty("browserstack_accesskey");
        String userName = InjiWalletConfigManager.getproperty("browserstack_username");
        String networkSettingsJson = "{\"networkProfile\":\"no-network\"}";
        RequestSpecification requestSpec = RestAssured.given()
                .auth().basic(userName, accessKey)
                .header("Content-Type", "application/json")
                .body(networkSettingsJson);
        Response response = requestSpec.put(baseURL + endpoint);
    }

    public static void resetNetworkProfile(String sessionID) {
        String baseURL = "https://api-cloud.browserstack.com";
        String endpoint = "/app-automate/sessions/" + sessionID + "/update_network.json";

        String accessKey = InjiWalletConfigManager.getproperty("browserstack_accesskey");
        String userName = InjiWalletConfigManager.getproperty("browserstack_username");
        String networkSettingsJson = "{\"networkProfile\":\"reset\"}";

        RequestSpecification requestSpec = RestAssured.given()
                .auth().basic(userName, accessKey)
                .header("Content-Type", "application/json")
                .body(networkSettingsJson);

        Response response = requestSpec.put(baseURL + endpoint);
    }

    public static void set2gNetworkProfile(String sessionID) {
        String baseURL = "https://api-cloud.browserstack.com";
        String endpoint = "/app-automate/sessions/" + sessionID + "/update_network.json";
        String accessKey = InjiWalletConfigManager.getproperty("browserstack_accesskey");
        String userName = InjiWalletConfigManager.getproperty("browserstack_username");
        String networkSettingsJson = "{\"networkProfile\":\"2g-gprs-good\"}";
        RequestSpecification requestSpec = RestAssured.given()
                .auth().basic(userName, accessKey)
                .header("Content-Type", "application/json")
                .body(networkSettingsJson);
        Response response = requestSpec.put(baseURL + endpoint);
    }

}
