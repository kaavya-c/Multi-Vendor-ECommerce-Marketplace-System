package com.marketplace.service;

import com.marketplace.entity.Category;
import com.marketplace.exception.BusinessException;
import com.marketplace.exception.ResourceNotFoundException;
import com.marketplace.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class CategoryService {
    private final CategoryRepository categories;

    public CategoryService(CategoryRepository categories) {
        this.categories = categories;
    }

    public List<Category> all() {
        return categories.findAll();
    }

    public Category create(Category category) {
        if (categories.existsByNameIgnoreCase(category.name)) {
            throw new BusinessException("Category already exists");
        }
        return categories.save(category);
    }

    public Category get(UUID id) {
        return categories.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
    }
}
