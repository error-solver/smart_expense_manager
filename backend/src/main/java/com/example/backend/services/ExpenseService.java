package com.example.backend.services;

import com.example.backend.dto.ExpenseDto;
import com.example.backend.entities.Budget;
import com.example.backend.entities.Category;
import com.example.backend.entities.Expense;
import com.example.backend.entities.User;
import com.example.backend.exceptions.ResourceNotFoundException;
import com.example.backend.repositories.BudgetRepository;
import com.example.backend.repositories.CategoryRepository;
import com.example.backend.repositories.ExpenseRepository;
import com.example.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private static final Logger logger = LoggerFactory.getLogger(ExpenseService.class);

    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final BudgetRepository budgetRepository;

    public ExpenseDto addExpense(Long userId, ExpenseDto expenseDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Category category;
        if (expenseDto.getCategoryId() != null && expenseDto.getCategoryId() > 0) {
            category = categoryRepository.findById(expenseDto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        } else {
            // AI mapping simulation
            String desc = expenseDto.getDescription() != null ? expenseDto.getDescription().toLowerCase() : "";
            category = categorizeByDescription(desc);
        }

        String currency = expenseDto.getCurrency();
        if (currency == null || currency.isEmpty()) {
            currency = user.getPreferredCurrency();
        }

        Expense expense = Expense.builder()
                .user(user)
                .category(category)
                .amount(expenseDto.getAmount())
                .date(expenseDto.getDate())
                .description(expenseDto.getDescription())
                .currency(currency)
                .build();

        Expense saved = expenseRepository.save(expense);
        
        checkBudgetAlert(userId, category.getId());

        return mapToDto(saved);
    }

    public List<ExpenseDto> getExpensesByUser(Long userId) {
        return expenseRepository.findByUserId(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public ExpenseDto updateExpense(Long id, ExpenseDto expenseDto) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
        
        Category category;
        if (expenseDto.getCategoryId() != null && expenseDto.getCategoryId() > 0) {
            category = categoryRepository.findById(expenseDto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        } else {
            category = categorizeByDescription(expenseDto.getDescription() != null ? expenseDto.getDescription().toLowerCase() : "");
        }

        expense.setAmount(expenseDto.getAmount());
        expense.setDate(expenseDto.getDate());
        expense.setDescription(expenseDto.getDescription());
        expense.setCategory(category);
        if (expenseDto.getCurrency() != null && !expenseDto.getCurrency().isEmpty()) {
            expense.setCurrency(expenseDto.getCurrency());
        }

        Expense updated = expenseRepository.save(expense);
        
        checkBudgetAlert(expense.getUser().getId(), category.getId());

        return mapToDto(updated);
    }

    public void deleteExpense(Long id) {
        if (!expenseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Expense not found");
        }
        expenseRepository.deleteById(id);
    }

    private void checkBudgetAlert(Long userId, Long categoryId) {
        Optional<Budget> optionalBudget = budgetRepository.findByUserIdAndCategoryId(userId, categoryId);
        if (optionalBudget.isPresent()) {
            Budget budget = optionalBudget.get();
            BigDecimal limit = budget.getLimit();
            
            BigDecimal totalExpenses = expenseRepository.findByUserIdAndCategoryId(userId, categoryId).stream()
                 .map(Expense::getAmount)
                 .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            if (limit.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal percentage = totalExpenses.divide(limit, 4, java.math.RoundingMode.HALF_UP).multiply(new BigDecimal("100"));
                
                if (percentage.compareTo(new BigDecimal("100")) >= 0) {
                    logger.warn("ALERT (Mock Email): You have exceeded your budget for category " + budget.getCategory().getName() + "!");
                } else if (percentage.compareTo(new BigDecimal("80")) >= 0) {
                    logger.warn("ALERT (Mock Email): You have reached " + percentage + "% of your budget for category " + budget.getCategory().getName() + ".");
                }
            }
        }
    }

    private ExpenseDto mapToDto(Expense expense) {
        return new ExpenseDto(
                expense.getId(),
                expense.getAmount(),
                expense.getCategory().getName(),
                expense.getCategory().getId(),
                expense.getDate(),
                expense.getDescription(),
                expense.getCurrency()
        );
    }

    private Category categorizeByDescription(String desc) {
        String categoryName = "Other";
        if (desc.contains("swiggy") || desc.contains("zomato") || desc.contains("food") || desc.contains("lunch") || desc.contains("dinner")) categoryName = "Food & Dining";
        else if (desc.contains("uber") || desc.contains("ola") || desc.contains("petrol") || desc.contains("flight") || desc.contains("train")) categoryName = "Transportation";
        else if (desc.contains("rent") || desc.contains("electricity") || desc.contains("water") || desc.contains("gas")) categoryName = "Housing";
        else if (desc.contains("movie") || desc.contains("netflix") || desc.contains("spotify") || desc.contains("prime")) categoryName = "Entertainment";
        else if (desc.contains("hospital") || desc.contains("medicine") || desc.contains("doctor") || desc.contains("pharmacy")) categoryName = "Healthcare";
        else if (desc.contains("school") || desc.contains("book") || desc.contains("tuition") || desc.contains("course")) categoryName = "Education";
        
        return categoryRepository.findByName(categoryName)
                .orElseGet(() -> categoryRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("No categories found")));
    }
}
