package com.marketplace.service;

import com.marketplace.entity.Category;
import com.marketplace.entity.User;
import com.marketplace.entity.enums.Role;
import com.marketplace.repository.CategoryRepository;
import com.marketplace.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class SeedService {
    @Bean
    CommandLineRunner seed(UserRepository users,
                           CategoryRepository categories,
                           PasswordEncoder encoder) {
        return args -> {
            if (!users.existsByEmail("admin@marketplace.local")) {
                User admin = new User();
                admin.fullName = "Marketplace Admin";
                admin.email = "admin@marketplace.local";
                admin.password = encoder.encode("admin123");
                admin.role = Role.ADMIN;
                users.save(admin);
            }

            String[][] defaultCats = {
                {"Electronics", "Phones, laptops and electronic accessories", "18"},
                {"Fashion", "Clothing, footwear and accessories", "18"},
                {"Home & Kitchen", "Kitchenware, home decor, cookware and household essentials", "12"},
                {"Beauty", "Skincare, cosmetics, personal care, and perfumes", "18"},
                {"Sports", "Fitness equipment, sportswear, outdoor gear, and athletic accessories", "18"},
                {"Accessories", "Watches, bags, wallets, sunglasses, and fashion jewellery", "18"},
                {"Books", "Fiction, non-fiction, academic literature, and educational materials", "5"},
                {"Grocery", "Daily food essentials, staples, organic items, and beverages", "5"}
            };

            for (String[] catData : defaultCats) {
                if (!categories.existsByNameIgnoreCase(catData[0])) {
                    Category cat = new Category();
                    cat.name = catData[0];
                    cat.description = catData[1];
                    cat.level = 1;
                    cat.gstDefault = Double.parseDouble(catData[2]);
                    cat.commissionDefault = 10;
                    cat.active = true;
                    categories.save(cat);
                }
            }
        };
    }
}
