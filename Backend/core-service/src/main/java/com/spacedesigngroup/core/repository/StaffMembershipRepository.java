package com.spacedesigngroup.core.repository;

import com.spacedesigngroup.core.model.StaffInvitationStatus;
import com.spacedesigngroup.core.model.StaffMembership;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StaffMembershipRepository extends JpaRepository<StaffMembership, Long> {

    List<StaffMembership> findByStaffId(Long staffId);

    List<StaffMembership> findByMemberIdAndInvitationStatus(Long memberId, StaffInvitationStatus invitationStatus);

    Optional<StaffMembership> findByStaffIdAndMemberId(Long staffId, Long memberId);

    List<StaffMembership> findByStaffIdAndInvitationStatus(Long staffId, StaffInvitationStatus invitationStatus);
}
