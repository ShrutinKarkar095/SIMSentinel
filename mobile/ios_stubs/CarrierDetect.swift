import Foundation

struct SimSentinelEvent: Codable {
    let deviceId: String
    let userId: String?
    let phoneNumber: String?
    let eventType: String?
    let imsi: String?
    let iccid: String?
    let carrier: String?
    let simType: String?
    let esimProfileId: String?
    let recentEsimDownload: Bool?
    let portOutRequest: Bool?
    let deviceIntegrity: String?
    let failedAuthCount24h: Int?
    let ipCountry: String?
    let geoCountry: String?
    let hoursSinceSimChange: Int?

    enum CodingKeys: String, CodingKey {
        case deviceId = "device_id"
        case userId = "user_id"
        case phoneNumber = "phone_number"
        case eventType = "event_type"
        case imsi
        case iccid
        case carrier
        case simType = "sim_type"
        case esimProfileId = "esim_profile_id"
        case recentEsimDownload = "recent_esim_download"
        case portOutRequest = "port_out_request"
        case deviceIntegrity = "device_integrity"
        case failedAuthCount24h = "failed_auth_count_24h"
        case ipCountry = "ip_country"
        case geoCountry = "geo_country"
        case hoursSinceSimChange = "hours_since_sim_change"
    }
}

struct SimSentinelEnrollmentResponse: Decodable {
    let status: String
    let deviceId: String
    let message: String

    enum CodingKeys: String, CodingKey {
        case status
        case deviceId = "device_id"
        case message
    }
}

struct SimSentinelAssessmentResponse: Decodable {
    let deviceId: String
    let risk: Int
    let severity: String
    let action: String
    let decision: String
    let flags: [String]

    enum CodingKeys: String, CodingKey {
        case deviceId = "device_id"
        case risk
        case severity
        case action
        case decision
        case flags
    }
}

final class SimSentinelClient {
    private let baseURL: URL
    private let session: URLSession
    private let encoder = JSONEncoder()
    private let decoder = JSONDecoder()

    init(baseURL: URL, session: URLSession = .shared) {
        self.baseURL = baseURL
        self.session = session
    }

    func enroll(_ event: SimSentinelEvent) async throws -> SimSentinelEnrollmentResponse {
        try await post(path: "/enroll", body: event, responseType: SimSentinelEnrollmentResponse.self)
    }

    func assess(_ event: SimSentinelEvent) async throws -> SimSentinelAssessmentResponse {
        try await post(path: "/assess", body: event, responseType: SimSentinelAssessmentResponse.self)
    }

    private func post<T: Encodable, U: Decodable>(path: String, body: T, responseType: U.Type) async throws -> U {
        var request = URLRequest(url: baseURL.appendingPathComponent(path.trimmingCharacters(in: CharacterSet(charactersIn: "/"))))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try encoder.encode(body)

        let (data, response) = try await session.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse, (200...299).contains(httpResponse.statusCode) else {
            throw URLError(.badServerResponse)
        }

        return try decoder.decode(responseType, from: data)
    }
}
