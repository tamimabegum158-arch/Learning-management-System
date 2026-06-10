package com.ailms.user.repository;

import com.ailms.user.entity.User;
import com.ailms.common.enums.RoleName;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    long countByRole_Name(RoleName roleName);
    Page<User> findByRole_Name(RoleName roleName, Pageable pageable);
}
