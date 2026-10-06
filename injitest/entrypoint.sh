#!/bin/bash

# Run JAR with system properties before -jar
java -Dmodules="$MODULES" \
     -Denv.user="$ENV_USER" \
     -Denv.endpoint="$ENV_ENDPOINT" \
     -Denv.testLevel="$ENV_TESTLEVEL" \
     -DtestngXmlFile="$ENV_TESTNG_XML_FILE" \
     -Dbrowserstack.config="$ENV_BROWSERSTACK_CONFIG" \
     -jar uitest-inji-wallet-*.jar
