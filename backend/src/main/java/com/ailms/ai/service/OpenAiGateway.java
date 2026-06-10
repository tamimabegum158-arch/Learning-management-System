package com.ailms.ai.service;

public interface OpenAiGateway {
    String complete(String systemPrompt, String userPrompt);
}
