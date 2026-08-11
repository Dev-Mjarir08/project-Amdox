# High-Level System Architecture

This document presents the end-to-end system architecture of the **AMDOX Enterprise Resource Planning (ERP)** platform.

## Architecture Overview

AMDOX ERP is built as a decoupled, multi-tiered enterprise application consisting of a **React 19 single-page application (SPA)** on the frontend, an **Express / Node.js REST API** runtime on the backend, and **MongoDB Atlas** for document persistence.

```mermaid
flowchart TD
    subgraph ClientLayer ["Client Layer (Web & Mobile Browser)"]
        UserDevice["User Laptop / Mobile Browser"]
    end

    subgraph FrontendLayer ["Frontend Application Layer (Vite + React 19)"]
        ReactRouter["React Router DOM v7 (Role-Based Routing)"]
        ZustandStore["Zustand Global State Store (Auth & User State)"]
        AxiosClient["Axios HTTP Client (BaseURL: /api, Credentials, Interceptors)"]
        TailwindCSS["Tailwind CSS v4 (Glassmorphism & Dark/Light Themes)"]
    end

    subgraph SecurityMiddleware ["Backend Gateway & Middleware Layer"]
        ExpressApp["Express.js Server Engine (Port 8081)"]
        CorsMiddleware["CORS Middleware (Allow Credentials & Origin)"]
        AuthMiddleware["JWT Authentication Middleware (verifyToken)"]
        RoleMiddleware["RBAC Authorization Middleware (isAdmin, isHR, isManager, isEmployee)"]
        MulterStorage["Multer File Upload Middleware (Storage: /uploads/avatars, /uploads/documents)"]
    end

    subgraph ControllerServiceLayer ["Application Controllers & Business Logic"]
        AuthController["Auth & Profile Controller"]
        AttendanceController["Attendance Engine (9:15 AM Late Grace Cutoff & Timezone Sync)"]
        LeaveController["Leave Management Controller"]
        PayrollController["Payroll & Salary Slips Engine"]
        FinanceController["General Ledger, AR, AP & Reports Controller"]
        InventoryController["Inventory & SKU Management Controller"]
        PurchaseController["Purchase Orders & Vendor Controller"]
        CRMController["Sales Pipeline & Deals Controller"]
        AIController["AI Forecasting Controller (Moving Average & Financial Trends)"]
        PaymentController["Stripe & Razorpay Payment Controller"]
    end

    subgraph DatabaseLayer ["Data Persistence Layer"]
        MongooseODM["Mongoose ODM Schema Layer"]
        MongoDBAtlas[("MongoDB Atlas Database Cluster")]
    end

    subgraph ExternalIntegrations ["External Third-Party Services"]
        NodemailerSMTP["Nodemailer SMTP Service (Gmail Port 465)"]
        StripeAPI["Stripe Payment Gateway API"]
        RazorpayAPI["Razorpay Payment Gateway API (QR Code, UPI, NetBanking)"]
    end

    %% Flow Connections
    UserDevice --> ReactRouter
    ReactRouter --> ZustandStore
    ZustandStore --> AxiosClient
    AxiosClient -->|"HTTP Requests (JSON / Cookies / Bearer)"| ExpressApp

    ExpressApp --> CorsMiddleware
    CorsMiddleware --> AuthMiddleware
    AuthMiddleware --> RoleMiddleware
    RoleMiddleware --> MulterStorage
    MulterStorage --> AuthController & AttendanceController & LeaveController & PayrollController & FinanceController & InventoryController & PurchaseController & CRMController & AIController & PaymentController

    AuthController --> MongooseODM
    AttendanceController --> MongooseODM
    LeaveController --> MongooseODM
    PayrollController --> MongooseODM
    FinanceController --> MongooseODM
    InventoryController --> MongooseODM
    PurchaseController --> MongooseODM
    CRMController --> MongooseODM
    AIController --> MongooseODM
    PaymentController --> MongooseODM

    MongooseODM <--> MongoDBAtlas

    AuthController --> NodemailerSMTP
    LeaveController --> NodemailerSMTP
    PaymentController --> StripeAPI
    PaymentController --> RazorpayAPI
```

## Layer Specifications

1. **Client / Presentation Layer**: React 19 single-page application bundled via Vite 6. Utilizes Tailwind CSS v4 for UI rendering and Zustand for persistent authentication state management.
2. **Gateway & Security Layer**: Express.js server utilizing `verifyToken` JWT middleware and RBAC role checkers (`isAdmin`, `isHR`, `isManager`, `isEmployee`).
3. **Controller & Domain Layer**: Modular controller logic handling business rules, including standard 9:15 AM attendance cutoffs, exact minute-to-minute worked hours formatting, double-entry bookkeeping validation, and AI forecasting calculations.
4. **Data Layer**: Mongoose ODM enforcing strict validation schemas over MongoDB document collections.
5. **Integration Layer**: Third-party communication via SMTP (Nodemailer), Stripe Checkout Intent API, and Razorpay QR/UPI Gateway API.
