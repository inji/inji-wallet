package io.mosip.residentapp;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import io.mosip.tuvali.common.events.*;

public class RNEventMapper {

    public static WritableMap toMap(Event event) {
        WritableMap writableMap = Arguments.createMap();
        writableMap.putString("type", getEventType(event));
        populateEventFields(event, writableMap);
        return writableMap;
    }

    private static String getEventType(Event event) {   
        if (event instanceof DataReceivedEvent) {
            return "onDataReceived";
        } else if (event instanceof ErrorEvent) {
            return "onError";
        } else if (event instanceof VerificationStatusEvent) {
            return "onVerificationStatusReceived";
        } else if (event instanceof ConnectedEvent) {
            return "onConnected";
        } else if (event instanceof DataSentEvent) {
            return "onDataSent";
        } else if (event instanceof DisconnectedEvent) {
            return "onDisconnected";
        } else if (event instanceof SecureChannelEstablishedEvent) {
            return "onSecureChannelEstablished";
        } else {
            System.out.println("Invalid event type");
            return "";
        }
    }

    private static void populateEventFields(Event event, WritableMap map) {
        if (event instanceof DataReceivedEvent) {
            DataReceivedEvent e = (DataReceivedEvent) event;
            map.putString("data", e.getData());
            map.putInt("crcFailureCount", e.getCrcFailureCount());
            map.putInt("totalChunkCount", e.getTotalChunkCount());

        } else if (event instanceof ErrorEvent) {
            ErrorEvent e = (ErrorEvent) event;
            map.putString("message", e.getMessage());
            map.putString("code", e.getCode());

        } else if (event instanceof VerificationStatusEvent) {
            VerificationStatusEvent e = (VerificationStatusEvent) event;
            map.putInt("status", e.getStatus().getValue());

        }
        // ConnectedEvent, DisconnectedEvent, SecureChannelEstablishedEvent have no extra fields
    }
}
