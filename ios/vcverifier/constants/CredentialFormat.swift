public enum StatusCheckCredentialFormat: String {
    case ldpVc = "ldp_vc"

  static func from(_ value: String) -> StatusCheckCredentialFormat? {
    return StatusCheckCredentialFormat(rawValue: value)
    }
}
