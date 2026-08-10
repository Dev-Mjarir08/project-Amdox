import express from "express";
const router = express.Router();
import { verifyToken, isHR } from "../middlewares/authMiddleware.js";
import {
  getJournalEntries,
  createJournalEntry,
  getTrialBalance,
  getProfitLoss,
  getBalanceSheet,
  getVendorInvoices,
  createVendorInvoice,
  updateVendorInvoiceStatus,
  getCashFlow,
  getAgingReport,
} from "../controllers/financeController.js";

router.use(verifyToken);

router.get("/ledger", getJournalEntries);
router.post("/ledger", isHR, createJournalEntry);
router.get("/trial-balance", getTrialBalance);
router.get("/profit-loss", getProfitLoss);
router.get("/balance-sheet", getBalanceSheet);

// Accounts Payable / Vendor Invoices
router.get("/ap/invoices", getVendorInvoices);
router.post("/ap/invoices", createVendorInvoice);
router.put("/ap/invoices/:id/status", updateVendorInvoiceStatus);

// Financial statements & analysis reports
router.get("/cash-flow", getCashFlow);
router.get("/aging", getAgingReport);

export default router;
