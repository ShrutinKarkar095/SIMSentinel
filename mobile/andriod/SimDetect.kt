package com.simsentinel

import org.json.JSONObject
import java.io.BufferedReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL

data class SimSentinelEvent(
    val deviceId: String,
    val userId: String? = null,
    val phoneNumber: String? = null,
    val eventType: String? = null,
    val imsi: String? = null,
    val iccid: String? = null,
    val carrier: String? = null,
    val simType: String? = null,
    val esimProfileId: String? = null,
    val recentEsimDownload: Boolean? = null,
    val portOutRequest: Boolean? = null,
    val deviceIntegrity: String? = null,
    val failedAuthCount24h: Int? = null,
    val ipCountry: String? = null,
    val geoCountry: String? = null,
    val hoursSinceSimChange: Int? = null
)

class SimSentinelClient(private val baseUrl: String) {
    fun enroll(event: SimSentinelEvent): String {
        return postJson("/enroll", event.toJson())
    }

    fun assess(event: SimSentinelEvent): String {
        return postJson("/assess", event.toJson())
    }

    private fun postJson(path: String, payload: JSONObject): String {
        val connection = (URL(baseUrl.trimEnd('/') + path).openConnection() as HttpURLConnection).apply {
            requestMethod = "POST"
            doOutput = true
            setRequestProperty("Content-Type", "application/json")
            setRequestProperty("Accept", "application/json")
        }

        OutputStreamWriter(connection.outputStream, Charsets.UTF_8).use { writer ->
            writer.write(payload.toString())
        }

        val stream = if (connection.responseCode in 200..299) {
            connection.inputStream
        } else {
            connection.errorStream
        }

        return stream.bufferedReader().use(BufferedReader::readText)
    }
}

private fun SimSentinelEvent.toJson(): JSONObject {
    return JSONObject().apply {
        put("device_id", deviceId)
        userId?.let { put("user_id", it) }
        phoneNumber?.let { put("phone_number", it) }
        eventType?.let { put("event_type", it) }
        imsi?.let { put("imsi", it) }
        iccid?.let { put("iccid", it) }
        carrier?.let { put("carrier", it) }
        simType?.let { put("sim_type", it) }
        esimProfileId?.let { put("esim_profile_id", it) }
        recentEsimDownload?.let { put("recent_esim_download", it) }
        portOutRequest?.let { put("port_out_request", it) }
        deviceIntegrity?.let { put("device_integrity", it) }
        failedAuthCount24h?.let { put("failed_auth_count_24h", it) }
        ipCountry?.let { put("ip_country", it) }
        geoCountry?.let { put("geo_country", it) }
        hoursSinceSimChange?.let { put("hours_since_sim_change", it) }
    }
}
