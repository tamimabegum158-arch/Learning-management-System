package com.ailms.payment.repository;

import com.ailms.payment.entity.UserSubscription;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserSubscriptionRepository extends JpaRepository<UserSubscription, Long> {
    List<UserSubscription> findByUserIdAndActiveTrueOrderByCreatedAtDesc(Long userId);
}
