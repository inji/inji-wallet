package com.example.samplecredentialwallet.ovp.data

import com.google.gson.JsonObject

data class VCMetadata(
    val format: String,
    val vc: JsonObject,
    val rawCBORData: String? = null
)
