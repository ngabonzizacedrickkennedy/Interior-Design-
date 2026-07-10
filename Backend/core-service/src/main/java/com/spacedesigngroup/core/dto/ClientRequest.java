package com.spacedesigngroup.core.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ClientRequest(
        @NotBlank String contactName,
        @NotBlank @Email String contactEmail,
        String contactPhone,
        String propertyType
) {}
