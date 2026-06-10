package com.ailms.course.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CourseControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void getPublishedCourses_isPublic() throws Exception {
        mockMvc.perform(get("/api/v1/courses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void studentEnrollments_withoutToken_returnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/student/enrollments/mine"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void searchPublishedCourses_isPublic() throws Exception {
        mockMvc.perform(get("/api/v1/courses/search"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void feedPublishedCourses_isPublic() throws Exception {
        mockMvc.perform(get("/api/v1/courses/feed"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void wishlist_withoutToken_returnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/student/wishlist"))
                .andExpect(status().isUnauthorized());
    }
}
