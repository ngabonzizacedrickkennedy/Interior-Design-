package com.spacedesigngroup.core.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

@Service
public class S3Service {

    @Value("${aws.region}")
    private String region;

    @Value("${aws.access-key-id}")
    private String accessKeyId;

    @Value("${aws.secret-access-key}")
    private String secretAccessKey;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    private S3Client client() {
        return S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKeyId, secretAccessKey)))
                .build();
    }

    public String uploadFile(MultipartFile file, String category, Long requestId) throws IOException {
        String originalName = file.getOriginalFilename() == null ? "file" : file.getOriginalFilename();
        String sanitized = originalName.replaceAll("[^a-zA-Z0-9._-]", "_");
        String key = "requests/%d/%s/%s-%s".formatted(requestId, category.toLowerCase(), UUID.randomUUID(), sanitized);

        try (S3Client s3 = client()) {
            s3.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucketName)
                            .key(key)
                            .contentType(file.getContentType())
                            .build(),
                    RequestBody.fromBytes(file.getBytes())
            );
        }
        return key;
    }

    public String uploadAvatar(MultipartFile file, Long userId) throws IOException {
        String originalName = file.getOriginalFilename() == null ? "avatar" : file.getOriginalFilename();
        String sanitized = originalName.replaceAll("[^a-zA-Z0-9._-]", "_");
        String key = "avatars/%d/%s-%s".formatted(userId, UUID.randomUUID(), sanitized);

        try (S3Client s3 = client()) {
            s3.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucketName)
                            .key(key)
                            .contentType(file.getContentType())
                            .build(),
                    RequestBody.fromBytes(file.getBytes())
            );
        }
        return key;
    }

    public String uploadDesignerCv(MultipartFile file, Long userId) throws IOException {
        String originalName = file.getOriginalFilename() == null ? "cv" : file.getOriginalFilename();
        String sanitized = originalName.replaceAll("[^a-zA-Z0-9._-]", "_");
        String key = "designer-profiles/%d/cv/%s-%s".formatted(userId, UUID.randomUUID(), sanitized);

        try (S3Client s3 = client()) {
            s3.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucketName)
                            .key(key)
                            .contentType(file.getContentType())
                            .build(),
                    RequestBody.fromBytes(file.getBytes())
            );
        }
        return key;
    }

    public String uploadSiteVideo(MultipartFile file) throws IOException {
        String originalName = file.getOriginalFilename() == null ? "video" : file.getOriginalFilename();
        String sanitized = originalName.replaceAll("[^a-zA-Z0-9._-]", "_");
        String key = "site/auth-background/%s-%s".formatted(UUID.randomUUID(), sanitized);

        try (S3Client s3 = client()) {
            s3.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucketName)
                            .key(key)
                            .contentType(file.getContentType())
                            .build(),
                    RequestBody.fromBytes(file.getBytes())
            );
        }
        return key;
    }

    public String uploadStagedImage(byte[] imageBytes, Long requestId) {
        String key = "requests/%d/staged/%s.png".formatted(requestId, UUID.randomUUID());

        try (S3Client s3 = client()) {
            s3.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucketName)
                            .key(key)
                            .contentType("image/png")
                            .build(),
                    RequestBody.fromBytes(imageBytes)
            );
        }
        return key;
    }

    public String publicUrl(String s3Key) {
        return "https://%s.s3.%s.amazonaws.com/%s".formatted(bucketName, region, s3Key);
    }

    public void deleteObject(String s3Key) {
        try (S3Client s3 = client()) {
            s3.deleteObject(builder -> builder.bucket(bucketName).key(s3Key));
        }
    }
}
