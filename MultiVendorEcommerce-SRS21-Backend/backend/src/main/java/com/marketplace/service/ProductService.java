package com.marketplace.service;

import com.marketplace.dto.ProductRequest;
import com.marketplace.dto.VariantRequest;
import com.marketplace.entity.Category;
import com.marketplace.entity.Product;
import com.marketplace.entity.ProductVariant;
import com.marketplace.entity.User;
import com.marketplace.entity.Vendor;
import com.marketplace.entity.enums.ProductStatus;
import com.marketplace.entity.enums.VendorStatus;
import com.marketplace.exception.BusinessException;
import com.marketplace.exception.ResourceNotFoundException;
import com.marketplace.repository.CategoryRepository;
import com.marketplace.repository.ProductRepository;
import com.marketplace.repository.ProductVariantRepository;
import com.marketplace.repository.UserRepository;
import com.marketplace.repository.VendorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ProductService {
    private final ProductRepository products;
    private final ProductVariantRepository variants;
    private final CategoryRepository categories;
    private final VendorRepository vendors;
    private final UserRepository users;

    public ProductService(ProductRepository products,
                          ProductVariantRepository variants,
                          CategoryRepository categories,
                          VendorRepository vendors,
                          UserRepository users) {
        this.products = products;
        this.variants = variants;
        this.categories = categories;
        this.vendors = vendors;
        this.users = users;
    }

    public List<Product> publicProducts(String search) {
        List<Product> active = products.findByStatus(ProductStatus.ACTIVE);
        if (search == null || search.isBlank()) {
            return active;
        }
        String term = search.trim().toLowerCase();
        return active.stream()
                .filter(p -> p.title.toLowerCase().contains(term)
                        || (p.description != null && p.description.toLowerCase().contains(term))
                        || (p.brand != null && p.brand.toLowerCase().contains(term))
                        || (p.category != null && p.category.name != null && p.category.name.toLowerCase().contains(term)))
                .toList();
    }

    public Product get(UUID id) {
        return products.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }

    @Transactional
    public Product create(ProductRequest request, String email) {
        Vendor vendor = resolveVendorForWrite(request.vendorId, email);
        Category category = categories.findById(request.categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        validateVendorApproved(vendor);
        if (request.sellingPrice > request.mrp) {
            throw new BusinessException("Selling price cannot be greater than MRP");
        }

        Product product = new Product();
        product.title = request.title.trim();
        product.description = request.description;
        product.brand = request.brand;
        product.hsnCode = request.hsnCode;
        product.mrp = request.mrp;
        product.sellingPrice = request.sellingPrice;
        product.gstRate = request.gstRate > 0 ? request.gstRate : category.gstDefault;
        product.imageUrl = request.imageUrl;
        product.videoUrl = request.videoUrl;
        product.category = category;
        product.vendor = vendor;
        product.status = ProductStatus.PENDING;
        product.slug = request.title.toLowerCase().trim().replaceAll("[^a-z0-9]+", "-");

        return products.save(product);
    }

    public List<Product> myProducts(String email) {
        return products.findByVendor(resolveVendorForWrite(null, email));
    }

    @Transactional
    public Product publish(UUID id, String email) {
        Product product = get(id);
        Vendor vendor = resolveVendorForWrite(null, email);
        if (!product.vendor.id.equals(vendor.id)) {
            throw new BusinessException("You can publish only your own products");
        }
        List<ProductVariant> productVariants = variants.findByProduct(product);
        if (productVariants.isEmpty()) {
            throw new BusinessException("Add at least one variant before publishing the product");
        }
        if (productVariants.stream().noneMatch(v -> v.stockQuantity > 0)) {
            throw new BusinessException("Add stock before publishing the product");
        }
        product.status = ProductStatus.ACTIVE;
        return products.save(product);
    }

    @Transactional
    public ProductVariant addVariant(UUID productId, VariantRequest request, String email) {
        Product product = get(productId);
        Vendor vendor = resolveVendorForWrite(null, email);
        if (!product.vendor.id.equals(vendor.id)) {
            throw new BusinessException("You can manage only your own products");
        }
        if (variants.existsBySkuIgnoreCase(request.sku)) {
            throw new BusinessException("SKU already exists");
        }

        ProductVariant variant = new ProductVariant();
        variant.product = product;
        variant.sku = request.sku.trim();
        variant.model = request.model;
        variant.colour = request.colour;
        variant.price = request.price;
        variant.stockQuantity = request.stockQuantity;
        return variants.save(variant);
    }

    public List<ProductVariant> variants(UUID productId) {
        return variants.findByProduct(get(productId));
    }

    public Vendor resolveVendorForWrite(UUID requestedVendorId, String email) {
        User user = users.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Vendor vendor = vendors.findByUser(user)
                .orElseThrow(() -> new BusinessException("Vendor profile not found"));
        if (requestedVendorId != null && !requestedVendorId.equals(vendor.id)) {
            throw new BusinessException("Vendor ID does not belong to the logged-in user");
        }
        return vendor;
    }

    private void validateVendorApproved(Vendor vendor) {
        if (vendor.status != VendorStatus.APPROVED) {
            throw new BusinessException("Vendor is not approved yet. Product listing is disabled");
        }
    }
}
