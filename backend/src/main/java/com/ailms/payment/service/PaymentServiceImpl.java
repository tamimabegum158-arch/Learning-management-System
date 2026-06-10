package com.ailms.payment.service;

import com.ailms.common.enums.RoleName;
import com.ailms.common.exception.BadRequestException;
import com.ailms.common.exception.ResourceNotFoundException;
import com.ailms.course.entity.Course;
import com.ailms.course.enums.CourseStatus;
import com.ailms.course.repository.CourseRepository;
import com.ailms.enrollment.entity.Enrollment;
import com.ailms.enrollment.repository.EnrollmentRepository;
import com.ailms.payment.dto.ConfirmPaymentRequest;
import com.ailms.payment.dto.CreateCheckoutResponse;
import com.ailms.payment.dto.CreateCourseCheckoutRequest;
import com.ailms.payment.dto.PaymentResponse;
import com.ailms.payment.dto.WebhookEventRequest;
import com.ailms.payment.entity.Payment;
import com.ailms.payment.enums.PaymentProvider;
import com.ailms.payment.enums.PaymentStatus;
import com.ailms.payment.gateway.PaymentGateway;
import com.ailms.payment.repository.PaymentRepository;
import com.ailms.user.entity.User;
import com.ailms.user.repository.UserRepository;
import com.ailms.notification.service.NotificationService;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final PaymentRepository paymentRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final List<PaymentGateway> gateways;
    private final NotificationService notificationService;

    @Value("${app.payment.webhook-secret}")
    private String webhookSecret;

    @Override
    @Transactional
    public CreateCheckoutResponse createCourseCheckout(CreateCourseCheckoutRequest request, String studentEmail) {
        User student = findStudent(studentEmail);
        Course course = findPurchasableCourse(request.courseId());
        if (paymentRepository.existsByStudentIdAndCourseIdAndStatus(student.getId(), course.getId(), PaymentStatus.SUCCESS)) {
            throw new BadRequestException("Course already purchased");
        }

        String orderRef = "ORD-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase();
        Payment payment = paymentRepository.save(Payment.builder()
                .student(student)
                .course(course)
                .amount(course.getPrice())
                .provider(request.provider())
                .status(PaymentStatus.CREATED)
                .orderReference(orderRef)
                .build());

        PaymentGateway gateway = gateway(request.provider());
        String checkoutToken = gateway.createCheckoutToken(orderRef, course.getPrice(), student.getEmail());

        return new CreateCheckoutResponse(payment.getId(), orderRef, request.provider(), course.getPrice(), checkoutToken);
    }

    @Override
    @Transactional
    public PaymentResponse confirmPayment(ConfirmPaymentRequest request, String studentEmail) {
        User student = findStudent(studentEmail);
        Payment payment = paymentRepository.findByOrderReference(request.orderReference())
                .orElseThrow(() -> new ResourceNotFoundException("Payment order not found"));
        if (!payment.getStudent().getId().equals(student.getId())) {
            throw new BadRequestException("Cannot confirm this payment");
        }

        payment.setProviderPaymentId(request.providerPaymentId());
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setPaidAt(LocalDateTime.now());
        Payment saved = paymentRepository.save(payment);
        ensureEnrollment(saved);
        notificationService.notifyUser(
                student.getId(),
                "Payment successful",
                "Payment completed for course: " + saved.getCourse().getTitle()
        );

        return toResponse(saved);
    }

    @Override
    public List<PaymentResponse> myPayments(String studentEmail) {
        User student = findStudent(studentEmail);
        return paymentRepository.findByStudentIdOrderByCreatedAtDesc(student.getId())
                .stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public void processWebhook(PaymentProvider provider, String signature, String rawPayload, WebhookEventRequest event) {
        PaymentGateway gateway = gateway(provider);
        if (!gateway.verifyWebhookSignature(rawPayload, signature, webhookSecret)) {
            throw new BadRequestException("Invalid webhook signature");
        }

        Payment payment = paymentRepository.findByOrderReference(event.orderReference())
                .orElseThrow(() -> new ResourceNotFoundException("Payment order not found"));
        payment.setProviderPaymentId(event.providerPaymentId());
        payment.setStatus(event.status());
        if (event.status() == PaymentStatus.SUCCESS) {
            payment.setPaidAt(LocalDateTime.now());
        }
        Payment saved = paymentRepository.save(payment);
        if (saved.getStatus() == PaymentStatus.SUCCESS) {
            ensureEnrollment(saved);
            notificationService.notifyUser(
                    saved.getStudent().getId(),
                    "Payment webhook confirmed",
                    "Your payment was confirmed for course: " + saved.getCourse().getTitle()
            );
        }
    }

    private PaymentGateway gateway(PaymentProvider provider) {
        PaymentGateway gateway = gateways.stream()
                .collect(java.util.stream.Collectors.toMap(PaymentGateway::provider, Function.identity()))
                .get(provider);
        if (gateway == null) {
            throw new BadRequestException("Unsupported payment provider: " + provider);
        }
        return gateway;
    }

    private User findStudent(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getRole().getName() != RoleName.STUDENT) {
            throw new BadRequestException("Operation requires role: STUDENT");
        }
        return user;
    }

    private Course findPurchasableCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        if (course.getStatus() != CourseStatus.PUBLISHED || !course.isActive()) {
            throw new BadRequestException("Course is not available for purchase");
        }
        return course;
    }

    private void ensureEnrollment(Payment payment) {
        if (!enrollmentRepository.existsByStudentIdAndCourseId(payment.getStudent().getId(), payment.getCourse().getId())) {
            enrollmentRepository.save(Enrollment.builder()
                    .student(payment.getStudent())
                    .course(payment.getCourse())
                    .progressPercentage(0.0)
                    .build());
        }
    }

    private PaymentResponse toResponse(Payment payment) {
        return new PaymentResponse(
                payment.getId(),
                payment.getCourse().getId(),
                payment.getCourse().getTitle(),
                payment.getAmount(),
                payment.getProvider(),
                payment.getStatus(),
                payment.getOrderReference(),
                payment.getProviderPaymentId(),
                payment.getPaidAt()
        );
    }
}
