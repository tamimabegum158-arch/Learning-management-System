package com.ailms.payment.dto;

import com.ailms.payment.enums.PaymentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record WebhookEventRequest(
        @NotBlank(message = "Order reference is required")
        String orderReference,

        @NotBlank(message = "Provider payment id is required")
        String providerPaymentId,

        @NotNull(message = "Status is required")
        PaymentStatus status
) {
}
