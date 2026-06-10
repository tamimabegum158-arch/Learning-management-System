package com.ailms.role.repository;

import com.ailms.common.enums.RoleName;
import com.ailms.role.entity.Role;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(RoleName name);
}
