package com.ailms.payment.dto;

import com.ailms.payment.enums.PaymentProvider;
import jakarta.validation.constraints.NotNull;

public record CreateCourseCheckoutRequest(
        @NotNull(message = "Course id is required")
        Long courseId,

        @NotNull(message = "Payment provider is required")
        PaymentProvider provider
) {
}
