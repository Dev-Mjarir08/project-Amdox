# API Request Flow & Sequence Diagrams

This document details the lifecycle of HTTP API requests as they transition through client interceptors, Express router layers, authentication middlewares, domain controllers, and Mongoose database operations.

## 1. Authentication Flow (`POST /api/auth/login`)

```mermaid
sequenceDiagram
    autonumber
    actor User as User Browser
    participant React as React App (Vite)
    participant Axios as Axios API Client
    participant Router as Express Auth Router
    participant AuthCtrl as Auth Controller
    participant Model as User Model (MongoDB)
    participant JWT as JWT Utility

    User->>React: Submits Email & Password Form
    React->>Axios: POST /api/auth/login { email, password }
    Axios->>Router: HTTP POST Request
    Router->>AuthCtrl: login(req, res, next)
    AuthCtrl->>Model: findOne({ email: req.body.email })
    Model-->>AuthCtrl: Returns User Document (with hashed password)

    alt User Not Found
        AuthCtrl-->>Axios: 400 Bad Request { success: false, message: "Invalid email or password" }
    else User Found
        AuthCtrl->>Model: comparePassword(candidatePassword)
        alt Password Mismatch
            AuthCtrl-->>Axios: 400 Bad Request { success: false, message: "Invalid email or password" }
        else Password Matched
            AuthCtrl->>JWT: sign({ id, email, role }, JWT_SECRET, { expiresIn: '7d' })
            JWT-->>AuthCtrl: Signed JWT Token String
            AuthCtrl-->>Axios: 200 OK + Set-Cookie ('token=JWT') { success: true, token, user }
            Axios-->>React: Store Token & User in Zustand Auth Store
            React-->>User: Redirect to Role Dashboard (/admin, /hr, /manager, /employee)
        end
    end
```

## 2. Attendance Clock-In Flow (`POST /api/attendance/clock-in`)

```mermaid
sequenceDiagram
    autonumber
    actor Employee as Employee Laptop
    participant SPA as React Attendance Page
    participant AuthMW as verifyToken Middleware
    participant AttCtrl as Attendance Controller
    participant DB as MongoDB Attendance Collection

    Employee->>SPA: Clicks "Punch In" Button
    SPA->>SPA: Captures Client Local Time (HH:MM:SS), Date (YYYY-MM-DD), and Timezone
    SPA->>AuthMW: POST /api/attendance/clock-in { date, checkIn, clientTimezone }
    AuthMW->>AuthMW: Decodes JWT Cookie / Bearer Token -> req.user
    AuthMW->>AttCtrl: Passes Execution

    AttCtrl->>DB: findOne({ employee: req.user.id, date })
    alt Active Session Exists
        AttCtrl-->>SPA: 400 Bad Request { message: "Already clocked in for today" }
    else New Punch In
        AttCtrl->>AttCtrl: Evaluate Shift Cutoff (555 mins = 9:15 AM)
        alt Punch In <= 9:15 AM
            AttCtrl->>AttCtrl: Set status = 'present'
        else Punch In > 9:15 AM
            AttCtrl->>AttCtrl: Set status = 'late'
        end

        AttCtrl->>DB: save(new Attendance({ employee, date, checkIn, status }))
        DB-->>AttCtrl: Saved Attendance Record
        AttCtrl-->>SPA: 201 Created { success: true, data: attendanceRecord }
        SPA-->>Employee: Render Active Clock-In Badge & Display Local Laptop Time
    end
```

## 3. Razorpay Payment & Invoice Settlement Flow (`POST /api/payment/verify`)

```mermaid
sequenceDiagram
    autonumber
    actor Client as Customer / Admin
    participant Modal as PaymentModal Component
    participant Backend as Express Payment Controller
    participant InvDB as Invoice Collection
    participant TxnDB as Transaction Collection

    Client->>Modal: Selects Razorpay -> Scans QR Code / Enters UPI VPA -> Clicks Pay
    Modal->>Backend: POST /api/payment/create-intent { amount, currency, gateway: 'razorpay' }
    Backend-->>Modal: 200 OK { orderId: 'order_rzp_...', publishableKey }

    Modal->>Backend: POST /api/payment/verify { gateway, orderId, amount, invoiceId, paymentMethod }
    Backend->>InvDB: findById(invoiceId)
    InvDB-->>Backend: Invoice Document

    Backend->>InvDB: update({ status: 'Paid' })
    Backend->>TxnDB: save(new Transaction({ transactionId, gateway: 'razorpay', amount, status: 'Success' }))
    TxnDB-->>Backend: Saved Transaction Document
    Backend-->>Modal: 200 OK { success: true, invoiceStatus: 'Paid', transaction }
    Modal-->>Client: Renders "Payment Successful" Screen & Download Receipt Button
```
