# Role-Based Access Control (RBAC) Architecture

This document documents the Role-Based Access Control (RBAC) model, route protection mechanisms, and permission matrix enforced across **AMDOX ERP**.

## 1. System Role Hierarchy & Inheritance

```mermaid
graph TD
    Root["AMDOX ERP Platform Role Architecture"]

    Root --> Admin["1. Admin (System Administrator)"]
    Root --> HR["2. HR Manager"]
    Root --> Manager["3. Department Manager"]
    Root --> Employee["4. Staff Employee"]

    Admin --> AdminPerms["Full System Control\n- User & Role Accounts\n- General Ledger & Accounting\n- System Settings & Integrations\n- Audit Logs & Global Dashboards"]
    HR --> HRPerms["Human Capital Control\n- Employee Directory & Staffing\n- Leave Approval Handler\n- Payroll Processing & Slips\n- Recruitment & Training"]
    Manager --> ManagerPerms["Departmental Control\n- Team Task & Project Allocation\n- Direct Reports Attendance\n- Performance Appraisals\n- CRM Lead Tracking"]
    Employee --> EmpPerms["Self-Service Control\n- Clock-In / Clock-Out (Laptop Sync)\n- Submit Leave Applications\n- Personal Profile & Password\n- Assigned Tasks & Paystubs"]
```

## 2. Granular Permissions Matrix

| Feature / Module | Admin | HR Manager | Department Manager | Staff Employee |
| :--- | :---: | :---: | :---: | :---: |
| **Manage Users & Role Assignment** | ✅ | ❌ | ❌ | ❌ |
| **General Ledger & Double-Entry Accounting** | ✅ | ❌ | ❌ | ❌ |
| **Accounts Payable & Receivable** | ✅ | ❌ | ❌ | ❌ |
| **System Settings & Payment Gateways** | ✅ | ❌ | ❌ | ❌ |
| **System Audit Logs** | ✅ | ❌ | ❌ | ❌ |
| **Employee Master Directory Management** | ✅ | ✅ | 👁️ (View Only) | 👁️ (Self Only) |
| **Approve / Reject Employee Leaves** | ✅ | ✅ | ✅ (Team Only) | ❌ |
| **Payroll Processing & Slips** | ✅ | ✅ | ❌ | 👁️ (Self Only) |
| **Create & Post Recruitment Job Openings** | ✅ | ✅ | ❌ | ❌ |
| **Create & Assign Tasks / Projects** | ✅ | ✅ | ✅ | ❌ |
| **Manage CRM Sales Leads & Pipeline** | ✅ | ❌ | ✅ | ❌ |
| **Attendance Punch In / Out** | ✅ | ✅ | ✅ | ✅ |
| **Download Paystub Receipts & Invoices** | ✅ | ✅ | ✅ | ✅ |

## 3. Frontend Route Protection Flow (`RoleLayout.jsx`)

```mermaid
flowchart TD
    UserNav["User Navigates to Route (e.g. /admin/general-ledger)"]
    CheckAuth{"Is User Authenticated?"}
    RedirectLogin["Redirect to /login"]
    CheckRole{"Does User Role Match Route Prefix?"}
    RedirectUnauthorized["Redirect to /unauthorized"]
    FilterNavItems["Filter Sidebar Nav Items by Permissions"]
    RenderView["Render Page Component inside RoleLayout"]

    UserNav --> CheckAuth
    CheckAuth -->|No| RedirectLogin
    CheckAuth -->|Yes| CheckRole
    CheckRole -->|No| RedirectUnauthorized
    CheckRole -->|Yes| FilterNavItems
    FilterNavItems --> RenderView
```
