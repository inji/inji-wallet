package com.example.samplecredentialwallet.ovp.viewmodel

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.samplecredentialwallet.ovp.utils.MatchingResult
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class OVPViewModel : ViewModel() {
    var scannedQr: String? by mutableStateOf(null)
        private set

    fun updateScannedQr(data: String) {
        scannedQr = data
    }

    private val _matchingResult = MutableStateFlow<MatchingResult?>(null)
    val matchingResult: StateFlow<MatchingResult?> = _matchingResult

    fun storeMatchResult(result: MatchingResult) {
        viewModelScope.launch {
            _matchingResult.value = result
        }
    }

    fun clearMatchResult() {
        viewModelScope.launch {
            _matchingResult.value = null
        }
    }
}
