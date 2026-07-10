package com.spacedesigngroup.core.service;

import com.spacedesigngroup.core.auth.User;
import com.spacedesigngroup.core.auth.UserRepository;
import com.spacedesigngroup.core.common.exception.ConflictException;
import com.spacedesigngroup.core.common.exception.ResourceNotFoundException;
import com.spacedesigngroup.core.dto.DesignerLedgerTransactionResponse;
import com.spacedesigngroup.core.dto.DesignerWalletResponse;
import com.spacedesigngroup.core.model.DesignerLedgerTransaction;
import com.spacedesigngroup.core.model.DesignerLedgerTransactionType;
import com.spacedesigngroup.core.model.DesignerWallet;
import com.spacedesigngroup.core.model.ProjectRecord;
import com.spacedesigngroup.core.model.Staff;
import com.spacedesigngroup.core.repository.DesignerLedgerTransactionRepository;
import com.spacedesigngroup.core.repository.DesignerWalletRepository;
import com.spacedesigngroup.core.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class DesignerWalletService {

    private final DesignerWalletRepository designerWalletRepository;
    private final DesignerLedgerTransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    public DesignerWalletResponse getOrCreate(Long userId) {
        return toResponse(getOrCreateWallet(userId));
    }

    public List<DesignerLedgerTransactionResponse> transactions(Long userId) {
        DesignerWallet wallet = getOrCreateWallet(userId);
        return transactionRepository.findByWalletIdOrderByCreatedAtDesc(wallet.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    public DesignerWalletResponse transfer(Long userId, BigDecimal amount) {
        DesignerWallet wallet = getOrCreateWallet(userId);
        if (wallet.getAssignedBalance().compareTo(amount) < 0) {
            throw new ConflictException("Insufficient assigned balance to transfer");
        }

        wallet.setAssignedBalance(wallet.getAssignedBalance().subtract(amount));
        wallet.setPersonalBalance(wallet.getPersonalBalance().add(amount));
        wallet = designerWalletRepository.save(wallet);

        transactionRepository.save(DesignerLedgerTransaction.builder()
                .wallet(wallet)
                .type(DesignerLedgerTransactionType.TRANSFER_TO_PERSONAL)
                .amount(amount)
                .balanceAfter(wallet.getAssignedBalance())
                .build());

        return toResponse(wallet);
    }

    public DesignerWallet creditAssignedBalance(Long userId, BigDecimal amount, DesignerLedgerTransactionType type,
                                                 ProjectRecord relatedProject, Staff relatedStaff) {
        DesignerWallet wallet = getOrCreateWallet(userId);
        wallet.setAssignedBalance(wallet.getAssignedBalance().add(amount));
        wallet = designerWalletRepository.save(wallet);

        transactionRepository.save(DesignerLedgerTransaction.builder()
                .wallet(wallet)
                .type(type)
                .amount(amount)
                .relatedProject(relatedProject)
                .relatedStaff(relatedStaff)
                .balanceAfter(wallet.getAssignedBalance())
                .build());

        return wallet;
    }

    private DesignerWallet getOrCreateWallet(Long userId) {
        return designerWalletRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> ResourceNotFoundException.forEntity("User", userId));
            return designerWalletRepository.save(DesignerWallet.builder().user(user).build());
        });
    }

    private DesignerWalletResponse toResponse(DesignerWallet w) {
        BigDecimal pending = projectRepository.sumPendingAmountForDesigner(w.getUser().getId());
        return new DesignerWalletResponse(w.getId(), w.getAssignedBalance(), w.getPersonalBalance(), pending);
    }

    private DesignerLedgerTransactionResponse toResponse(DesignerLedgerTransaction t) {
        return new DesignerLedgerTransactionResponse(
                t.getId(),
                t.getType(),
                t.getAmount(),
                t.getRelatedProject() != null ? t.getRelatedProject().getId() : null,
                t.getRelatedStaff() != null ? t.getRelatedStaff().getId() : null,
                t.getBalanceAfter(),
                t.getCreatedAt()
        );
    }
}
