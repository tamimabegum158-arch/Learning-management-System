package com.ailms.payment.dto;

import jakarta.validation.constraints.NotBlank;

public record ConfirmPaymentRequest(
        @NotBlank(message = "Order reference is required")
        String orderReference,

        @NotBlank(message = "Provider payment id is required")
        String providerPaymentId
) {
}
