package inji.utils;

import inji.pages.CredentialRegistryPage;
import inji.pages.HomePage;
import inji.pages.SettingsPage;

public class CredentialRegistryUpdater {

  public static void updateCredentialRegistryIfEnabled(HomePage homePage) {
    String enabled = InjiWalletConfigManager.getproperty("credential_registry_update_enabled");
    if (enabled == null || !Boolean.parseBoolean(enabled)) {
      return;
    }

    String registryUrl = InjiWalletConfigManager.getproperty("issuer_client_registry_value");
    String esignetHostUrl = InjiWalletConfigManager.getproperty("esignet_host_url");

    if (registryUrl == null || registryUrl.trim().isEmpty()) {
      throw new IllegalStateException("issuer_client_registry_value is required");
    }
    if (esignetHostUrl == null || esignetHostUrl.trim().isEmpty()) {
      throw new IllegalStateException("esignet_host_url is required");
    }

    SettingsPage settingsPage = homePage.clickOnSettingIcon();
    CredentialRegistryPage credentialRegistryPage = settingsPage.clickOnCredentialRegistry();

    credentialRegistryPage
      .setCredentialRegistryValue(registryUrl)
      .setEsignetHostUrl(esignetHostUrl);

    credentialRegistryPage.hideKeyboardIos();
    credentialRegistryPage.clickOnSaveButton();
  }
}
