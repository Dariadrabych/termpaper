package com.kernel.ai.services;

import com.kernel.ai.config.GroqConfig;
import okhttp3.*;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

@Service
public class AiService {

    private final GroqConfig config;
    private final OkHttpClient client = new OkHttpClient();

    public AiService(GroqConfig config) {
        this.config = config;
    }

    public String generateAnswer(String question) {
        try {
            // === 1. Формується Body ===
            JSONObject body = new JSONObject()
        .put("model", "llama-3.3-70b-versatile")
        .put("messages", new JSONArray()
                .put(new JSONObject()
                        .put("role", "system")
                        .put("content",
                                "Ти — український AI-асистент Kernel School. " +
                                "Відповідай українською мовою, коротко, зрозуміло і дружньо.")
                )
                .put(new JSONObject()
                        .put("role", "user")
                        .put("content", question)
                )
        );

            // === 2. Перевірка ключа ===
            String apiKey = config.apiKey;
            if (apiKey == null || apiKey.trim().isEmpty()) {
                return "AI CORE ERROR → API Key is missing";
            }
            apiKey = apiKey.trim();

            // === 3. Формується запит ===
            Request request = new Request.Builder()
                    .url("https://api.groq.com/openai/v1/chat/completions")
                    .addHeader("Authorization", "Bearer " + apiKey)
                    .addHeader("Content-Type", "application/json")
                    .post(RequestBody.create(
                            body.toString(),
                            MediaType.get("application/json")
                    ))
                    .build();

           
            Response response = client.newCall(request).execute();
            String responseStr = response.body().string();

            System.out.println("RAW: " + responseStr);

            // === 5. Парсинг відповіді ===
            JSONObject result = new JSONObject(responseStr);

            if (result.has("error")) {
                return "AI CORE ERROR → " + result.getJSONObject("error").getString("message");
            }

            return result
                    .getJSONArray("choices")
                    .getJSONObject(0)
                    .getJSONObject("message")
                    .getString("content")
                    .trim();

        } catch (Exception e) {
            return "AI CORE ERROR → " + e.getMessage();
        }
    }
}
