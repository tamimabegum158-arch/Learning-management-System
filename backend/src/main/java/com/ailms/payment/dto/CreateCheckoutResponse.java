package com.ailms.payment.dto;

import com.ailms.payment.enums.PaymentProvider;
import java.math.BigDecimal;

public record CreateCheckoutResponse(
        Long paymentId,
        String orderReference,
        PaymentProvider provider,
        BigDecimal amount,
        String checkoutToken
) {
}
