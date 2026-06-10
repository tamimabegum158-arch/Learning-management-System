package com.ailms.ai.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AiLearningControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void studyPlanWithoutToken_returnsUnauthorized() throws Exception {
        mockMvc.perform(post("/api/v1/ai/study-plan")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"dailyFreeTimeMinutes\":120,\"goal\":\"Pass java exam\",\"examDate\":\"2026-12-12\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void chatWithoutToken_returnsUnauthorized() throws Exception {
        mockMvc.perform(post("/api/v1/ai/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"message\":\"Explain Java streams\"}"))
                .andExpect(status().isUnauthorized());
    }
}
