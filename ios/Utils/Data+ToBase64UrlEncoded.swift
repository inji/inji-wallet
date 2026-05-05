import Foundation


extension Data {
    init?(base64UrlEncoded: String) {
        let base64 = base64UrlEncoded.base64URLToBase64()
        guard let decoded = Data(base64Encoded: base64) else {
            return nil
        }
        
        self = decoded
    }
    
    func toBase64UrlEncoded() -> String {
        return self.base64EncodedString()
            .replacingOccurrences(of: "+", with: "-")
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: "=", with: "")
    }
}

extension String {
    func base64URLToBase64() -> String {
        var base64 = self
            .replacingOccurrences(of: "-", with: "+")
            .replacingOccurrences(of: "_", with: "/")

        let paddingLength = 4 - (base64.count % 4)
        if paddingLength < 4 {
            base64 += String(repeating: "=", count: paddingLength)
        }

        return base64
    }
}
