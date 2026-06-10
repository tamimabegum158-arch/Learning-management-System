package com.ailms.payment.dto;

import com.ailms.payment.enums.PaymentProvider;
import com.ailms.payment.enums.PaymentStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentResponse(
        Long paymentId,
        Long courseId,
        String courseTitle,
        BigDecimal amount,
        PaymentProvider provider,
        PaymentStatus status,
        String orderReference,
        String providerPaymentId,
        LocalDateTime paidAt
) {
}
