package com.spacedesigngroup.core.service;

import com.spacedesigngroup.core.common.exception.ConflictException;
import com.spacedesigngroup.core.dto.WalletDepositRequest;
import com.spacedesigngroup.core.dto.WalletInvestRequest;
import com.spacedesigngroup.core.dto.WalletResponse;
import com.spacedesigngroup.core.dto.WalletTransactionResponse;
import com.spacedesigngroup.core.model.Client;
import com.spacedesigngroup.core.model.InvestmentStatus;
import com.spacedesigngroup.core.model.ServiceRequest;
import com.spacedesigngroup.core.model.Wallet;
import com.spacedesigngroup.core.model.WalletTransaction;
import com.spacedesigngroup.core.model.WalletTransactionType;
import com.spacedesigngroup.core.repository.WalletRepository;
import com.spacedesigngroup.core.repository.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class WalletService {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository transactionRepository;
    private final ServiceRequestService serviceRequestService;
    private final ProjectService projectService;

    public WalletResponse getOrCreate(Long callerUserId) {
        return toResponse(getOrCreateWallet(callerUserId));
    }

    public WalletResponse deposit(Long callerUserId, WalletDepositRequest body) {
        Wallet wallet = getOrCreateWallet(callerUserId);
        wallet.setBalance(wallet.getBalance().add(body.amount()));
        wallet = walletRepository.save(wallet);

        transactionRepository.save(WalletTransaction.builder()
                .wallet(wallet)
                .type(WalletTransactionType.DEPOSIT)
                .amount(body.amount())
                .method(body.method())
                .balanceAfter(wallet.getBalance())
                .build());

        return toResponse(wallet);
    }

    public WalletResponse invest(Long callerUserId, WalletInvestRequest body) {
        Wallet wallet = getOrCreateWallet(callerUserId);
        ServiceRequest request = serviceRequestService.getOwnedOrThrow(body.requestId(), callerUserId);

        if (request.getInvestmentStatus() == InvestmentStatus.INVESTED) {
            throw new ConflictException("This request has already been invested in");
        }
        if (wallet.getBalance().compareTo(body.amount()) < 0) {
            throw new ConflictException("Insufficient wallet balance for this investment");
        }

        wallet.setBalance(wallet.getBalance().subtract(body.amount()));
        wallet = walletRepository.save(wallet);

        request.setInvestmentStatus(InvestmentStatus.INVESTED);
        request.setInvestedAmount(body.amount());
        request.setInvestedAt(LocalDateTime.now());
        projectService.markReadyIfFunded(request.getId());

        transactionRepository.save(WalletTransaction.builder()
                .wallet(wallet)
                .type(WalletTransactionType.INVESTMENT)
                .amount(body.amount())
                .relatedRequest(request)
                .balanceAfter(wallet.getBalance())
                .build());

        return toResponse(wallet);
    }

    public List<WalletTransactionResponse> transactions(Long callerUserId) {
        Wallet wallet = getOrCreateWallet(callerUserId);
        return transactionRepository.findByWalletIdOrderByCreatedAtDesc(wallet.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    private Wallet getOrCreateWallet(Long callerUserId) {
        Client client = serviceRequestService.requireClientByUserId(callerUserId);
        return walletRepository.findByClientId(client.getId())
                .orElseGet(() -> walletRepository.save(Wallet.builder()
                        .client(client)
                        .balance(BigDecimal.ZERO)
                        .build()));
    }

    private WalletResponse toResponse(Wallet wallet) {
        return new WalletResponse(wallet.getId(), wallet.getClient().getId(), wallet.getBalance());
    }

    private WalletTransactionResponse toResponse(WalletTransaction t) {
        return new WalletTransactionResponse(
                t.getId(),
                t.getType(),
                t.getAmount(),
                t.getMethod(),
                t.getRelatedRequest() != null ? t.getRelatedRequest().getId() : null,
                t.getBalanceAfter(),
                t.getCreatedAt()
        );
    }
}
