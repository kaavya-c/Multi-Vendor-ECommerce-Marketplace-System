# Multi-Vendor E-Commerce Marketplace - Frontend

React 18 + Vite frontend for SRS-21.

## Structure

- `src/App.js` - routes and navigation
- `src/api.js` - all backend API calls and JWT handling
- `src/index.js` - React entry point
- `src/index.css` - global styles
- `src/pages/` - Home, Login, Register, Marketplace, ProductDetails, Cart, Checkout, Orders, VendorRegister, VendorDashboard, AdminDashboard

## Run

```bash
npm install
npm run dev
```

Frontend runs at `http://localhost:8081` and proxies `/api` to the Spring Boot backend at `http://localhost:8080`.

Start PostgreSQL and the backend first.
