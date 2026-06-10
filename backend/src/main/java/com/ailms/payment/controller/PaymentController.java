package com.ailms.payment.controller;

import com.ailms.common.dto.ApiResponse;
import com.ailms.payment.dto.ConfirmPaymentRequest;
import com.ailms.payment.dto.CreateCheckoutResponse;
import com.ailms.payment.dto.CreateCourseCheckoutRequest;
import com.ailms.payment.dto.PaymentResponse;
import com.ailms.payment.service.PaymentService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/student/payments")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<CreateCheckoutResponse>> checkout(
            @Valid @RequestBody CreateCourseCheckoutRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Checkout created successfully",
                paymentService.createCourseCheckout(request, authentication.getName())
        ));
    }

    @PostMapping("/confirm")
    public ResponseEntity<ApiResponse<PaymentResponse>> confirm(
            @Valid @RequestBody ConfirmPaymentRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Payment confirmed successfully",
                paymentService.confirmPayment(request, authentication.getName())
        ));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> history(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(
                "Payment history fetched successfully",
                paymentService.myPayments(authentication.getName())
        ));
    }
}
