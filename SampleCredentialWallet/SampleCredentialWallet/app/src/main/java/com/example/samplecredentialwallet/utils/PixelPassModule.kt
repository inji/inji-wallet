package com.example.samplecredentialwallet.utils


import io.mosip.pixelpass.PixelPass
import io.mosip.pixelpass.types.ECC

class PixelPassModule {
    private val pixelPass = PixelPass()


    fun generateQRData(credentialData: String, header: String = ""): String {
        return pixelPass.generateQRData(credentialData, header)
    }


    fun generateQRCode(credentialData: String, header: String = "", ecc: ECC = ECC.L): String {
        return pixelPass.generateQRCode(credentialData, ecc, header)
    }
}