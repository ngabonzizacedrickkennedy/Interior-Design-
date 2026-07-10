package com.spacedesigngroup.core.service;

import com.spacedesigngroup.core.auth.User;
import com.spacedesigngroup.core.auth.UserRepository;
import com.spacedesigngroup.core.common.exception.ConflictException;
import com.spacedesigngroup.core.common.exception.ResourceNotFoundException;
import com.spacedesigngroup.core.dto.NotificationRequest;
import com.spacedesigngroup.core.dto.ProjectResponse;
import com.spacedesigngroup.core.dto.StaffAccountResponse;
import com.spacedesigngroup.core.dto.StaffMembershipResponse;
import com.spacedesigngroup.core.dto.StaffMessageResponse;
import com.spacedesigngroup.core.dto.StaffResponse;
import com.spacedesigngroup.core.model.DesignerLedgerTransactionType;
import com.spacedesigngroup.core.model.DesignerProfile;
import com.spacedesigngroup.core.model.DispatchChannel;
import com.spacedesigngroup.core.model.DocumentStatus;
import com.spacedesigngroup.core.model.Staff;
import com.spacedesigngroup.core.model.StaffInvitationStatus;
import com.spacedesigngroup.core.model.StaffLedgerTransaction;
import com.spacedesigngroup.core.model.StaffLedgerTransactionType;
import com.spacedesigngroup.core.model.StaffMembership;
import com.spacedesigngroup.core.model.StaffMembershipRole;
import com.spacedesigngroup.core.model.StaffMessage;
import com.spacedesigngroup.core.repository.DesignerProfileRepository;
import com.spacedesigngroup.core.repository.ProjectRepository;
import com.spacedesigngroup.core.repository.StaffLedgerTransactionRepository;
import com.spacedesigngroup.core.repository.StaffMembershipRepository;
import com.spacedesigngroup.core.repository.StaffMessageRepository;
import com.spacedesigngroup.core.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class StaffService {

    private final StaffRepository staffRepository;
    private final StaffMembershipRepository staffMembershipRepository;
    private final StaffMessageRepository staffMessageRepository;
    private final StaffLedgerTransactionRepository staffLedgerTransactionRepository;
    private final DesignerProfileRepository designerProfileRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ProjectService projectService;
    private final DesignerWalletService designerWalletService;
    private final NotificationService notificationService;

    public StaffResponse create(Long callerUserId, String name) {
        User creator = userRepository.findById(callerUserId)
                .orElseThrow(() -> ResourceNotFoundException.forEntity("User", callerUserId));

        Staff staff = staffRepository.save(Staff.builder().name(name).creator(creator).build());
        staffMembershipRepository.save(StaffMembership.builder()
                .staff(staff)
                .member(creator)
                .membershipRole(StaffMembershipRole.CREATOR)
                .invitationStatus(StaffInvitationStatus.ACCEPTED)
                .respondedAt(LocalDateTime.now())
                .build());

        return toResponse(staff);
    }

    public List<StaffResponse> listAll() {
        return staffRepository.findAll().stream().map(this::toResponse).toList();
    }

    public List<StaffResponse> mine(Long callerUserId) {
        return staffMembershipRepository.findByMemberIdAndInvitationStatus(callerUserId, StaffInvitationStatus.ACCEPTED)
                .stream()
                .map(m -> toResponse(m.getStaff()))
                .toList();
    }

    public StaffResponse getById(Long callerUserId, Long staffId) {
        requireAcceptedMember(staffId, callerUserId);
        return toResponse(getStaffOrThrow(staffId));
    }

    public void invite(Long callerUserId, Long staffId, List<Long> designerUserIds) {
        Staff staff = requireCreator(staffId, callerUserId);

        for (Long designerUserId : designerUserIds) {
            if (designerUserId.equals(callerUserId)) continue;

            DesignerProfile profile = designerProfileRepository.findByUserId(designerUserId).orElse(null);
            if (profile == null || profile.getApprovalStatus() != DocumentStatus.APPROVED) continue;

            boolean alreadyMember = staffMembershipRepository.findByStaffIdAndMemberId(staffId, designerUserId).isPresent();
            if (alreadyMember) continue;

            User member = userRepository.findById(designerUserId).orElse(null);
            if (member == null) continue;

            staffMembershipRepository.save(StaffMembership.builder()
                    .staff(staff)
                    .member(member)
                    .membershipRole(StaffMembershipRole.MEMBER)
                    .invitationStatus(StaffInvitationStatus.INVITED)
                    .build());

            notificationService.send(new NotificationRequest(designerUserId, DispatchChannel.IN_APP,
                    "You've been invited to join the staff team \"" + staff.getName() + "\"."));
        }
    }

    public List<StaffMembershipResponse> pendingInvitations(Long callerUserId) {
        return staffMembershipRepository.findByMemberIdAndInvitationStatus(callerUserId, StaffInvitationStatus.INVITED)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public StaffMembershipResponse respondToInvitation(Long callerUserId, Long membershipId, boolean accept) {
        StaffMembership membership = staffMembershipRepository.findById(membershipId)
                .orElseThrow(() -> ResourceNotFoundException.forEntity("StaffMembership", membershipId));

        if (!membership.getMember().getId().equals(callerUserId)) {
            throw new ResourceNotFoundException("StaffMembership not found with id " + membershipId);
        }

        membership.setInvitationStatus(accept ? StaffInvitationStatus.ACCEPTED : StaffInvitationStatus.DECLINED);
        membership.setRespondedAt(LocalDateTime.now());
        return toResponse(staffMembershipRepository.save(membership));
    }

    public List<StaffMessageResponse> messages(Long callerUserId, Long staffId, LocalDateTime since) {
        requireAcceptedMember(staffId, callerUserId);
        List<StaffMessage> messages = since != null
                ? staffMessageRepository.findByStaffIdAndCreatedAtAfterOrderByCreatedAtAsc(staffId, since)
                : staffMessageRepository.findByStaffIdOrderByCreatedAtAsc(staffId);
        return messages.stream().map(this::toResponse).toList();
    }

    public StaffMessageResponse postMessage(Long callerUserId, Long staffId, String body) {
        User sender = requireAcceptedMember(staffId, callerUserId);
        Staff staff = getStaffOrThrow(staffId);
        StaffMessage message = staffMessageRepository.save(StaffMessage.builder()
                .staff(staff)
                .sender(sender)
                .body(body)
                .build());
        return toResponse(message);
    }

    public List<ProjectResponse> projects(Long callerUserId, Long staffId) {
        requireAcceptedMember(staffId, callerUserId);
        return projectService.findByAssignedStaff(staffId);
    }

    public StaffAccountResponse account(Long callerUserId, Long staffId) {
        requireAcceptedMember(staffId, callerUserId);
        Staff staff = getStaffOrThrow(staffId);
        BigDecimal pending = projectRepository.sumPendingAmountForStaff(staffId);
        return new StaffAccountResponse(pending, staff.getAssignedBalance());
    }

    public StaffResponse split(Long callerUserId, Long staffId) {
        Staff staff = requireCreator(staffId, callerUserId);

        if (staff.getAssignedBalance().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ConflictException("There is no assigned balance to split for this staff team");
        }

        List<StaffMembership> acceptedMembers = staffMembershipRepository
                .findByStaffIdAndInvitationStatus(staffId, StaffInvitationStatus.ACCEPTED);
        int memberCount = acceptedMembers.size();

        BigDecimal totalToSplit = staff.getAssignedBalance();
        BigDecimal share = totalToSplit.divide(BigDecimal.valueOf(memberCount), 2, RoundingMode.DOWN);
        BigDecimal distributed = share.multiply(BigDecimal.valueOf(memberCount));
        BigDecimal remainder = totalToSplit.subtract(distributed);

        for (StaffMembership membership : acceptedMembers) {
            boolean isCreator = membership.getMembershipRole() == StaffMembershipRole.CREATOR;
            BigDecimal memberShare = isCreator ? share.add(remainder) : share;
            designerWalletService.creditAssignedBalance(membership.getMember().getId(), memberShare,
                    DesignerLedgerTransactionType.SPLIT_CREDIT, null, staff);
        }

        staffLedgerTransactionRepository.save(StaffLedgerTransaction.builder()
                .staff(staff)
                .type(StaffLedgerTransactionType.SPLIT_DEBIT)
                .amount(totalToSplit)
                .balanceAfter(BigDecimal.ZERO)
                .build());

        staff.setAssignedBalance(BigDecimal.ZERO);
        return toResponse(staffRepository.save(staff));
    }

    private User requireAcceptedMember(Long staffId, Long userId) {
        StaffMembership membership = staffMembershipRepository.findByStaffIdAndMemberId(staffId, userId)
                .orElseThrow(() -> ResourceNotFoundException.forEntity("Staff", staffId));
        if (membership.getInvitationStatus() != StaffInvitationStatus.ACCEPTED) {
            throw new ResourceNotFoundException("Staff not found with id " + staffId);
        }
        return membership.getMember();
    }

    private Staff requireCreator(Long staffId, Long userId) {
        Staff staff = getStaffOrThrow(staffId);
        if (!staff.getCreator().getId().equals(userId)) {
            throw new ConflictException("Only the staff creator can perform this action");
        }
        return staff;
    }

    private Staff getStaffOrThrow(Long staffId) {
        return staffRepository.findById(staffId)
                .orElseThrow(() -> ResourceNotFoundException.forEntity("Staff", staffId));
    }

    private StaffResponse toResponse(Staff staff) {
        List<StaffMembershipResponse> members = staffMembershipRepository.findByStaffId(staff.getId())
                .stream().map(this::toResponse).toList();
        return new StaffResponse(
                staff.getId(),
                staff.getName(),
                staff.getCreator().getId(),
                staff.getCreator().getFullName(),
                staff.getAssignedBalance(),
                staff.getCreatedAt(),
                members
        );
    }

    private StaffMembershipResponse toResponse(StaffMembership m) {
        return new StaffMembershipResponse(
                m.getId(),
                m.getStaff().getId(),
                m.getStaff().getName(),
                m.getMember().getId(),
                m.getMember().getFullName(),
                m.getMembershipRole(),
                m.getInvitationStatus(),
                m.getInvitedAt(),
                m.getRespondedAt()
        );
    }

    private StaffMessageResponse toResponse(StaffMessage m) {
        return new StaffMessageResponse(
                m.getId(),
                m.getStaff().getId(),
                m.getSender().getId(),
                m.getSender().getFullName(),
                m.getBody(),
                m.getCreatedAt()
        );
    }
}
