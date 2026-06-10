package com.ailms.payment.gateway;

import com.ailms.payment.enums.PaymentProvider;
import java.math.BigDecimal;
import org.springframework.stereotype.Component;

@Component
public class RazorpayPaymentGateway extends AbstractHmacPaymentGateway implements PaymentGateway {
    @Override
    public PaymentProvider provider() {
        return PaymentProvider.RAZORPAY;
    }

    @Override
    public String createCheckoutToken(String orderReference, BigDecimal amount, String studentEmail) {
        return "razorpay_order_" + orderReference;
    }

    @Override
    public boolean verifyWebhookSignature(String payload, String signature, String secret) {
        return validateHmacSha256(payload, signature, secret);
    }
}
