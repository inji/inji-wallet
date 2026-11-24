import Foundation
import ios_tuvali_library
import os.log

class RNEventMapper {
    
    static func toMap(_ event: Event) -> NSMutableDictionary {
        let writableMap = NSMutableDictionary()
        
        writableMap["type"] = getEventType(event)
        populateWithArgs(event, writableMap)
        
        return writableMap
    }
    
    fileprivate static func getEventType(_ event: Event) -> String {
        switch event {
        case is ConnectedEvent: return "onConnected"
        case is SecureChannelEstablishedEvent: return "onSecureChannelEstablished"
        case is DataSentEvent: return "onDataSent"
        case is DataReceivedEvent: return "onDataReceived"
        case is VerificationStatusEvent: return "onVerificationStatusReceived"
        case is ErrorEvent: return  "onError"
        case is DisconnectedEvent: return "onDisconnected"
        default:
            os_log(.error, "Invalid event type")
            return ""
        }
    }
    
    fileprivate static func populateWithArgs(_ event: Event, _ writableMap: NSMutableDictionary) {
        let eventMirror = Mirror(reflecting: event)
        
        for child in eventMirror.children {
            var value = child.value
            
            if(child.label != nil && (value is String || value is Int)) {
                writableMap[child.label!] = value
                continue
            }
        }
        
        //TODO: Find a way to convert enum to arg in a generic way
        if let event = event as? VerificationStatusEvent {
            writableMap["status"] = event.status.rawValue
        }
    }
}
