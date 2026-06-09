package com.example.samplecredentialwallet.ovp.viewmodel

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import com.example.samplecredentialwallet.ovp.utils.MatchingResult
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

class OVPViewModel : ViewModel() {
    var scannedQr: String? by mutableStateOf(null)
        private set

    fun updateScannedQr(data: String) {
        scannedQr = data
    }

    private val _matchingResult = MutableStateFlow<MatchingResult?>(null)
    val matchingResult: StateFlow<MatchingResult?> = _matchingResult

    fun storeMatchResult(result: MatchingResult) {
        _matchingResult.value = result
    }

    fun clearMatchResult() {
        _matchingResult.value = null
    }
}
