package io.mosip.residentapp.sdkcontract

import android.os.Bundle
import android.util.Log
import androidx.test.runner.AndroidJUnitRunner

/**
 * Supported instrumentation arguments:
 *  -e class=<FQCN[#method][,...]>  Standard AndroidX selection; wins if set.
 *  -e suite=<name[,name...]>       Suite(s) to run, defined in the suite file.
 *  -e suiteFile=<assetPath>        Overrides the default suite file location.
 */
class SdkContractInstrumentationRunner : AndroidJUnitRunner() {

    override fun onCreate(arguments: Bundle) {
        val args = Bundle(arguments)
        val explicitClassSelection = args.getString(ARG_CLASS).orEmpty().trim()

        if (explicitClassSelection.isBlank()) {
            val resolved = resolveSelection(args)
            if (resolved.isNotEmpty()) {
                val classArgument = resolved.joinToString(",")
                args.putString(ARG_CLASS, classArgument)
                Log.i(TAG, "Resolved instrumentation selection: $ARG_CLASS=$classArgument")
            }
        } else {
            Log.i(TAG, "Using explicit instrumentation argument: $ARG_CLASS=$explicitClassSelection")
        }

        super.onCreate(args)
    }

    private fun resolveSelection(args: Bundle): List<String> {
        val suiteArg = args.getString(ARG_SUITE).orEmpty().trim()
        if (suiteArg.isBlank()) {
            return emptyList()
        }

        val suiteFile = args.getString(ARG_SUITE_FILE).orEmpty().ifBlank { DEFAULT_SUITE_FILE }
        return SdkContractSuiteSelection.resolveSuiteSelection(
            assetManager = context.assets,
            suiteAssetFileName = suiteFile,
            suiteSelection = suiteArg,
        )
    }

    companion object {
        private const val TAG = "SdkContractITRunner"
        private const val ARG_CLASS = "class"
        private const val ARG_SUITE = "suite"
        private const val ARG_SUITE_FILE = "suiteFile"
        private const val DEFAULT_SUITE_FILE = "instrumentation-test-suites.xml"
    }
}
