# Core Business Workflows

This document maps out the operational business workflows implemented across **AMDOX ERP**, including workforce attendance, leave management, automated payroll, purchase orders, and sales pipelines.

## 1. Attendance Punch In & Grace Period Workflow

```mermaid
flowchart TD
    Emp["Employee Opens Attendance Portal"]
    CaptureTime["Capture Laptop Device Local Time (HH:MM:SS)\n& Local IANA Timezone"]
    ClickPunch["Click 'Punch In' Button"]
    SendReq["POST /api/attendance/clock-in"]
    CheckExist{"Session Already Active for Today?"}
    ErrorExist["Return 400 Bad Request: Already Clocked In"]
    EvalGrace{"Evaluate Check-In Time\n(Grace Cutoff: 9:15 AM = 555 Mins)"}
    MarkPresent["Mark Status = 'Present' (On Time)"]
    MarkLate["Mark Status = 'Late' (Late Arrival)"]
    SaveAtt["Save Attendance Document to MongoDB"]
    RenderUI["Render Active Session Banner with Device Local Time Format"]

    Emp --> CaptureTime
    CaptureTime --> ClickPunch
    ClickPunch --> SendReq
    SendReq --> CheckExist
    CheckExist -->|Yes| ErrorExist
    CheckExist -->|No| EvalGrace
    EvalGrace -->|Time <= 9:15 AM| MarkPresent
    EvalGrace -->|Time > 9:15 AM| MarkLate
    MarkPresent --> SaveAtt
    MarkLate --> SaveAtt
    SaveAtt --> RenderUI
```

## 2. Employee Leave Application & Approval Workflow

```mermaid
flowchart TD
    Emp["Employee Submits Leave Request"]
    FillForm["Fills Leave Type, Dates (YYYY-MM-DD), & Reason"]
    SendLeave["POST /api/hr/leaves"]
    SavePending["Save Leave Document with status = 'pending'"]
    NotifyHR["Create Notification for HR & Admin Managers"]
    HRReview["HR / Admin Opens Pending Leave Approvals Handler"]
    Decide{"Approve or Reject Application?"}
    ApproveLeave["PATCH /api/hr/leaves/:id { status: 'approved' }"]
    RejectLeave["PATCH /api/hr/leaves/:id { status: 'rejected' }"]
    UpdateDB["Update Leave Document in MongoDB"]
    SendEmail["Nodemailer Sends Branded Email Notification to Employee"]

    Emp --> FillForm
    FillForm --> SendLeave
    SendLeave --> SavePending
    SavePending --> NotifyHR
    NotifyHR --> HRReview
    HRReview --> Decide
    Decide -->|Approve| ApproveLeave
    Decide -->|Reject| RejectLeave
    ApproveLeave --> UpdateDB
    RejectLeave --> UpdateDB
    UpdateDB --> SendEmail
```

## 3. Payroll Calculation & Disbursement Workflow

```mermaid
flowchart TD
    HR["HR Manager Initiates Monthly Payroll"]
    SelectMonth["Selects Target Month (YYYY-MM)"]
    FetchStaff["Fetch Enrolled Employee Records & Salaries"]
    AutoCompute["Compute Salary Slips:\n- Basic Salary = Employee.salary\n- Allowance = 5% of Basic\n- Deduction = 2% Tax\n- Total Salary = Basic + Allowance - Deduction"]
    SavePayrolls["Save Payroll Records with status = 'pending'"]
    Disburse["HR Clicks 'Disburse Payroll'"]
    UpdatePaid["Update Status to 'paid'"]
    GenReceipts["Generate Downloadable Paystub Receipts"]

    HR --> SelectMonth
    SelectMonth --> FetchStaff
    FetchStaff --> AutoCompute
    AutoCompute --> SavePayrolls
    SavePayrolls --> Disburse
    Disburse --> UpdatePaid
    UpdatePaid --> GenReceipts
```

## 4. Purchase Order & Vendor Billing Lifecycle

```mermaid
flowchart TD
    Admin["Admin Creates Purchase Order"]
    InputPO["Enter PO Number, Vendor Name, & Line Items"]
    SavePO["Save PurchaseOrder Document with status = 'Pending'"]
    ApprovePO["Update Status = 'Approved'"]
    GoodsReceived["Mark Goods Received (status = 'Received')"]
    GenerateBill["Generate Vendor Invoice (status = 'Billed')"]
    SaveVendorInv["Save VendorInvoice Document"]
    ProcessPay["Settle Payment via Accounts Payable"]
    FinalStatus["Update VendorInvoice status = 'paid' & PurchaseOrder status = 'Billed'"]

    Admin --> InputPO
    InputPO --> SavePO
    SavePO --> ApprovePO
    ApprovePO --> GoodsReceived
    GoodsReceived --> GenerateBill
    GenerateBill --> SaveVendorInv
    SaveVendorInv --> ProcessPay
    ProcessPay --> FinalStatus
```
