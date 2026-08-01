package com.keepmee.app.ai

import android.util.Base64
import io.ktor.client.HttpClient
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.request.header
import io.ktor.client.statement.HttpResponse
import io.ktor.client.statement.bodyAsText
import io.ktor.client.HttpClientConfig
import io.ktor.client.engine.cio.CIO
import io.ktor.client.plugins.HttpTimeout
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.serialization.kotlinx.json.json
import io.ktor.http.ContentType
import io.ktor.http.contentType
import io.ktor.http.HttpStatusCode
import kotlinx.serialization.Serializable
import kotlinx.serialization.SerialName
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.contentOrNull
import java.io.ByteArrayOutputStream
import android.graphics.Bitmap

data class AiParseResult(
    val amount: Double,
    val category: String,
    val note: String,
    val isExpense: Boolean
)

class AiVisionClient(private val config: AiConfig) {

    private val client = HttpClient(CIO) {
        expectSuccess = false
        install(HttpTimeout) {
            requestTimeoutMillis = 60_000
            connectTimeoutMillis = 15_000
            socketTimeoutMillis = 60_000
        }
        install(ContentNegotiation) {
            json(Json { ignoreUnknownKeys = true })
        }
    }

    suspend fun parseReceipt(image: Bitmap): Result<AiParseResult> {
        if (!config.isConfigured) {
            return Result.failure(IllegalStateException("视觉AI未配置，请在设置中填写 BaseURL / API Key / 模型"))
        }
        val base64 = bitmapToBase64(image)
        if (base64.length > 4_000_000) {
            return Result.failure(IllegalStateException("图片过大，请重拍更清晰的收据"))
        }
        return runCatching {
            val endpoint = config.baseUrl.trimEnd('/') + "/chat/completions"
            val body = buildRequest(base64)
            val response: HttpResponse = client.post(endpoint) {
                header("Authorization", "Bearer ${config.apiKey}")
                contentType(ContentType.Application.Json)
                setBody(body)
            }
            if (response.status != HttpStatusCode.OK) {
                val err = response.bodyAsText().take(200)
                throw IllegalStateException("AI接口返回 ${response.status.value}: $err")
            }
            parseResponse(response.bodyAsText())
        }
    }

    private fun buildRequest(base64: String): ChatRequest {
        val prompt = """
            你是一个专业的记账助手。请识别这张图片中的消费/收入信息。
            严格只输出一行 JSON，不要输出任何其他文字，格式为：
            {"amount": 金额数字, "category": "分类名称", "note": "备注", "isExpense": true或false}
            分类只能从以下支出分类中选择：餐饮、购物、日用、交通、蔬菜、水果、零食、运动、娱乐、通讯、服饰、美容、住房、居家、孩子、长辈、社交、旅行、烟酒、数码、汽车、医疗、书籍、学习、宠物、礼金、礼物、办公、维修、捐赠、彩票、亲友
            收入分类：工资、兼职、理财、礼金、其它
            如果图中是商品或收据，amount 为合计金额；如果无法识别，amount 返回 0。
            note 写简短说明，例如商品名称或商家。
        """.trimIndent()

        return ChatRequest(
            model = config.model,
            messages = listOf(
                Message(
                    role = "user",
                    content = listOf(
                        ContentPart(type = "text", text = prompt),
                        ContentPart(
                            type = "image_url",
                            imageUrl = ImageUrl("data:image/jpeg;base64,$base64")
                        )
                    )
                )
            ),
            temperature = 0.1,
            maxTokens = 256
        )
    }

    private fun parseResponse(raw: String): AiParseResult {
        val root = Json.parseToJsonElement(raw).jsonObject
        val content = root["choices"]?.jsonArray?.firstOrNull()
            ?.jsonObject?.get("message")?.jsonObject?.get("content")?.jsonPrimitive?.contentOrNull
            ?: throw IllegalStateException("AI 返回内容为空")

        val jsonStart = content.indexOf('{')
        val jsonEnd = content.lastIndexOf('}') + 1
        if (jsonStart < 0 || jsonEnd <= jsonStart) {
            throw IllegalStateException("AI 返回格式异常: $content")
        }
        val obj = Json.parseToJsonElement(content.substring(jsonStart, jsonEnd)).jsonObject

        val amount = obj["amount"]?.jsonPrimitive?.contentOrNull?.toDoubleOrNull() ?: 0.0
        val category = obj["category"]?.jsonPrimitive?.contentOrNull ?: "其它"
        val note = obj["note"]?.jsonPrimitive?.contentOrNull ?: ""
        val isExpense = obj["isExpense"]?.jsonPrimitive?.contentOrNull?.toBooleanStrictOrNull()
            ?: obj["isExpense"]?.jsonPrimitive?.contentOrNull != "false"

        if (amount <= 0) {
            throw IllegalStateException("未能从图片中识别到有效金额，请确认图片清晰")
        }
        return AiParseResult(amount, category, note, isExpense)
    }

    private fun bitmapToBase64(bitmap: Bitmap): String {
        val scale = 1024f / maxOf(bitmap.width, bitmap.height)
        val scaled = if (scale < 1f) {
            Bitmap.createScaledBitmap(
                bitmap,
                (bitmap.width * scale).toInt().coerceAtLeast(1),
                (bitmap.height * scale).toInt().coerceAtLeast(1),
                true
            )
        } else bitmap

        val out = ByteArrayOutputStream()
        scaled.compress(Bitmap.CompressFormat.JPEG, 85, out)
        if (scaled != bitmap) scaled.recycle()
        return Base64.encodeToString(out.toByteArray(), Base64.NO_WRAP)
    }

    @Serializable
    private data class ChatRequest(
        val model: String,
        val messages: List<Message>,
        val temperature: Double = 0.1,
        @SerialName("max_tokens") val maxTokens: Int = 256
    )

    @Serializable
    private data class Message(
        val role: String,
        val content: List<ContentPart>
    )

    @Serializable
    private data class ContentPart(
        val type: String,
        val text: String? = null,
        @SerialName("image_url") val imageUrl: ImageUrl? = null
    )

    @Serializable
    private data class ImageUrl(val url: String)
}
