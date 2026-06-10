package com.ailms.config;

import com.ailms.common.enums.RoleName;
import com.ailms.role.entity.Role;
import com.ailms.role.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@Profile({"dev", "test", "h2"})
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) {
        log.info("Initializing roles in database...");
        for (RoleName roleName : RoleName.values()) {
            roleRepository.findByName(roleName)
                    .orElseGet(() -> {
                        log.info("Creating role: {}", roleName);
                        return roleRepository.save(Role.builder().name(roleName).build());
                    });
        }
        log.info("Roles initialized successfully: {}", RoleName.values().length);
    }
}
