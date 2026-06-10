package com.ailms.video.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
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
class VideoLearningControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void resumeWithoutToken_returnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/student/video/courses/1/resume"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void updateProgressWithoutToken_returnsUnauthorized() throws Exception {
        mockMvc.perform(patch("/api/v1/student/video/lessons/1/progress")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"watchedSeconds\":120,\"completionPercentage\":30}"))
                .andExpect(status().isUnauthorized());
    }
}
