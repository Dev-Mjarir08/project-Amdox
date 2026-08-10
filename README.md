# project-Amdox


[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://mongodb.com)
[![React 19](https://img.shields.io/badge/Frontend-React%2019-cyan.svg)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-green.svg)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-green.svg)](https://www.mongodb.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

AMDOX ERP is an enterprise-grade, multi-tenant capable resource planning platform built on the MERN stack. It streamlines core corporate workflows including Human Resource Management (HRM), leave tracking, shift scheduling, payroll, inventory, supply chain, customer relations (CRM), and financial general ledger bookkeeping.

---

## Features

### 🔐 Authentication & Security
* **Stateless JWT Sessions:** Implements token-based authorization and session management.
* **Role-Based Workspaces (RBAC):** Dynamically builds menus and controls route access for Admin, HR, Manager, and Employee roles.
* **Secure Inputs:** Enforces request rate-limiting and encrypts passwords using `bcryptjs`.

### 👥 Human Resources & Team Portals
* **Employee Directory:** Tracks designations, joining dates, salary brackets, and departments.
* **Leave Management:** Enables employees to submit leave requests and tracks approval statuses.
* **Shift Scheduling:** Assigns Day, Night, or Rotational shifts to staff members.

### ⏱️ Time & Attendance
* **Clock In/Out:** Logs shifts and calculates work hours.
* **Status Tracking:** Tracks attendance statuses (Present, Remote, Late, Absent, Half-Day).

### 💰 Payroll Management
* **Automated Computations:** Generates monthly payroll sheets for active employees.
* **Tax Calculations:** Applies a default 5% allowance and deducts 2% for taxes.

### 📈 CRM & Lead Pipeline
* **Lead Tracking:** Moves sales deals through pipeline stages (Lead, Contacted, Proposal Sent, Negotiation, Won, Lost).
* **Financial Forecasting:** Estimates future deal values and customer pipelines.

### 📦 Supply Chain & Inventory
* **Stock Registry:** Categorizes items, tracks pricing, and monitors stock levels.
* **Re-order Alerts:** Automatically flags items when inventory runs low.
* **Purchase Orders:** Manages vendor purchase orders from creation to approval.

### 📓 Financial Ledger & Statements
* **Double-Entry Verification:** Verifies that total debits balance total credits before saving transactions.
* **Financial Reporting:** Auto-generates profit & loss statements, balance sheets, and cash flow reports.

### 🤖 AI Forecasting
* **Statistical Analysis:** Analyzes database collections to project financial growth and estimate attrition risks.
* **Interactive Co-Pilot:** Keyword assistant that answers operational queries.

---

## System Architecture

```
                       +-------------------------+
                       |   React 19 Client SPA   |
                       +-------------------------+
                                    |
                             HTTPS  |  JSON JWT
                                    v
                       +-------------------------+
                       |   Express API Router    |
                       +-------------------------+
                                    |
                      +-------------+-------------+
                      |                           |
                      v                           v
             +-----------------+         +-----------------+
             |   Middlewares   |         |   Controllers   |
             |   Rate Limit    |         |   Auth, HR,     |
             |   JWT Check     |         |   Finance, AI   |
             +-----------------+         +-----------------+
                                                  |
                                                  v
                                         +-----------------+
                                         |  Mongoose ODM   |
                                         +-----------------+
                                                  |
                                                  v
                                         +-----------------+
                                         |  MongoDB Atlas  |
                                         +-----------------+
```

---

## Folder Structure

```
Amdox-erp/
├── backend/
│   ├── app.js               # Express application configuration
│   ├── server.js            # Database initializer & server startup script
│   └── src/
│       ├── config/          # Database and Nodemailer SMTP configurations
│       ├── controllers/     # Controller logic (Auth, Employee, Finance...)
│       ├── middlewares/     # Authentication & role-check filters
│       ├── models/          # Mongoose database schemas
│       ├── routes/          # Express route bindings
│       └── services/        # SMTP mail templates
└── frontend/
    ├── index.html           # SPA root HTML template
    ├── tailwind.config.js   # Style custom utility mappings
    └── src/
        ├── App.jsx          # Syncs user state and theme mode
        ├── components/      # Shared components (Sidebar, Navbar, Modals)
        ├── layouts/         # RoleLayout dynamic layout wrapper
        ├── pages/           # Pages (Auth, Admin, HR, Manager, Employee)
        ├── routes/          # Lazy routes router mapping
        └── stores/          # Zustand store definitions (useAuthStore.js)
```

---

## API Documentation Quick Reference

### Authentication

* `POST /api/auth/login` - Authenticate user credentials.
* `POST /api/auth/register` - Create a new user account.
* `GET /api/auth/me` - Fetch authenticated user profile.

### Employee Directory

* `GET /api/employees` - List all employees.
* `POST /api/employees` - Create an employee profile (HR only).
* `DELETE /api/employees/:id` - Delete an employee profile (HR only).

### Financial Ledger

* `GET /api/finance/ledger` - Fetch general ledger entries.
* `POST /api/finance/ledger` - Post a balanced journal entry.
* `GET /api/finance/profit-loss` - Retrieve profit & loss statement.

### AI Forecasting

* `GET /api/ai/attrition` - Fetch employee attrition risk forecasts.
* `GET /api/ai/inventory` - Fetch inventory runout alerts.
* `POST /api/ai/chat` - Get responses from the co-pilot assistant.

---

## Installation & Setup

### Prerequisites
* Node.js (version 18.0.0 or higher)
* MongoDB (installed locally or a MongoDB Atlas cloud database)

### Setup Steps
1. Clone the repository to your local system.
2. Navigate to the `backend` directory, create a `.env` file, and install dependencies:
   ```bash
   cd backend
   npm install
   ```
   Add these environment variables to your `.env` file:
   ```env
   PORT=8081
   MONGO_URL=mongodb://127.0.0.1:27017/amdox_erp
   JWT_SECRET=your_jwt_secret_key
   CLIENT_URL=http://localhost:5173
   ```
3. Navigate to the `frontend` directory, create a `.env.local` file, and install dependencies:
   ```bash
   cd ../frontend
   npm install
   ```
   Add these environment variables to your `.env.local` file:
   ```env
   VITE_API_URL=http://localhost:8081/api
   VITE_ENABLE_MSW=false
   ```

### Running Locally
1. Start your MongoDB server.
2. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```
3. In a separate terminal, start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

---

## Screenshots Placeholder

* **Login Workspace:** `[Placeholder: docs/images/login_workspace.png]`
* **Admin Dashboard:** `[Placeholder: docs/images/admin_dashboard.png]`
* **General Ledger:** `[Placeholder: docs/images/general_ledger.png]`

---

## Future Improvements

* **Active LLM Integration:** Connect the AI Co-Pilot to a live LLM (like Gemini or OpenAI APIs) for real-time text analysis.
* **Cloud Storage:** Migrate document uploads to a secure cloud object store (like AWS S3).
* **Payment Gateways:** Integrate payment processors (like Stripe or Razorpay) to automate invoicing and payroll.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
