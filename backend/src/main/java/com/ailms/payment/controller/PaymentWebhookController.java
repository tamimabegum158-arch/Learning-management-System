package com.ailms.payment.controller;

import com.ailms.common.dto.ApiResponse;
import com.ailms.payment.dto.WebhookEventRequest;
import com.ailms.payment.enums.PaymentProvider;
import com.ailms.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/v1/webhooks/payments", "/api/v1/webhooks/payments"})
@RequiredArgsConstructor
public class PaymentWebhookController {

    private final PaymentService paymentService;

    @PostMapping("/{provider}")
    public ResponseEntity<ApiResponse<Void>> webhook(
            @PathVariable PaymentProvider provider,
            @RequestHeader(name = "X-Signature", defaultValue = "") String signature,
            @Valid @RequestBody WebhookEventRequest request
    ) {
        paymentService.processWebhook(provider, signature, request.toString(), request);
        return ResponseEntity.ok(ApiResponse.success("Webhook processed successfully", null));
    }
}
