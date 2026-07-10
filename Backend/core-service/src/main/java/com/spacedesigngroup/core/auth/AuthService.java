package com.spacedesigngroup.core.auth;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.spacedesigngroup.core.dto.AuthResponse;
import com.spacedesigngroup.core.dto.ForgotPasswordRequest;
import com.spacedesigngroup.core.dto.GoogleAuthRequest;
import com.spacedesigngroup.core.dto.LoginRequest;
import com.spacedesigngroup.core.dto.LoginResponse;
import com.spacedesigngroup.core.dto.RegisterRequest;
import com.spacedesigngroup.core.dto.ResetPasswordRequest;
import com.spacedesigngroup.core.dto.VerifyOtpRequest;
import com.spacedesigngroup.core.common.exception.ResourceNotFoundException;
import com.spacedesigngroup.core.model.Client;
import com.spacedesigngroup.core.repository.ClientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private static final int OTP_VALID_MINUTES = 10;
    private static final int RESET_TOKEN_VALID_MINUTES = 30;

    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final MailService mailService;
    private final GoogleIdTokenVerifier googleIdTokenVerifier;

    public LoginResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already in use: " + request.email());
        }
        if (request.role() == Role.ADMIN || request.role() == Role.PROJECT_MANAGER) {
            throw new IllegalArgumentException(
                    "This role cannot be self-registered. Contact an administrator.");
        }
        User user = User.builder()
                .fullName(request.fullName())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(request.role())
                .build();
        User saved = userRepository.save(user);

        if (saved.getRole() == Role.CLIENT) {
            clientRepository.save(Client.builder()
                    .user(saved)
                    .contactName(saved.getFullName())
                    .contactEmail(saved.getEmail())
                    .build());
        }

        return challengeOrSignIn(saved);
    }

    public User createManager(com.spacedesigngroup.core.dto.CreateManagerRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already in use: " + request.email());
        }
        User user = User.builder()
                .fullName(request.fullName())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(Role.PROJECT_MANAGER)
                .firstLoginVerified(true)
                .build();
        User saved = userRepository.save(user);
        mailService.sendManagerWelcomeEmail(saved.getEmail(), saved.getFullName(), request.password());
        return saved;
    }

    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.email()));
        return challengeOrSignIn(user);
    }

    public AuthResponse verifyOtp(VerifyOtpRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new UsernameNotFoundException(
                        "No account found with email: " + request.email()));

        boolean codeMatches = user.getOtpCode() != null && user.getOtpCode().equals(request.code());
        boolean notExpired = user.getOtpExpiresAt() != null && user.getOtpExpiresAt().isAfter(LocalDateTime.now());

        if (!codeMatches || !notExpired) {
            throw new IllegalArgumentException("That code is invalid or has expired.");
        }

        user.setFirstLoginVerified(true);
        user.setOtpCode(null);
        user.setOtpExpiresAt(null);
        userRepository.save(user);

        return buildResponse(user);
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new UsernameNotFoundException(
                        "No account found with email: " + request.email()));

        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiresAt(LocalDateTime.now().plusMinutes(RESET_TOKEN_VALID_MINUTES));
        userRepository.save(user);

        mailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), token);
    }

    public LoginResponse googleAuth(GoogleAuthRequest request) {
        GoogleIdToken.Payload payload = verifyGoogleToken(request.idToken());
        String email = payload.getEmail();

        return userRepository.findByEmail(email)
                .map(existing -> LoginResponse.success(buildResponse(existing)))
                .orElseGet(() -> registerFromGoogle(payload, request.role()));
    }

    private GoogleIdToken.Payload verifyGoogleToken(String idToken) {
        GoogleIdToken token;
        try {
            token = googleIdTokenVerifier.verify(idToken);
        } catch (Exception ex) {
            throw new IllegalArgumentException("Could not verify Google sign-in. Please try again.");
        }
        if (token == null || !Boolean.TRUE.equals(token.getPayload().getEmailVerified())) {
            throw new IllegalArgumentException("Could not verify Google sign-in. Please try again.");
        }
        return token.getPayload();
    }

    private LoginResponse registerFromGoogle(GoogleIdToken.Payload payload, Role role) {
        if (role != Role.CLIENT && role != Role.STAFF) {
            throw new IllegalArgumentException("Choose whether you are a client or a designer to finish signing up.");
        }
        String fullName = (String) payload.get("name");
        User user = User.builder()
                .fullName(fullName != null ? fullName : payload.getEmail())
                .email(payload.getEmail())
                .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                .role(role)
                .firstLoginVerified(true)
                .build();
        User saved = userRepository.save(user);

        if (saved.getRole() == Role.CLIENT) {
            clientRepository.save(Client.builder()
                    .user(saved)
                    .contactName(saved.getFullName())
                    .contactEmail(saved.getEmail())
                    .build());
        }

        return LoginResponse.success(buildResponse(saved));
    }

    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetToken(request.token())
                .orElseThrow(() -> new IllegalArgumentException("This reset link is invalid or has expired."));

        boolean notExpired = user.getResetTokenExpiresAt() != null
                && user.getResetTokenExpiresAt().isAfter(LocalDateTime.now());
        if (!notExpired) {
            throw new IllegalArgumentException("This reset link is invalid or has expired.");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiresAt(null);
        userRepository.save(user);
    }

    private LoginResponse challengeOrSignIn(User user) {
        if (!user.isFirstLoginVerified()) {
            String otp = generateOtp();
            user.setOtpCode(otp);
            user.setOtpExpiresAt(LocalDateTime.now().plusMinutes(OTP_VALID_MINUTES));
            userRepository.save(user);
            mailService.sendOtpEmail(user.getEmail(), user.getFullName(), otp);
            return LoginResponse.otpRequired(user.getEmail());
        }
        return LoginResponse.success(buildResponse(user));
    }

    private String generateOtp() {
        int code = new SecureRandom().nextInt(900_000) + 100_000;
        return String.valueOf(code);
    }

    private AuthResponse buildResponse(User user) {
        String token = jwtUtil.generateToken(user);
        return new AuthResponse(token, user.getId(), user.getEmail(), user.getFullName(), user.getRole());
    }
}
