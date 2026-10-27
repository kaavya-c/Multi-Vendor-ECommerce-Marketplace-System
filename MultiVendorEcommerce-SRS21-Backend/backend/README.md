# Multi-Vendor E-Commerce Marketplace System - Backend

SRS-21 implementation using Spring Boot 3.5, Java 17, PostgreSQL, JPA and JWT.

## Run

1. Create a PostgreSQL database named `marketplace_srs21` (or run `database-setup.sql`).
2. Make sure PostgreSQL is running on port `5432`.
3. Default local credentials expected by `application.properties`:
   - username: `postgres`
   - password: `postgres`
4. Open this project in IntelliJ IDEA as a Maven project.
5. Run `com.marketplace.Main`.
6. Backend: `http://localhost:8080`
7. Swagger: `http://localhost:8080/swagger-ui.html`

## Default admin for local testing

- Email: `admin@marketplace.local`
- Password: `admin123`

The admin account is created automatically on first startup.

## Main Postman flow

1. POST `/api/v1/auth/register`
2. POST `/api/v1/auth/login`
3. POST `/api/v1/vendors/register`
4. Login as admin and PUT `/api/v1/admin/vendors/{vendorId}/approve`
5. Login again as the approved vendor to receive a VENDOR JWT
6. POST `/api/v1/products`
7. POST `/api/v1/products/{productId}/variants`
8. POST `/api/v1/products/{productId}/publish`
9. Login as buyer
10. GET `/api/v1/products`
11. POST `/api/v1/cart/items`
12. POST `/api/v1/orders/checkout`
13. POST `/api/v1/payments/capture/{orderId}`
14. GET `/api/v1/orders`
15. POST `/api/v1/returns` after an order reaches DELIVERED

All protected endpoints use:
`Authorization: Bearer <JWT>`
