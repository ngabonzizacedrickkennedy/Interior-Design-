package com.spacedesigngroup.core.service;

import com.spacedesigngroup.core.auth.User;
import com.spacedesigngroup.core.auth.UserRepository;
import com.spacedesigngroup.core.common.exception.ResourceNotFoundException;
import com.spacedesigngroup.core.dto.UpdateProfileRequest;
import com.spacedesigngroup.core.dto.UserProfileResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final S3Service s3Service;

    public UserProfileResponse getProfile(Long userId) {
        return toResponse(getOrThrow(userId));
    }

    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest body) {
        User user = getOrThrow(userId);
        user.setFullName(body.fullName());
        userRepository.save(user);
        return toResponse(user);
    }

    public UserProfileResponse updateAvatar(Long userId, MultipartFile file) throws IOException {
        User user = getOrThrow(userId);
        String oldKey = user.getAvatarKey();

        String newKey = s3Service.uploadAvatar(file, userId);
        user.setAvatarKey(newKey);
        userRepository.save(user);

        if (oldKey != null) {
            try {
                s3Service.deleteObject(oldKey);
            } catch (Exception ignored) {
            }
        }
        return toResponse(user);
    }

    private User getOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.forEntity("User", userId));
    }

    private UserProfileResponse toResponse(User user) {
        String avatarUrl = user.getAvatarKey() != null ? s3Service.publicUrl(user.getAvatarKey()) : null;
        return new UserProfileResponse(user.getId(), user.getFullName(), user.getEmail(), user.getRole(), avatarUrl);
    }
}
