package io.mosip.residentapp.sdkcontract

import org.junit.runner.RunWith
import org.junit.runners.Suite

@RunWith(Suite::class)
@Suite.SuiteClasses(
    SunbirdCredentialDownloadInstrumentedTest::class,
    CredentialPresentationInstrumentedTest::class,
    VcVerifierInstrumentedTest::class,
)
class SunbirdDownloadThenPresentSuite
