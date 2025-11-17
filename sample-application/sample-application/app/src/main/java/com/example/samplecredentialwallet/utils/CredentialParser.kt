package com.example.samplecredentialwallet.utils

import org.json.JSONArray
import org.json.JSONObject

object CredentialParser {
    
    fun parseCredential(credentialJson: String): Map<String, String> {
        val result = mutableMapOf<String, String>()
        val addedKeys = mutableSetOf<String>()
        
        try {
            val cleanCredential = if (credentialJson.startsWith("CredentialResponse(")) {
                val credMatch = Regex("""credential=(\{.*\})(?:,|\))""").find(credentialJson)
                credMatch?.groupValues?.get(1) ?: credentialJson
            } else {
                credentialJson
            }
            
            val json = JSONObject(cleanCredential)
            
            val types = json.optJSONArray("type")
            if (types != null && types.length() > 0) {
                result["type"] = types.getString(types.length() - 1)
            }

            fun shouldSkipValue(value: String): Boolean {
                return value.isEmpty() ||
                       value == "N/A" ||
                       value.length > 100 ||
                       value.startsWith("http://") ||
                       value.startsWith("https://") ||
                       value.startsWith("did:") ||
                       value.contains("eyJ") ||
                       value.matches(Regex("^[A-Za-z0-9+/=]{50,}$"))
            }
            
            fun addField(key: String, value: String) {
                val keyLower = key.lowercase()
                if (keyLower !in addedKeys && !shouldSkipValue(value)) {
                    result[key] = value
                    addedKeys.add(keyLower)
                }
            }
            
            val credentialSubject = json.optJSONObject("credentialSubject")
            if (credentialSubject != null) {
                credentialSubject.keys().forEach { key ->
                    val value = credentialSubject.opt(key)
                    when (value) {
                        is String -> {
                            if (key == "face" && value.startsWith("data:image/")) {
                                result["faceImage"] = value.substringAfter(",")
                            } else if (value.trim().startsWith("{") && value.contains("\"language\"") && value.contains("\"value\"")) {
                                try {
                                    val langObj = JSONObject(value)
                                    addField(key, langObj.optString("value", ""))
                                } catch (e: Exception) {
                                    addField(key, value)
                                }
                            } else {
                                addField(key, value)
                            }
                        }
                        is JSONObject -> {
                            val actualValue = value.optString("value", "")
                            if (actualValue.isNotEmpty()) {
                                val cleanedValue = actualValue.replace(Regex("(eng|hin|ara|fra|deu|spa|por|rus|zho|jpn|kor)$"), "")
                                addField(key, cleanedValue)
                            } else {
                                addField(key, value.toString())
                            }
                        }
                        is JSONArray -> {
                            val arrayValues = mutableListOf<String>()
                            for (i in 0 until value.length()) {
                                when (val item = value.opt(i)) {
                                    is JSONObject -> {
                                        val langValue = item.optString("value", "")
                                        if (langValue.isNotEmpty()) {
                                            arrayValues.add(langValue.replace(Regex("(eng|hin|ara|fra|deu|spa|por|rus|zho|jpn|kor)$"), ""))
                                        } else {
                                            arrayValues.add(item.toString())
                                        }
                                    }
                                    is String -> arrayValues.add(item)
                                    else -> arrayValues.add(item.toString())
                                }
                            }
                            addField(key, arrayValues.joinToString(", "))
                        }
                        else -> addField(key, value.toString())
                    }
                }
            }
            
        } catch (e: Exception) {
            result["error"] = "Failed to parse credential"
            result["raw"] = credentialJson.take(100) + "..."
        }
        
        return result
    }
}
