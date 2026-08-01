package com.ctrlai.app.signaling

import kotlinx.serialization.Serializable
import org.webrtc.IceCandidate

@Serializable
data class IceCandidateWire(
    val sdpMid: String?,
    val sdpMLineIndex: Int,
    val sdp: String,
)

object IceCandidateCodec {
    fun encode(candidate: IceCandidate): String {
        val wire = IceCandidateWire(
            sdpMid = candidate.sdpMid,
            sdpMLineIndex = candidate.sdpMLineIndex,
            sdp = candidate.sdp,
        )
        return SignalingJson.json.encodeToString(IceCandidateWire.serializer(), wire)
    }

    fun decode(text: String): IceCandidate {
        val wire = SignalingJson.json.decodeFromString(IceCandidateWire.serializer(), text)
        return IceCandidate(wire.sdpMid, wire.sdpMLineIndex, wire.sdp)
    }
}
