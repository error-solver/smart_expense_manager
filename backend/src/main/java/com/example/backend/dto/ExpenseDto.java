package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseDto {
    private Long id;
    private BigDecimal amount;
    private String categoryName;
    private Long categoryId;
    private LocalDate date;
    private String description;
    private String currency;
}
