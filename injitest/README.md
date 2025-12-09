# Inji Automation - Mobile Automation Framework using Appium

## Overview

Inji Automation is a mobile automation framework designed for iOS and Android platforms. It automates both positive and negative scenarios to ensure comprehensive testing of mobile applications.

## Installation

To set up Appium for use with this framework, please follow the installation instructions provided in the [Appium documentation](https://appium.io/docs/en/2.2/quickstart/install/).

## Pre-requisites
Ensure the following software is installed on the machine from where the automation tests will be executed:

1. The project requires JDK 21

## Configurations

1. update `resourec/uin.json`,`resourec/Vid.json`,`resourec/aid.json` file as per the uin and vids being used.
2. Update utils/TestDataReader to include updates for FullName, uin, idType, gender, phoneNumber, dateOfBirth, and externalEmail as they are used during creation.

## BrowserStack
1. singup to browserStack & get the userName and accessKey from home page on browserStack.
2. Upload app on browserStack it will return 'bs://<app-id>', update the same appid in iosConfig.yml/androidconfig.yml.
2. update the userName and accessKey from iosConfig.yml/androidconfig.yml.
3. update the device from tag platforms from https://www.browserstack.com/list-of-browsers-and-platforms/automate (Windows, Mac).
4. Open command prompt and change directory by using command 'cd ../injitest'.
5. Hit the command mvn clean test -DtestngXmlFile=androidSanity.xml -Dbrowserstack.config="androidConfig.yml", for running the sanity for android.
6. Hit the command mvn clean test -DtestngXmlFile=iosSanity.xml -Dbrowserstack.config="iosConfig.yml", for running the sanity for ios.
7. Hit the command mvn clean test -DtestngXmlFile=iosRegression.xml -Dbrowserstack.config="iosConfig.yml", for running the regression for ios.
8. Hit the command mvn clean test -DtestngXmlFile=androidRegression.xml -Dbrowserstack.config="androidConfig.yml", for running the Regression for android.

## Reports

Test reports will be available in the `test-output>>emailableReports` directory after test execution.
