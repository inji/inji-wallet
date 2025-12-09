package inji.utils;

import inji.runner.MosipTestRunner;
import io.mosip.testrig.apirig.utils.ConfigManager;
import org.apache.log4j.Level;
import org.apache.log4j.Logger;

import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

public class InjiWalletConfigManager extends ConfigManager {
    private static final Logger LOGGER = Logger.getLogger(InjiWalletConfigManager.class);

    public static void init() {
        Logger configManagerLogger = Logger.getLogger(ConfigManager.class);
        configManagerLogger.setLevel(Level.WARN);

        Map<String, Object> moduleSpecificPropertiesMap = new HashMap<>();
        // Load scope specific properties
        try {
            String path = MosipTestRunner.getGlobalResourcePath() + "/config/injiWallet.properties";
            Properties props = getproperties(path);
            // Convert Properties to Map and add to moduleSpecificPropertiesMap
            for (String key : props.stringPropertyNames()) {
                moduleSpecificPropertiesMap.put(key, props.getProperty(key));
            }
        } catch (Exception e) {
            LOGGER.error(e.getMessage());
        }
        // Add module specific properties as well.
        init(moduleSpecificPropertiesMap);
    }

    public static String getSunbirdBaseURL() {
        return InjiWalletUtil.getValueFromMimotoActuator("overrides", "mosip.sunbird.url");
    }
}
