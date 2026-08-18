import Foundation
import UIKit

struct BrowserApp: Identifiable, Equatable {
    let id: String
    let displayName: String
    let isDefault: Bool
    let probeURL: URL?
    let redirectURLBuilder: RedirectURLBuilder

    static func == (lhs: BrowserApp, rhs: BrowserApp) -> Bool {
        return lhs.id == rhs.id
    }

    func redirectURL(for redirectUri: String) -> URL? {
        guard let url = sanitizeRedirectUri(redirectUri).flatMap({ URL(string: $0) }) else {
            return nil
        }
        return redirectURLBuilder.build(from: url)
    }
}

enum RedirectURLBuilder {
    case systemDefault
    case replaceScheme(http: String, https: String)
    case percentEncodedQuery(prefix: String)
    case schemeless(prefix: String)

    func build(from url: URL) -> URL? {
        switch self {
        case .systemDefault:
            return url

        case let .replaceScheme(httpReplacement, httpsReplacement):
            guard var components = URLComponents(url: url, resolvingAgainstBaseURL: false),
                  let scheme = components.scheme?.lowercased()
            else { return nil }

            switch scheme {
            case "http": components.scheme = httpReplacement
            case "https": components.scheme = httpsReplacement
            default: return nil
            }
            return components.url

        case let .percentEncodedQuery(prefix):
            guard let encoded = url.absoluteString
                .addingPercentEncoding(withAllowedCharacters: .rfc3986Unreserved)
            else { return nil }
            return URL(string: prefix + encoded)

        case let .schemeless(prefix):
            guard let scheme = url.scheme else { return nil }
            let schemeless = String(url.absoluteString.dropFirst("\(scheme)://".count))
            guard !schemeless.isEmpty else { return nil }
            return URL(string: prefix + schemeless)
        }
    }
}

extension BrowserApp {
    static let systemDefault = BrowserApp(
        id: "default",
        displayName: "Default browser",
        isDefault: true,
        probeURL: nil,
        redirectURLBuilder: .systemDefault
    )

    static let chrome = BrowserApp(
        id: "chrome",
        displayName: "Chrome",
        isDefault: false,
        probeURL: URL(string: "googlechromes://verifier.example.com"),
        redirectURLBuilder: .replaceScheme(http: "googlechrome", https: "googlechromes")
    )

    static let firefox = BrowserApp(
        id: "firefox",
        displayName: "Firefox",
        isDefault: false,
        probeURL: URL(string: "firefox://open-url?url=https%3A%2F%2Fverifier.example.com"),
        redirectURLBuilder: .percentEncodedQuery(prefix: "firefox://open-url?url=")
    )

    static let edge = BrowserApp(
        id: "edge",
        displayName: "Edge",
        isDefault: false,
        probeURL: URL(string: "microsoft-edge-https://verifier.example.com"),
        redirectURLBuilder: .replaceScheme(http: "microsoft-edge-http", https: "microsoft-edge-https")
    )

    static let brave = BrowserApp(
        id: "brave",
        displayName: "Brave",
        isDefault: false,
        probeURL: URL(string: "brave://open-url?url=https%3A%2F%2Fverifier.example.com"),
        redirectURLBuilder: .percentEncodedQuery(prefix: "brave://open-url?url=")
    )

    static let opera = BrowserApp(
        id: "opera",
        displayName: "Opera Touch",
        isDefault: false,
        probeURL: URL(string: "touch-https://verifier.example.com"),
        redirectURLBuilder: .replaceScheme(http: "touch-http", https: "touch-https")
    )

    static let duckDuckGo = BrowserApp(
        id: "duckduckgo",
        displayName: "DuckDuckGo",
        isDefault: false,
        probeURL: URL(string: "ddgQuickLink://verifier.example.com"),
        redirectURLBuilder: .schemeless(prefix: "ddgQuickLink://")
    )

    static let knownBrowsers: [BrowserApp] = [chrome, firefox, edge, brave, opera, duckDuckGo]
}

final class BrowserRedirectHandler {

    func getAvailableBrowsers() async -> [BrowserApp] {
        var availableBrowsers: [BrowserApp] = [.systemDefault]

        for browser in BrowserApp.knownBrowsers {
            guard let probeURL = browser.probeURL else { continue }
            if await canOpen(probeURL) {
                availableBrowsers.append(browser)
            }
        }

        return availableBrowsers
    }

    @discardableResult
    func redirect(redirectUri: String?, using browser: BrowserApp? = nil) async -> Bool {
        guard let sanitizedRedirectUri = sanitizeRedirectUri(redirectUri) else {
            return false
        }

        let selectedBrowser = isBrowserNavigableRedirectUri(sanitizedRedirectUri)
            ? (browser ?? .systemDefault)
            : .systemDefault

        guard let redirectURL = selectedBrowser.redirectURL(for: sanitizedRedirectUri) else {
            return false
        }

        return await open(redirectURL)
    }

    private func canOpen(_ url: URL) async -> Bool {
        return await MainActor.run { UIApplication.shared.canOpenURL(url) }
    }

    private func open(_ url: URL) async -> Bool {
        return await withCheckedContinuation { continuation in
            Task { @MainActor in
                UIApplication.shared.open(url, options: [:]) { opened in
                    continuation.resume(returning: opened)
                }
            }
        }
    }
}

private let browserSchemes: Set<String> = ["http", "https"]

private let rfc3986UriCharacters = CharacterSet(
    charactersIn: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
        + "-._~:/?#[]@!$&'()*+,;=%"
)

private func containsOnlyRfc3986Characters(_ value: String) -> Bool {
    return value.unicodeScalars.allSatisfy { rfc3986UriCharacters.contains($0) }
}

private func sanitizeRedirectUri(_ redirectUri: String?) -> String? {
    guard let value = redirectUri?.trimmingCharacters(in: .whitespacesAndNewlines),
          !value.isEmpty,
          containsOnlyRfc3986Characters(value),
          let components = URLComponents(string: value),
          let scheme = components.scheme?.lowercased(),
          !scheme.isEmpty,
          URL(string: value) != nil
    else { return nil }

    if browserSchemes.contains(scheme), (components.host ?? "").isEmpty {
        return nil
    }

    return value
}

private func isBrowserNavigableRedirectUri(_ redirectUri: String?) -> Bool {
    guard let value = sanitizeRedirectUri(redirectUri),
          let scheme = URLComponents(string: value)?.scheme?.lowercased()
    else { return false }
    return browserSchemes.contains(scheme)
}

private extension CharacterSet {
    static let rfc3986Unreserved = CharacterSet(
        charactersIn: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~"
    )
}
