# Inji Wallet Mobile Automation

This repository contains the Appium-based mobile UI automation suite for the Inji Wallet application. It supports Android and iOS test execution, uses TestNG for suite orchestration, and can run either against BrowserStack or against a local Appium server.

## Project layout

- `src/main/java`: test cases, page objects, driver setup, listeners, runner
- `src/main/resources/config/injiWallet.properties`: main framework configuration
- `src/main/resources/DesiredCapabilities.json`: local Appium capabilities
- `src/main/resources/Uins.json`, `Vids.json`, `AidData.json`: reusable test data pools
- `testNgXmlFiles`: sanity, regression, prerequisite, and full-suite XML files
- `androidConfig.yml`, `iosConfig.yml`: BrowserStack SDK config files
- `Dockerfile`, `entrypoint.sh`: container execution path used in Rancher/containerized runs

## How execution works

The suite is started through `inji.runner.InjiTestRunner`.

- For BrowserStack runs, the framework reads BrowserStack values from `src/main/resources/config/injiWallet.properties`.
- For local runs without BrowserStack, the framework connects to a local Appium server at `http://127.0.0.1:4723/wd/hub` and reads capabilities from `src/main/resources/DesiredCapabilities.json`.
- The suite to execute is selected through the JVM property `testngXmlFile`, for example `androidSanity.xml` or `iosRegression.xml`.

## Prerequisites

### Common

1. JDK 21
2. Maven 3.9+
3. Appium 2.x
4. Node.js and npm, if Appium is not already installed
5. The required mobile app build
6. Access to the target MOSIP/Inji environment

### For Android local execution

1. Android Studio / Android SDK
2. At least one connected Android device or emulator
3. `adb` available in `PATH`
4. Appium driver for Android (`uiautomator2`)

### For iOS local execution

1. macOS
2. Xcode and command line tools
3. An iOS simulator or real iPhone
4. Appium driver for iOS (`xcuitest`)

Note: local iOS execution is not practical on Windows. BrowserStack is the normal option when running iOS from Windows.

## Test suites

Available suite XML files under `testNgXmlFiles`:

- `androidSanity.xml`
- `androidRegression.xml`
- `iosSanity.xml`
- `iosRegression.xml`
- `androidTestSuite.xml`
- `iosTestSuite.xml`
- `injiWalletPreRequisiteSuite.xml`
- `injiWalletPostRequisiteSuite.xml`

Recommended usage:

- Use `androidSanity.xml` / `iosSanity.xml` for quick validation.
- Use `androidRegression.xml` / `iosRegression.xml` for end-to-end execution with prerequisite and post-requisite flows.

## Required configuration

### 1. JVM/system properties required at runtime

These are used in IDE run configurations and in the container entrypoint:

- `-Dmodules=injiWallet`
- `-Denv.user=<environment-user>`
- `-Denv.endpoint=<api-base-url>`
- `-Denv.testLevel=smokeAndRegression`
- `-DtestngXmlFile=<suite-xml-name>`

Optional:

- `-Dbrowserstack.config=androidConfig.yml`
- `-Dbrowserstack.config=iosConfig.yml`

## 2. Main framework config: `src/main/resources/config/injiWallet.properties`

Update this file before execution.

### Mandatory for every run

- `browserstack_platformName`
  Used by the framework to select Android vs iOS listeners and known-issue files.
- `thread_count`
  Controls TestNG thread count at runtime.
- `mockNotificationChannel`
  Expected values include `email`, `phone`, or `email,phone`.
- `enableDebug`
  Framework debug logging toggle.

### Mandatory for BrowserStack runs

- `browserstack_run=true`
- `browserstack_username`
- `browserstack_accesskey`
- `browserstack_appId`
- `browserstack_platformName`
- `browserstack_deviceName`
- `browserstack_platformVersion`
- `browserstack_buildName`
- `browserstack_idleTimeout`

### Mandatory for local Appium runs

- `browserstack_run=false`
- `browserstack_platformName`

### Environment and backend access

These values must point to the environment you want to test:

- `keycloak-external-url`
- `audit_url`
- `partner_url`
- `db-server`
- `mosip_components_base_urls`

### Secrets and client credentials

These must be valid for the selected environment:

- `keycloak_Password`
- `audit_password`
- `partner_password`
- `postgres-password`
- `mosip_partner_client_secret`
- `mosip_pms_client_secret`
- `mosip_resident_client_secret`
- `mosip_idrepo_client_secret`
- `mosip_reg_client_secret`
- `mosip_admin_client_secret`
- `mosip_hotlist_client_secret`
- `mosip_regproc_client_secret`
- `mpartner_default_mobile_secret`
- `mosip_testrig_client_secret`
- `AuthClientSecret`

### Test data related values

Keep these aligned with the environment and test data available:

- `landregistry_uin`
- `svgwithface_uin`
- `svgwithoutface_uin`
- `testcases_toRun`

Note: `testcases_toRun` is optional. If populated, it filters execution to specific methods or `ClassName.methodName` values.

## 3. BrowserStack SDK config

If you run with BrowserStack SDK style commands, update the matching file:

- `androidConfig.yml`
- `iosConfig.yml`

Required values:

- `userName`
- `accessKey`
- `app`
- `platforms`
- `projectName`
- `buildName`

Important: the framework itself still reads BrowserStack credentials, device, platform, and app id from `src/main/resources/config/injiWallet.properties`. Keep both the YAML and `injiWallet.properties` consistent.

## 4. Local device capabilities

For local runs without BrowserStack, update `src/main/resources/DesiredCapabilities.json`.

### Android local

Update the `androidDevice` capability block with the device and app details you actually use, for example:

- `platformName`
- `appium:automationName`
- `appium:udid` if required
- `appium:deviceName`
- `appium:appPackage`
- `appium:appActivity`
- `appium:noReset`

### iOS local

Update the `iosDevice` capability block with valid iOS/XCUITest capabilities for your setup.

Typical values are:

- `platformName`
- `appium:automationName`
- `appium:platformVersion`
- `appium:deviceName`
- `appium:udid` or `appium:app`
- `appium:bundleId`

Note: the current `iosDevice` block in the repository is only a placeholder and should be corrected for a real local iOS run.

## 5. Test data files

Review and update these files based on the environment and test identities you want to use:

- `src/main/resources/Uins.json`
- `src/main/resources/Vids.json`
- `src/main/resources/AidData.json`
- `src/main/resources/Emails.json`
- `src/main/resources/EmailsDenyPermission.json`
- `src/main/resources/NoBackupEmails.json`

Also review `src/main/java/inji/utils/TestDataReader.java` if hardcoded values such as name, DOB, id type, email, or phone number need to change.

## 6. Root `application.properties`

The root-level `application.properties` is used for the mock SBI/biometric support files and ports bundled with this project. Update it only if your biometric mock setup, ports, certificates, or resource paths differ.

## Execution without BrowserStack

Use this mode when you want to run against a local Appium server and a locally connected device/emulator/simulator.

### One-time setup

1. Start Appium on `127.0.0.1:4723`
2. Connect the device or start the emulator/simulator
3. Set `browserstack_run=false` in `src/main/resources/config/injiWallet.properties`
4. Set `browserstack_platformName=android` or `ios`
5. Update `src/main/resources/DesiredCapabilities.json`

### IntelliJ IDEA

1. Import the project as a Maven project.
2. Create an `Application` run configuration.
3. Set main class to `inji.runner.InjiTestRunner`.
4. Use VM options similar to:

```text
-Dmodules=injiWallet -Denv.user=<env-user> -Denv.endpoint=<env-endpoint> -Denv.testLevel=smokeAndRegression -DtestngXmlFile=androidSanity.xml -Xmx2G
```

Examples:

- Android sanity: `-DtestngXmlFile=androidSanity.xml`
- Android regression: `-DtestngXmlFile=androidRegression.xml`
- iOS sanity: `-DtestngXmlFile=iosSanity.xml`
- iOS regression: `-DtestngXmlFile=iosRegression.xml`

### Eclipse

1. Import the project as an existing Maven project.
2. Open `src/main/java/inji/runner/InjiTestRunner.java`.
3. Create a `Run As > Java Application` configuration.
4. In `Arguments > VM arguments`, use:

```text
-Dmodules=injiWallet -Denv.user=<env-user> -Denv.endpoint=<env-endpoint> -Denv.testLevel=smokeAndRegression -DtestngXmlFile=androidSanity.xml -Xmx2G
```

5. Run the required suite by changing `testngXmlFile`.

## Execution with BrowserStack

Use this mode when the device should be provisioned by BrowserStack.

### One-time setup

1. Create a BrowserStack account.
2. Upload the app to BrowserStack and copy the returned `bs://...` app id.
3. Set `browserstack_run=true` in `src/main/resources/config/injiWallet.properties`.
4. Update BrowserStack values in:
   - `src/main/resources/config/injiWallet.properties`
   - `androidConfig.yml` or `iosConfig.yml`

### IntelliJ IDEA

Use the same `Application` run configuration with `inji.runner.InjiTestRunner`, but include the BrowserStack config argument when needed:

```text
-Dmodules=injiWallet -Denv.user=<env-user> -Denv.endpoint=<env-endpoint> -Denv.testLevel=smokeAndRegression -DtestngXmlFile=androidRegression.xml -Dbrowserstack.config=androidConfig.yml -Xmx2G
```

For iOS:

```text
-Dmodules=injiWallet -Denv.user=<env-user> -Denv.endpoint=<env-endpoint> -Denv.testLevel=smokeAndRegression -DtestngXmlFile=iosRegression.xml -Dbrowserstack.config=iosConfig.yml -Xmx2G
```

### Eclipse

Use the same Java Application flow and add the BrowserStack config in VM arguments:

```text
-Dmodules=injiWallet -Denv.user=<env-user> -Denv.endpoint=<env-endpoint> -Denv.testLevel=smokeAndRegression -DtestngXmlFile=androidSanity.xml -Dbrowserstack.config=androidConfig.yml -Xmx2G
```

### Maven commands typically used with BrowserStack

Android:

```bash
mvn clean test -DtestngXmlFile=androidSanity.xml -Dbrowserstack.config=androidConfig.yml
mvn clean test -DtestngXmlFile=androidRegression.xml -Dbrowserstack.config=androidConfig.yml
```

iOS:

```bash
mvn clean test -DtestngXmlFile=iosSanity.xml -Dbrowserstack.config=iosConfig.yml
mvn clean test -DtestngXmlFile=iosRegression.xml -Dbrowserstack.config=iosConfig.yml
```

## Rancher / container execution

The container flow is defined by `Dockerfile` and `entrypoint.sh`.

At container startup, these environment variables are consumed:

- `MODULES`
- `ENV_USER`
- `ENV_ENDPOINT`
- `ENV_TESTLEVEL`
- `ENV_TESTNG_XML_FILE`
- `ENV_BROWSERSTACK_CONFIG`

The entrypoint runs:

```bash
java -Dmodules="$MODULES" -Denv.user="$ENV_USER" -Denv.endpoint="$ENV_ENDPOINT" -Denv.testLevel="$ENV_TESTLEVEL" -DtestngXmlFile="$ENV_TESTNG_XML_FILE" -Dbrowserstack.config="$ENV_BROWSERSTACK_CONFIG" -jar uitest-inji-wallet-*.jar
```

### Important limitation in Rancher

This image does not start a local Appium server and does not bundle Android/iOS simulators. In practice, Rancher deployment is suitable only for BrowserStack-based execution with the current codebase.

### Typical Rancher values

- `MODULES=injiWallet`
- `ENV_USER=<env-user>`
- `ENV_ENDPOINT=<env-endpoint>`
- `ENV_TESTLEVEL=smokeAndRegression`
- `ENV_TESTNG_XML_FILE=androidRegression.xml` or `iosRegression.xml`
- `ENV_BROWSERSTACK_CONFIG=androidConfig.yml` or `iosConfig.yml`

Also make sure `src/main/resources/config/injiWallet.properties` inside the built artifact contains:

- `browserstack_run=true`
- valid BrowserStack credentials
- valid BrowserStack app id
- correct platform/device/version values

## Reports

After execution, reports are generated under:

- `test-output`
- `testng-report`

The Extent report is renamed at suite completion to a file similar to:

```text
InjiMobileUi-<platform>-<env>-<timestamp>-T-<total>_P-<passed>_S-<skipped>_F-<failed>_KI-<known-issues>.html
```

## Recommended checklist before running

1. Set the correct target environment in `injiWallet.properties`.
2. Replace any stale or environment-specific secrets and client credentials.
3. Update `browserstack_run` based on the execution mode.
4. For BrowserStack, keep `injiWallet.properties` and `androidConfig.yml` / `iosConfig.yml` aligned.
5. For local execution, update `DesiredCapabilities.json` and start Appium first.
6. Ensure `Uins.json`, `Vids.json`, `AidData.json`, and email test data are valid for the target environment.
