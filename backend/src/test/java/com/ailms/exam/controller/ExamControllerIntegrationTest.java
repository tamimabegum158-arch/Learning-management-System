package com.ailms.exam.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
class ExamControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void createQuiz_withoutToken_returnsUnauthorized() throws Exception {
        mockMvc.perform(post("/api/v1/instructor/exams/quizzes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"courseId\":1,\"title\":\"Quiz 1\",\"durationMinutes\":30,\"passPercentage\":50}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void leaderboard_withoutToken_returnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/student/exams/quizzes/1/leaderboard"))
                .andExpect(status().isUnauthorized());
    }
}
