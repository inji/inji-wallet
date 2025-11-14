import Foundation

func decodeBase64URL(_ base64url: String) throws -> Data {
    var base64 = base64url
        .replacingOccurrences(of: "-", with: "+")
        .replacingOccurrences(of: "_", with: "/")

    let padding = 4 - (base64.count % 4)
    if padding < 4 {
        base64 += String(repeating: "=", count: padding)
    }

    guard let data = Data(base64Encoded: base64) else {
        throw NSError(domain: "Base64URLDecodeError", code: -1)
    }
    return data
}

