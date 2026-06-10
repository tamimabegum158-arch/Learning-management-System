package com.ailms.auth.service;

import com.ailms.auth.dto.ForgotPasswordRequest;
import com.ailms.auth.dto.JwtAuthResponse;
import com.ailms.auth.dto.LoginRequest;
import com.ailms.auth.dto.RegisterRequest;
import com.ailms.auth.dto.ResetPasswordRequest;

public interface AuthService {
    JwtAuthResponse registerStudent(RegisterRequest request);
    JwtAuthResponse registerInstructor(RegisterRequest request);
    JwtAuthResponse login(LoginRequest request);
    void forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
    void verifyEmail(String token);
}
