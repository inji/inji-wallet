package io.mosip.residentapp.sdkcontract

import android.content.res.AssetManager
import android.util.Xml
import org.xmlpull.v1.XmlPullParser

internal object SdkContractSuiteSelection {

    fun loadSuites(
        assetManager: AssetManager,
        suiteAssetFileName: String,
    ): Map<String, List<String>> {
        val suites = linkedMapOf<String, MutableList<String>>()
        var defaultPackage = ""
        var currentSuiteName: String? = null
        var currentSuitePackage = ""

        assetManager.open(suiteAssetFileName).use { stream ->
            val parser = Xml.newPullParser()
            parser.setFeature(XmlPullParser.FEATURE_PROCESS_NAMESPACES, false)
            parser.setInput(stream, null)

            var eventType = parser.eventType
            while (eventType != XmlPullParser.END_DOCUMENT) {
                when (eventType) {
                    XmlPullParser.START_TAG -> when (parser.name) {
                        XML_ROOT_TAG -> {
                            defaultPackage = parser.getAttributeValue(null, XML_DEFAULT_PACKAGE_ATTR).orEmpty().trim()
                        }

                        XML_SUITE_TAG -> {
                            val suiteName = parser.getAttributeValue(null, XML_NAME_ATTR).orEmpty().trim()
                            require(suiteName.isNotEmpty()) {
                                "Every <$XML_SUITE_TAG> in '$suiteAssetFileName' must have a '$XML_NAME_ATTR' attribute."
                            }
                            require(!suites.containsKey(suiteName)) {
                                "Duplicate suite '$suiteName' in '$suiteAssetFileName'."
                            }
                            currentSuiteName = suiteName
                            currentSuitePackage = parser.getAttributeValue(null, XML_PACKAGE_ATTR).orEmpty().trim()
                                .ifBlank { defaultPackage }
                            suites[suiteName] = mutableListOf()
                        }

                        XML_CLASS_TAG -> {
                            val suiteName = currentSuiteName
                                ?: error("<$XML_CLASS_TAG> found outside of a <$XML_SUITE_TAG> in '$suiteAssetFileName'.")
                            val rawClassName = parser.getAttributeValue(null, XML_NAME_ATTR).orEmpty().trim()
                            require(rawClassName.isNotEmpty()) {
                                "<$XML_CLASS_TAG> inside suite '$suiteName' is missing '$XML_NAME_ATTR'."
                            }
                            suites.getValue(suiteName)
                                .add(resolveClassName(rawClassName, currentSuitePackage, suiteName))
                        }
                    }

                    XmlPullParser.END_TAG -> if (parser.name == XML_SUITE_TAG) {
                        currentSuiteName = null
                    }
                }
                eventType = parser.next()
            }
        }

        require(suites.isNotEmpty()) { "No <$XML_SUITE_TAG> entries found in '$suiteAssetFileName'." }
        return suites
    }

    fun resolveSuiteSelection(
        assetManager: AssetManager,
        suiteAssetFileName: String,
        suiteSelection: String,
    ): List<String> {
        val selectedSuiteNames = suiteSelection.split(",")
            .map { it.trim() }
            .filter { it.isNotBlank() }
            .distinct()
        require(selectedSuiteNames.isNotEmpty()) { "Instrumentation argument 'suite' is empty." }

        val suiteDefinitions = loadSuites(assetManager, suiteAssetFileName)
        val selectedClasses = linkedSetOf<String>()
        selectedSuiteNames.forEach { suiteName ->
            val classes = suiteDefinitions[suiteName]
                ?: throw IllegalArgumentException(
                    "Unknown suite '$suiteName'. Available suites: ${suiteDefinitions.keys.joinToString(", ")}"
                )
                require(classes.isNotEmpty()) { "Suite '$suiteName' in '$suiteAssetFileName' has no classes." }
            selectedClasses.addAll(classes)
        }

        require(selectedClasses.isNotEmpty()) { "No classes resolved for suite selection: $selectedSuiteNames" }
        return selectedClasses.toList()
    }

    private fun resolveClassName(rawClassName: String, suitePackage: String, suiteName: String): String {
        if (rawClassName.contains(".")) {
            return rawClassName
        }
        require(suitePackage.isNotBlank()) {
            "Class '$rawClassName' in suite '$suiteName' is not fully qualified and no default/suite package is defined."
        }
        return "$suitePackage.$rawClassName"
    }

    private const val XML_ROOT_TAG = "instrumentation-suites"
    private const val XML_SUITE_TAG = "suite"
    private const val XML_CLASS_TAG = "class"
    private const val XML_NAME_ATTR = "name"
    private const val XML_DEFAULT_PACKAGE_ATTR = "default-package"
    private const val XML_PACKAGE_ATTR = "package"
}
