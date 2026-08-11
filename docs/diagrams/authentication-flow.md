# Authentication & Authorization Architecture

This document details the security model, JSON Web Token (JWT) lifecycle, session cookie persistence, and middleware authorization checks enforced across the **AMDOX ERP Platform**.

## 1. Authentication Lifecycle

```mermaid
flowchart TD
    UserClient["User Web Browser"]
    LoginForm["React Login Form (/login)"]
    AuthEndpoint["POST /api/auth/login"]
    ValidateReq{"Validate Email & Password"}
    CheckUser{"Find User in MongoDB"}
    BcryptCheck{"Verify Password Hash (Bcrypt)"}
    GenJWT["Generate Signed JWT Token\n(Secret: JWT_SECRET, Expires: 7d)"]
    SetCookie["Set HTTP-Only Cookie 'token'\n& Return JSON Body"]
    ZustandAuth["Update Zustand Auth Store\n(Persist user & token in localStorage)"]
    ProtectedApp["Access Protected Application Routes"]

    UserClient --> LoginForm
    LoginForm --> AuthEndpoint
    AuthEndpoint --> ValidateReq
    ValidateReq -->|Valid| CheckUser
    CheckUser -->|User Exists| BcryptCheck
    BcryptCheck -->|Password Valid| GenJWT
    GenJWT --> SetCookie
    SetCookie --> ZustandAuth
    ZustandAuth --> ProtectedApp
```

## 2. Request Authorization & Middleware Stack

```mermaid
flowchart LR
    IncomingReq["Incoming HTTP Request"]
    ExtractToken["Extract JWT Token\n(From Cookies OR Authorization Header)"]
    TokenCheck{"Is Token Valid?"}
    DecodeJWT["Decode Payload\n(req.user = { id, email, role })"]
    RoleCheck{"Check Required Role\n(isAdmin / isHR / isManager / isEmployee)"}
    AllowAccess["Execute Controller Business Logic"]
    Deny401["Return 401 Unauthorized"]
    Deny403["Return 403 Forbidden Access Denied"]

    IncomingReq --> ExtractToken
    ExtractToken --> TokenCheck
    TokenCheck -->|No / Expired / Invalid| Deny401
    TokenCheck -->|Valid| DecodeJWT
    DecodeJWT --> RoleCheck
    RoleCheck -->|Role Not Permitted| Deny403
    RoleCheck -->|Role Authorized| AllowAccess
```

## 3. Password Reset & Email OTP Verification Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as User Browser
    participant API as Auth Routes (/api/auth)
    participant Ctrl as Auth Controller
    participant DB as User Collection (MongoDB)
    participant SMTP as Nodemailer SMTP Service

    User->>API: POST /api/auth/forgot-password { email }
    API->>Ctrl: forgotPassword(req, res)
    Ctrl->>DB: findOne({ email })
    DB-->>Ctrl: User Found
    Ctrl->>Ctrl: Generate 6-Digit Random OTP & Expiration (10 mins)
    Ctrl->>DB: save({ otp, otpExpiresAt })
    Ctrl->>SMTP: sendMail({ to: email, subject: "AMDOX Security OTP", htmlTemplate })
    SMTP-->>User: Delivers Branded Email with 6-Digit OTP Code
    Ctrl-->>User: 200 OK { message: "OTP sent to email" }

    User->>API: POST /api/auth/verify-otp { email, otp }
    API->>Ctrl: verifyOTP(req, res)
    Ctrl->>DB: findOne({ email, otp, otpExpiresAt: { $gt: Date.now() } })
    alt Valid OTP
        Ctrl-->>User: 200 OK { message: "OTP verified successfully" }
        User->>API: POST /api/auth/reset-password { email, otp, newPassword }
        API->>Ctrl: resetPassword(req, res)
        Ctrl->>DB: save({ password: hashedPassword, otp: null })
        Ctrl-->>User: 200 OK { message: "Password updated successfully" }
    else Expired or Invalid OTP
        Ctrl-->>User: 400 Bad Request { message: "Invalid or expired OTP" }
    end
```
