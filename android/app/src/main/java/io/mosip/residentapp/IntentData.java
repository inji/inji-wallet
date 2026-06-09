package io.mosip.residentapp;

public class IntentData {
    private static final String FLOW_QR_LOGIN = "qrLoginFlow";
    private static final String FLOW_OVP = "ovpFlow";
    private static final String FLOW_CREDENTIAL_OFFER = "credentialOfferFlow";

    private String qrData = "";
    private String ovpQrData = "";
    private String credentialOfferData = "";

    private static IntentData intentData;
    public static IntentData getInstance() {
        if(intentData == null)
            intentData = new IntentData();
        return intentData;
    }
    public String getQrData() {
        return qrData;
    }

    public void setQrData(String qrData) {
        this.qrData = qrData;
    }

    public String getOVPQrData() {
        return ovpQrData;
    }

    public void setOVPQrData(String ovpQrData) {
        this.ovpQrData = ovpQrData;
    }

    // Read-once-and-clear: returning the URI also wipes the native bucket
    // so a re-entry of app.ready.focus.active cannot replay the same intent.
    public synchronized String getCredentialOfferData() {
        String data = this.credentialOfferData;
        this.credentialOfferData = "";
        return data;
    }

    public synchronized void setCredentialOfferData(String credentialOfferData) {
        this.credentialOfferData = credentialOfferData;
    }

    public String getDataByFlow(String flowType) {
        if (flowType == null) return "";
        return switch (flowType) {
            case FLOW_QR_LOGIN -> getQrData();
            case FLOW_OVP -> getOVPQrData();
            case FLOW_CREDENTIAL_OFFER -> getCredentialOfferData();
            default -> "";
        };
    }

    public void resetDataByFlow(String flowType) {
        if (flowType == null) return;
        switch (flowType) {
            case FLOW_QR_LOGIN -> setQrData("");
            case FLOW_OVP -> setOVPQrData("");
            case FLOW_CREDENTIAL_OFFER -> setCredentialOfferData("");
        }
    }
}
