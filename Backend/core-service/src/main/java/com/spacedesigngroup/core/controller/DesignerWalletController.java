package com.spacedesigngroup.core.controller;

import com.spacedesigngroup.core.auth.User;
import com.spacedesigngroup.core.dto.DesignerLedgerTransactionResponse;
import com.spacedesigngroup.core.dto.DesignerTransferRequest;
import com.spacedesigngroup.core.dto.DesignerWalletResponse;
import com.spacedesigngroup.core.service.DesignerWalletService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/designer-wallet")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STAFF')")
public class DesignerWalletController {

    private final DesignerWalletService designerWalletService;

    @GetMapping("/me")
    public DesignerWalletResponse me(@AuthenticationPrincipal User caller) {
        return designerWalletService.getOrCreate(caller.getId());
    }

    @GetMapping("/me/transactions")
    public List<DesignerLedgerTransactionResponse> transactions(@AuthenticationPrincipal User caller) {
        return designerWalletService.transactions(caller.getId());
    }

    @PostMapping("/me/transfer")
    public DesignerWalletResponse transfer(@AuthenticationPrincipal User caller, @Valid @RequestBody DesignerTransferRequest body) {
        return designerWalletService.transfer(caller.getId(), body.amount());
    }
}
