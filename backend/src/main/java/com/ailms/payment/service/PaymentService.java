package com.ailms.payment.service;

import com.ailms.payment.dto.ConfirmPaymentRequest;
import com.ailms.payment.dto.CreateCheckoutResponse;
import com.ailms.payment.dto.CreateCourseCheckoutRequest;
import com.ailms.payment.dto.PaymentResponse;
import com.ailms.payment.dto.WebhookEventRequest;
import com.ailms.payment.enums.PaymentProvider;
import java.util.List;

public interface PaymentService {
    CreateCheckoutResponse createCourseCheckout(CreateCourseCheckoutRequest request, String studentEmail);
    PaymentResponse confirmPayment(ConfirmPaymentRequest request, String studentEmail);
    List<PaymentResponse> myPayments(String studentEmail);
    void processWebhook(PaymentProvider provider, String signature, String rawPayload, WebhookEventRequest event);
}
