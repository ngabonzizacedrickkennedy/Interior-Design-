package com.spacedesigngroup.core.service;

import com.spacedesigngroup.core.dto.SiteBackgroundVideoResponse;
import com.spacedesigngroup.core.model.SiteBackgroundVideo;
import com.spacedesigngroup.core.repository.SiteBackgroundVideoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class SiteBackgroundVideoService {

    private final SiteBackgroundVideoRepository repository;
    private final S3Service s3Service;

    public SiteBackgroundVideoResponse getCurrent() {
        return repository.findFirstByOrderByIdDesc()
                .map(this::toResponse)
                .orElse(new SiteBackgroundVideoResponse(null, null, null));
    }

    public SiteBackgroundVideoResponse upload(MultipartFile file) throws IOException {
        String key = s3Service.uploadSiteVideo(file);

        SiteBackgroundVideo video = repository.findFirstByOrderByIdDesc()
                .orElseGet(SiteBackgroundVideo::new);
        video.setVideoFileKey(key);
        video.setOriginalFilename(file.getOriginalFilename());
        video.setUpdatedAt(LocalDateTime.now());

        return toResponse(repository.save(video));
    }

    private SiteBackgroundVideoResponse toResponse(SiteBackgroundVideo v) {
        return new SiteBackgroundVideoResponse(
                v.getVideoFileKey() != null ? s3Service.publicUrl(v.getVideoFileKey()) : null,
                v.getOriginalFilename(),
                v.getUpdatedAt()
        );
    }
}
