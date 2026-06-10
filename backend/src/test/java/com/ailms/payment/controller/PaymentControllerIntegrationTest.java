package com.ailms.payment.controller;

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
class PaymentControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void checkoutWithoutToken_returnsUnauthorized() throws Exception {
        mockMvc.perform(post("/api/v1/student/payments/checkout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"courseId\":1,\"provider\":\"STRIPE\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void historyWithoutToken_returnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/student/payments/history"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void webhookWithoutSignature_returnsBadRequestOrOk() throws Exception {
        mockMvc.perform(post("/api/v1/webhooks/payments/stripe")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"orderReference\":\"ORD-XYZ\",\"providerPaymentId\":\"pay_1\",\"status\":\"SUCCESS\"}"))
                .andExpect(status().is4xxClientError());
    }
}
