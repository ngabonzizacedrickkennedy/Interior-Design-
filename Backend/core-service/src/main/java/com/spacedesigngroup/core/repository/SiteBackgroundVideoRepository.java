package com.spacedesigngroup.core.repository;

import com.spacedesigngroup.core.model.SiteBackgroundVideo;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SiteBackgroundVideoRepository extends JpaRepository<SiteBackgroundVideo, Long> {

    Optional<SiteBackgroundVideo> findFirstByOrderByIdDesc();
}
