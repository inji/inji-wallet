import Foundation

enum HttpMethod: String {
    case get = "GET"
    case post = "POST"
}

protocol NetworkManaging {
    func sendHTTPRequest(url: String, method: HttpMethod, bodyParams: [String: String]?,
                         headers: [String: String]?) async throws -> [String: Any]
}

class NetworkManagerClient:NetworkManaging {
    
    static let shared = NetworkManagerClient()
    
     func sendHTTPRequest(
        url: String,
        method: HttpMethod,
        bodyParams: [String: String]? = nil,
        headers: [String: String]? = nil
    ) async throws -> [String: Any] {
        guard let url = URL(string: url) else {
            throw NetworkManagerClientException.failed("Invalid Url")
        }

        var request = URLRequest(url: url)
        request.httpMethod = method.rawValue

        if method == .post, let bodyParams = bodyParams {
            let formBody = bodyParams
                .map { "\($0.key)=\($0.value)" }
                .joined(separator: "&")
            request.httpBody = formBody.data(using: .utf8)
            request.setValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")
        }

        headers?.forEach { key, value in
            request.setValue(value, forHTTPHeaderField: key)
        }

        let (data, response): (Data, URLResponse)
        do {
            (data, response) = try await URLSession.shared.data(for: request)
        } catch {
            if (error as NSError).code == NSURLErrorTimedOut {
                throw NetworkManagerClientException.timeout
            }
            throw NetworkManagerClientException.failed(error.localizedDescription)
        }

        guard let httpResponse = response as? HTTPURLResponse else {
            throw NetworkManagerClientException.failed("Invalid network Response")
        }

        if !(200...299).contains(httpResponse.statusCode) {
            if let serverError = String(data: data, encoding: .utf8), !serverError.isEmpty {
                throw NetworkManagerClientException.failed("HTTP \(httpResponse.statusCode): \(serverError)")
            } else {
                throw NetworkManagerClientException.failed("HTTP \(httpResponse.statusCode): Unknown error")
            }
        }

        guard let jsonObject = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            throw NetworkManagerClientException.failed("Decoding network response failed")
        }

        return jsonObject
    }

}
