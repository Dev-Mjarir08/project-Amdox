import mongoose from "mongoose";
import JournalEntry from "../models/JournalEntry.js";
import VendorInvoice from "../models/VendorInvoice.js";
import Vendor from "../models/Vendor.js";
import { logAction } from "./auditController.js";

const getJournalEntries = async (req, res, next) => {
  try {
    const entries = await JournalEntry.find().sort({ date: -1 });
    res.json({
      success: true,
      message: "Journal entries fetched successfully.",
      data: entries,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const createJournalEntry = async (req, res, next) => {
  try {
    const { date, description, reference, transactions } = req.body;
    if (!date || !description || !reference || !transactions || transactions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Date, description, reference, and transactions list are required.",
        data: null,
        errors: ["Missing required parameters."],
        timestamp: new Date().toISOString()
      });
    }

    // Double Entry Check: Sum(debits) must equal Sum(credits)
    let totalDebit = 0;
    let totalCredit = 0;
    for (const tx of transactions) {
      totalDebit += tx.debit || 0;
      totalCredit += tx.credit || 0;
    }

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return res.status(400).json({
        success: false,
        message: `Transactions are unbalanced. Debits (₹${totalDebit}) must equal Credits (₹${totalCredit}).`,
        data: null,
        errors: ["Debits and Credits are unbalanced."],
        timestamp: new Date().toISOString()
      });
    }

    const entry = new JournalEntry({
      date,
      description,
      reference,
      transactions,
    });

    await entry.save();
    await logAction(req.user._id, "CREATE", "Finance", `Posted journal entry ${reference}`);

    res.status(201).json({
      success: true,
      message: "Journal entry posted successfully.",
      data: entry,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const getTrialBalance = async (req, res, next) => {
  try {
    // Aggregate transactions by account name
    const entries = await JournalEntry.find();
    const accountsMap = {};

    for (const entry of entries) {
      for (const tx of entry.transactions) {
        if (!accountsMap[tx.account]) {
          accountsMap[tx.account] = { debit: 0, credit: 0 };
        }
        accountsMap[tx.account].debit += tx.debit || 0;
        accountsMap[tx.account].credit += tx.credit || 0;
      }
    }

    const report = Object.keys(accountsMap).map((accountName) => ({
      account: accountName,
      debit: accountsMap[accountName].debit,
      credit: accountsMap[accountName].credit,
    }));

    res.json({
      success: true,
      message: "Trial Balance generated successfully.",
      data: report,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const getProfitLoss = async (req, res, next) => {
  try {
    const entries = await JournalEntry.find();
    let revenues = 0;
    let expenses = 0;
    const details = [];

    for (const entry of entries) {
      for (const tx of entry.transactions) {
        const acc = tx.account.toLowerCase();
        if (acc.includes("revenue") || acc.includes("sales")) {
          // Revenues are credit accounts normally
          const amt = tx.credit - tx.debit;
          revenues += amt;
          details.push({ date: entry.date, type: "Revenue", account: tx.account, description: entry.description, amount: amt });
        } else if (acc.includes("expense") || acc.includes("salary") || acc.includes("supplies") || acc.includes("utility")) {
          // Expenses are debit accounts normally
          const amt = tx.debit - tx.credit;
          expenses += amt;
          details.push({ date: entry.date, type: "Expense", account: tx.account, description: entry.description, amount: amt });
        }
      }
    }

    res.json({
      success: true,
      message: "Profit & Loss statement generated successfully.",
      data: {
        revenues,
        expenses,
        netProfit: revenues - expenses,
        details,
      },
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const getBalanceSheet = async (req, res, next) => {
  try {
    const entries = await JournalEntry.find();
    let assets = 0;
    let liabilities = 0;
    let equity = 0;

    const breakDown = { assets: [], liabilities: [], equity: [] };

    for (const entry of entries) {
      for (const tx of entry.transactions) {
        const acc = tx.account.toLowerCase();
        if (acc.includes("cash") || acc.includes("receivable") || acc.includes("inventory") || acc.includes("hardware") || acc.includes("asset")) {
          const val = tx.debit - tx.credit;
          assets += val;
          breakDown.assets.push({ account: tx.account, value: val });
        } else if (acc.includes("payable") || acc.includes("loan") || acc.includes("tax")) {
          const val = tx.credit - tx.debit;
          liabilities += val;
          breakDown.liabilities.push({ account: tx.account, value: val });
        } else if (acc.includes("equity") || acc.includes("capital") || acc.includes("retained")) {
          const val = tx.credit - tx.debit;
          equity += val;
          breakDown.equity.push({ account: tx.account, value: val });
        }
      }
    }

    res.json({
      success: true,
      message: "Balance Sheet generated successfully.",
      data: {
        assets,
        liabilities,
        equity,
        breakDown,
      },
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const getVendorInvoices = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {};
    if (status && status !== "all") {
      query.status = status.toLowerCase();
    }
    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: "i" } },
        { vendorName: { $regex: search, $options: "i" } },
        { poNumber: { $regex: search, $options: "i" } },
      ];
    }
    const invoices = await VendorInvoice.find(query).sort({ createdAt: -1 });
    res.json({
      success: true,
      message: "Vendor invoices fetched successfully.",
      data: invoices,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const createVendorInvoice = async (req, res, next) => {
  try {
    const { vendorId, invoiceNumber, invoiceDate, dueDate, poNumber, items, notes } = req.body;
    if (!invoiceNumber || !invoiceDate || !dueDate || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invoice number, date, due date, and items are required.",
        data: null,
        errors: ["Missing required parameters."],
        timestamp: new Date().toISOString()
      });
    }

    let vendorName = "Unknown Vendor";
    let vendorObjId = null;
    if (vendorId) {
      let foundVendor = null;
      if (mongoose.Types.ObjectId.isValid(vendorId)) {
        foundVendor = await Vendor.findById(vendorId);
      }
      if (!foundVendor) {
        foundVendor = await Vendor.findOne({ vendorId: vendorId });
      }
      if (foundVendor) {
        vendorName = foundVendor.name;
        vendorObjId = foundVendor._id;
      } else {
        // Fallback: If no vendor object matched, treat it as vendor name string
        vendorName = vendorId;
      }
    }

    const mappedItems = items.map((item) => ({
      description: item.description,
      qty: parseInt(item.quantity) || parseInt(item.qty) || 1,
      price: parseFloat(item.price) || 0,
    }));

    const invoice = new VendorInvoice({
      invoiceNumber,
      vendorId: vendorObjId,
      vendorName,
      poNumber,
      items: mappedItems,
      invoiceDate,
      dueDate,
      notes,
    });

    await invoice.save();
    await logAction(req.user._id, "CREATE", "Finance", `Created vendor invoice ${invoiceNumber} for ${vendorName}`);

    res.status(201).json({
      success: true,
      message: "Vendor invoice created successfully.",
      data: invoice,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const updateVendorInvoiceStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required.",
        data: null,
        errors: ["Status is required."],
        timestamp: new Date().toISOString()
      });
    }

    const invoice = await VendorInvoice.findById(id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Vendor invoice not found.",
        data: null,
        errors: ["Vendor invoice not found."],
        timestamp: new Date().toISOString()
      });
    }

    invoice.status = status.toLowerCase();
    await invoice.save();
    await logAction(req.user._id, "UPDATE", "Finance", `Updated status of vendor invoice ${invoice.invoiceNumber} to ${status}`);

    res.json({
      success: true,
      message: "Vendor invoice status updated successfully.",
      data: invoice,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

import Invoice from "../models/Invoice.js";

const getCashFlow = async (req, res, next) => {
  try {
    const entries = await JournalEntry.find();
    let operatingIn = 0;
    let operatingOut = 0;
    let investing = 0;
    let financing = 0;

    for (const entry of entries) {
      for (const tx of entry.transactions) {
        const acc = tx.account.toLowerCase();
        if (acc.includes("cash") || acc.includes("bank")) {
          const val = tx.debit - tx.credit;
          if (val > 0) {
            if (acc.includes("sale") || acc.includes("revenue") || acc.includes("receivable")) {
              operatingIn += val;
            } else if (acc.includes("loan") || acc.includes("capital")) {
              financing += val;
            } else {
              operatingIn += val;
            }
          } else {
            const outVal = Math.abs(val);
            if (acc.includes("expense") || acc.includes("payable") || acc.includes("purchase")) {
              operatingOut += outVal;
            } else if (acc.includes("equipment") || acc.includes("asset")) {
              investing += outVal;
            } else {
              operatingOut += outVal;
            }
          }
        }
      }
    }

    res.json({
      success: true,
      message: "Cash Flow generated successfully.",
      data: {
        operatingIn,
        operatingOut,
        netOperating: operatingIn - operatingOut,
        investing: -investing,
        financing,
        netChange: (operatingIn - operatingOut) - investing + financing
      },
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const getAgingReport = async (req, res, next) => {
  try {
    const apInvoices = await VendorInvoice.find({ status: { $ne: "paid" } });
    const arInvoices = await Invoice.find({ status: { $ne: "Paid" } });

    const getAgeInDays = (dateStr) => {
      if (!dateStr) return 0;
      const docDate = new Date(dateStr);
      const today = new Date();
      const diffTime = Math.abs(today - docDate);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const agingBuckets = {
      ar: { current: 0, 30: 0, 60: 0, 90: 0, total: 0 },
      ap: { current: 0, 30: 0, 60: 0, 90: 0, total: 0 }
    };

    for (const inv of arInvoices) {
      const age = getAgeInDays(inv.invoiceDate);
      const amt = inv.totalAmount || 0;
      agingBuckets.ar.total += amt;
      if (age <= 30) agingBuckets.ar.current += amt;
      else if (age <= 60) agingBuckets.ar["30"] += amt;
      else if (age <= 90) agingBuckets.ar["60"] += amt;
      else agingBuckets.ar["90"] += amt;
    }

    for (const inv of apInvoices) {
      const age = getAgeInDays(inv.invoiceDate);
      const amt = inv.totalAmount || 0;
      agingBuckets.ap.total += amt;
      if (age <= 30) agingBuckets.ap.current += amt;
      else if (age <= 60) agingBuckets.ap["30"] += amt;
      else if (age <= 90) agingBuckets.ap["60"] += amt;
      else agingBuckets.ap["90"] += amt;
    }

    res.json({
      success: true,
      message: "Aging Report generated successfully.",
      data: agingBuckets,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

export {
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
};
