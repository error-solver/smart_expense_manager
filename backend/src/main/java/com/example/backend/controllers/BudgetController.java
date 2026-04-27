package com.example.backend.controllers;

import com.example.backend.dto.BudgetDto;
import com.example.backend.services.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @PostMapping
    public ResponseEntity<BudgetDto> setBudget(@org.springframework.security.core.annotation.AuthenticationPrincipal com.example.backend.entities.User user, @RequestBody BudgetDto budgetDto) {
        return new ResponseEntity<>(budgetService.setBudget(user.getId(), budgetDto), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<BudgetDto>> getBudgets(@org.springframework.security.core.annotation.AuthenticationPrincipal com.example.backend.entities.User user) {
        return ResponseEntity.ok(budgetService.getBudgetsByUser(user.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(@PathVariable Long id) {
        budgetService.deleteBudget(id);
        return ResponseEntity.noContent().build();
    }
}
