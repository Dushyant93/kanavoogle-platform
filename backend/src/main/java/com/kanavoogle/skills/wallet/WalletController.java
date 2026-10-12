package com.kanavoogle.skills.wallet;

import com.kanavoogle.skills.security.SecurityUtils;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wallet")
@PreAuthorize("hasRole('STUDENT')")
public class WalletController {
    private final WalletService wallet;

    public WalletController(WalletService wallet) {
        this.wallet = wallet;
    }

    @GetMapping("/me")
    public WalletService.Wallet me() {
        return wallet.forStudent(SecurityUtils.current().userId());
    }
}
