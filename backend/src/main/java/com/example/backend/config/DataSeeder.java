package com.example.backend.config;

import com.example.backend.entities.Category;
import com.example.backend.repositories.CategoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataSeeder {
    @Bean
    public CommandLineRunner loadData(CategoryRepository categoryRepository) {
        return args -> {
            if (categoryRepository.count() == 0) {
                categoryRepository.saveAll(List.of(
                        Category.builder().name("Food & Dining").build(),
                        Category.builder().name("Transportation").build(),
                        Category.builder().name("Housing").build(),
                        Category.builder().name("Entertainment").build(),
                        Category.builder().name("Healthcare").build(),
                        Category.builder().name("Personal Care").build(),
                        Category.builder().name("Education").build()
                ));
            }
        };
    }
}
