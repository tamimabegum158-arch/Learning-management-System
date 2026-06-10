package com.ailms.payment.repository;

import com.ailms.payment.entity.Payment;
import com.ailms.payment.enums.PaymentStatus;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByOrderReference(String orderReference);
    List<Payment> findByStudentIdOrderByCreatedAtDesc(Long studentId);
    boolean existsByStudentIdAndCourseIdAndStatus(Long studentId, Long courseId, PaymentStatus status);
    long countByStatus(PaymentStatus status);

    @Query("select coalesce(sum(p.amount), 0) from Payment p where p.status = 'SUCCESS'")
    BigDecimal totalSuccessfulRevenue();
}
