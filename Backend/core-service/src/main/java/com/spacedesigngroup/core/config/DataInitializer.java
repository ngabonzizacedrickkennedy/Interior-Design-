package com.spacedesigngroup.core.config;

import com.spacedesigngroup.core.auth.Role;
import com.spacedesigngroup.core.auth.User;
import com.spacedesigngroup.core.auth.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private static final String ADMIN_EMAIL = "cedrickngabo03@gmail.com";
    private static final String ADMIN_PASSWORD = "TT4242@mtskr";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (userRepository.existsByEmail(ADMIN_EMAIL)) {
            log.info("Admin account already present, skipping initializer.");
            return;
        }

        userRepository.save(User.builder()
                .fullName("Cedrick Ngabo")
                .email(ADMIN_EMAIL)
                .passwordHash(passwordEncoder.encode(ADMIN_PASSWORD))
                .role(Role.ADMIN)
                .enabled(true)
                .build());

        log.info("Admin account created: {}", ADMIN_EMAIL);
    }
}
