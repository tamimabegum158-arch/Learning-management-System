package com.ailms.payment.gateway;

import com.ailms.payment.enums.PaymentProvider;
import java.math.BigDecimal;

public interface PaymentGateway {
    PaymentProvider provider();
    String createCheckoutToken(String orderReference, BigDecimal amount, String studentEmail);
    boolean verifyWebhookSignature(String payload, String signature, String secret);
}
