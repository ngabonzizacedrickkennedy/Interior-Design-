package com.spacedesigngroup.core.controller;

import com.spacedesigngroup.core.auth.User;
import com.spacedesigngroup.core.dto.WalletDepositRequest;
import com.spacedesigngroup.core.dto.WalletInvestRequest;
import com.spacedesigngroup.core.dto.WalletResponse;
import com.spacedesigngroup.core.dto.WalletTransactionResponse;
import com.spacedesigngroup.core.service.WalletService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CLIENT')")
public class WalletController {

    private final WalletService walletService;

    @GetMapping("/me")
    public WalletResponse me(@AuthenticationPrincipal User caller) {
        return walletService.getOrCreate(caller.getId());
    }

    @GetMapping("/me/transactions")
    public List<WalletTransactionResponse> transactions(@AuthenticationPrincipal User caller) {
        return walletService.transactions(caller.getId());
    }

    @PostMapping("/deposit")
    public WalletResponse deposit(@AuthenticationPrincipal User caller, @Valid @RequestBody WalletDepositRequest body) {
        return walletService.deposit(caller.getId(), body);
    }

    @PostMapping("/invest")
    public WalletResponse invest(@AuthenticationPrincipal User caller, @Valid @RequestBody WalletInvestRequest body) {
        return walletService.invest(caller.getId(), body);
    }
}
