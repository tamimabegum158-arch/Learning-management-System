package com.ailms.payment.gateway;

import com.ailms.payment.enums.PaymentProvider;
import java.math.BigDecimal;
import org.springframework.stereotype.Component;

@Component
public class StripePaymentGateway extends AbstractHmacPaymentGateway implements PaymentGateway {
    @Override
    public PaymentProvider provider() {
        return PaymentProvider.STRIPE;
    }

    @Override
    public String createCheckoutToken(String orderReference, BigDecimal amount, String studentEmail) {
        return "stripe_cs_" + orderReference;
    }

    @Override
    public boolean verifyWebhookSignature(String payload, String signature, String secret) {
        return validateHmacSha256(payload, signature, secret);
    }
}
