import Foundation

func decode<T: Decodable>(
    _ type: T.Type,
    from dictionary: [String: Any]
) throws -> T {

    let data = try JSONSerialization.data(withJSONObject: dictionary)

    return try JSONDecoder().decode(T.self, from: data)
}
