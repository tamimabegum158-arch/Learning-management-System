package com.ailms.auth.service;

import com.ailms.auth.dto.ForgotPasswordRequest;
import com.ailms.auth.dto.JwtAuthResponse;
import com.ailms.auth.dto.LoginRequest;
import com.ailms.auth.dto.RegisterRequest;
import com.ailms.auth.dto.ResetPasswordRequest;
import com.ailms.auth.entity.PasswordResetToken;
import com.ailms.auth.entity.VerificationToken;
import com.ailms.auth.repository.PasswordResetTokenRepository;
import com.ailms.auth.repository.VerificationTokenRepository;
import com.ailms.common.enums.RoleName;
import com.ailms.common.exception.BadRequestException;
import com.ailms.common.exception.ResourceNotFoundException;
import com.ailms.role.entity.Role;
import com.ailms.role.repository.RoleRepository;
import com.ailms.security.AppUserPrincipal;
import com.ailms.security.JwtService;
import com.ailms.user.entity.User;
import com.ailms.user.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Override
    @Transactional
    public JwtAuthResponse registerStudent(RegisterRequest request) {
        return registerByRole(request, RoleName.STUDENT);
    }

    @Override
    @Transactional
    public JwtAuthResponse registerInstructor(RegisterRequest request) {
        return registerByRole(request, RoleName.INSTRUCTOR);
    }

    @Override
    public JwtAuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password())
            );
        } catch (DisabledException ex) {
            throw new BadRequestException("Email is not verified yet");
        } catch (BadCredentialsException ex) {
            throw new BadRequestException("Invalid email or password");
        }

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        String accessToken = jwtService.generateAccessToken(new AppUserPrincipal(user), Map.of(
                "role", user.getRole().getName().name(),
                "uid", user.getId()
        ));

        return new JwtAuthResponse(accessToken, "Bearer", user.getId(), user.getEmail(), user.getRole().getName().name());
    }

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with this email"));

        PasswordResetToken token = PasswordResetToken.builder()
                .token(UUID.randomUUID().toString())
                .user(user)
                .expiryDate(LocalDateTime.now().plusMinutes(30))
                .build();
        passwordResetTokenRepository.save(token);
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.token())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid reset token"));

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Reset token has expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        passwordResetTokenRepository.delete(resetToken);
    }

    @Override
    @Transactional
    public void verifyEmail(String token) {
        VerificationToken verificationToken = verificationTokenRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid verification token"));

        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Verification token has expired");
        }

        User user = verificationToken.getUser();
        user.setEnabled(true);
        userRepository.save(user);
        verificationTokenRepository.delete(verificationToken);
    }

    private JwtAuthResponse registerByRole(RegisterRequest request, RoleName roleName) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Email is already registered");
        }

        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role not configured: " + roleName));

        User user = User.builder()
                .fullName(request.fullName())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(role)
                .enabled(true)
                .build();
        userRepository.save(user);

        String accessToken = jwtService.generateAccessToken(new AppUserPrincipal(user), Map.of(
                "role", roleName.name(),
                "uid", user.getId()
        ));

        return new JwtAuthResponse(accessToken, "Bearer", user.getId(), user.getEmail(), roleName.name());
    }
}
