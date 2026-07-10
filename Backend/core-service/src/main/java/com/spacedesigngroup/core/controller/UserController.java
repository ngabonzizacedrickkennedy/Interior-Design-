package com.spacedesigngroup.core.controller;

import com.spacedesigngroup.core.auth.User;
import com.spacedesigngroup.core.dto.UpdateProfileRequest;
import com.spacedesigngroup.core.dto.UserProfileResponse;
import com.spacedesigngroup.core.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public UserProfileResponse me(@AuthenticationPrincipal User caller) {
        return userService.getProfile(caller.getId());
    }

    @PatchMapping("/me")
    public UserProfileResponse updateProfile(@AuthenticationPrincipal User caller,
                                              @Valid @RequestBody UpdateProfileRequest body) {
        return userService.updateProfile(caller.getId(), body);
    }

    @PostMapping(value = "/me/avatar", consumes = "multipart/form-data")
    public UserProfileResponse uploadAvatar(@AuthenticationPrincipal User caller,
                                             @RequestPart("file") MultipartFile file) throws IOException {
        return userService.updateAvatar(caller.getId(), file);
    }
}
