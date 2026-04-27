package com.example.backend.services;

import com.example.backend.entities.Expense;
import com.example.backend.repositories.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.example.backend.repositories.BudgetRepository;
import com.example.backend.entities.Budget;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class AnalyticsService {
    private final ExpenseRepository expenseRepository;
    private final BudgetRepository budgetRepository;

    public Map<String, Object> getDashboardData(Long userId) {
        List<Expense> expenses = expenseRepository.findByUserId(userId);
        
        BigDecimal totalExpenses = expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        Map<String, BigDecimal> categoryBreakdown = expenses.stream()
                .collect(Collectors.toMap(
                        e -> e.getCategory().getName(),
                        Expense::getAmount,
                        BigDecimal::add
                ));
        
        Map<String, BigDecimal> monthlyTrends = expenses.stream()
                .collect(Collectors.toMap(
                        e -> e.getDate().getYear() + "-" + String.format("%02d", e.getDate().getMonthValue()),
                        Expense::getAmount,
                        BigDecimal::add
                ));

        BigDecimal prediction = BigDecimal.ZERO;
        if (!monthlyTrends.isEmpty()) {
            BigDecimal sum = monthlyTrends.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add);
            prediction = sum.divide(new BigDecimal(monthlyTrends.size()), 2, java.math.RoundingMode.HALF_UP);
        }

        List<String> alerts = new ArrayList<>();
        List<Budget> userBudgets = budgetRepository.findByUserId(userId);
        for (Budget b : userBudgets) {
            BigDecimal spent = categoryBreakdown.getOrDefault(b.getCategory().getName(), BigDecimal.ZERO);
            if (spent.compareTo(b.getLimit()) >= 0 && b.getLimit().compareTo(BigDecimal.ZERO) > 0) {
                alerts.add("Budget Exceeded: You spent " + spent + " on " + b.getCategory().getName() + " (Limit: " + b.getLimit() + ")");
            } else if (spent.compareTo(b.getLimit().multiply(new BigDecimal("0.8"))) >= 0 && b.getLimit().compareTo(BigDecimal.ZERO) > 0) {
                alerts.add("Budget Warning: " + b.getCategory().getName() + " is at 80% usage.");
            }
        }

        return Map.of(
                "totalExpenses", totalExpenses,
                "categoryBreakdown", categoryBreakdown,
                "monthlyTrends", monthlyTrends,
                "predictedNextMonth", prediction,
                "alerts", alerts
        );
    }
}
