package com.example.backend.services;

import com.example.backend.dto.BudgetDto;
import com.example.backend.entities.Budget;
import com.example.backend.entities.Category;
import com.example.backend.entities.User;
import com.example.backend.exceptions.ResourceNotFoundException;
import com.example.backend.repositories.BudgetRepository;
import com.example.backend.repositories.CategoryRepository;
import com.example.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public BudgetDto setBudget(Long userId, BudgetDto budgetDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Category category = categoryRepository.findById(budgetDto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        Budget budget = budgetRepository.findByUserIdAndCategoryId(userId, category.getId())
                .orElse(new Budget());

        budget.setUser(user);
        budget.setCategory(category);
        budget.setLimit(budgetDto.getLimit());
        budget.setPeriod(budgetDto.getPeriod() != null ? budgetDto.getPeriod() : "MONTHLY");

        Budget saved = budgetRepository.save(budget);
        return mapToDto(saved);
    }

    public List<BudgetDto> getBudgetsByUser(Long userId) {
        return budgetRepository.findByUserId(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public void deleteBudget(Long id) {
        if (!budgetRepository.existsById(id)) {
            throw new ResourceNotFoundException("Budget not found");
        }
        budgetRepository.deleteById(id);
    }

    private BudgetDto mapToDto(Budget budget) {
        return new BudgetDto(
                budget.getId(),
                budget.getCategory().getName(),
                budget.getCategory().getId(),
                budget.getLimit(),
                budget.getPeriod()
        );
    }
}
