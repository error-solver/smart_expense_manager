package com.example.backend.controllers;

import com.example.backend.dto.ExpenseDto;
import com.example.backend.services.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping
    public ResponseEntity<ExpenseDto> addExpense(@org.springframework.security.core.annotation.AuthenticationPrincipal com.example.backend.entities.User user, @RequestBody ExpenseDto expenseDto) {
        return new ResponseEntity<>(expenseService.addExpense(user.getId(), expenseDto), HttpStatus.CREATED);
    }

    @PostMapping("/upload-receipt")
    public ResponseEntity<ExpenseDto> uploadReceipt() {
        ExpenseDto parsedDto = new ExpenseDto();
        parsedDto.setAmount(new java.math.BigDecimal("42.50"));
        parsedDto.setDescription("Restaurant Bill");
        parsedDto.setDate(java.time.LocalDate.now());
        // Simple artificial delay could be added, but returning immediately is fine for mock.
        return ResponseEntity.ok(parsedDto);
    }


    @GetMapping
    public ResponseEntity<List<ExpenseDto>> getAllExpenses(@org.springframework.security.core.annotation.AuthenticationPrincipal com.example.backend.entities.User user) {
        return ResponseEntity.ok(expenseService.getExpensesByUser(user.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExpenseDto> updateExpense(@PathVariable Long id, @RequestBody ExpenseDto expenseDto) {
        return ResponseEntity.ok(expenseService.updateExpense(id, expenseDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }
}
