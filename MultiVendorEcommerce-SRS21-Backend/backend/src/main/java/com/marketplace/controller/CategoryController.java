package com.marketplace.controller;

import com.marketplace.entity.Category;
import com.marketplace.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {
    private final CategoryService categories;

    public CategoryController(CategoryService categories) {
        this.categories = categories;
    }

    @GetMapping
    public List<Category> all() {
        return categories.all();
    }

    @GetMapping("/{id}")
    public Category get(@PathVariable UUID id) {
        return categories.get(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Category create(@Valid @RequestBody Category category) {
        return categories.create(category);
    }
}
