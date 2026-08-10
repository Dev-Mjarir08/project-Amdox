import Invoice from "../models/Invoice.js";
import { logAction } from "./auditController.js";

const getInvoices = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status && status !== "all") {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
      ];
    }

    const invoices = await Invoice.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      message: "Invoices fetched successfully.",
      data: invoices,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const createInvoice = async (req, res, next) => {
  try {
    let { customerName, email, customerId, items, taxRate, discount, invoiceDate, dueDate } = req.body;
    
    if (!customerName && customerId) {
      const customerMap = {
        "1": { name: "Acme Corporation", email: "billing@acme.com" },
        "2": { name: "Tech Solutions Ltd", email: "billing@techsolutions.com" },
        "3": { name: "Global Industries", email: "billing@globalindustries.com" }
      };
      const mapped = customerMap[customerId];
      if (mapped) {
        customerName = mapped.name;
        email = mapped.email;
      } else {
        customerName = customerId;
        email = "billing@company.com";
      }
    }

    if (!customerName) {
      customerName = "Unknown Customer";
    }
    if (!email) {
      email = "billing@customer.com";
    }

    if (!items || items.length === 0 || !invoiceDate || !dueDate) {
      return res.status(400).json({
        success: false,
        message: "Items, invoiceDate, and dueDate are required.",
        data: null,
        errors: ["Required billing details are missing."],
        timestamp: new Date().toISOString()
      });
    }

    const mappedItems = items.map((item) => ({
      description: item.description,
      qty: parseInt(item.quantity) || parseInt(item.qty) || 1,
      price: parseFloat(item.price) || 0,
    }));

    // Generate Invoice Number
    const count = await Invoice.countDocuments();
    const invoiceNumber = `INV-${(count + 1).toString().padStart(4, "0")}`;

    const invoice = new Invoice({
      invoiceNumber,
      customerName,
      email,
      items: mappedItems,
      taxRate: taxRate || 18,
      discount: discount || 0,
      invoiceDate,
      dueDate,
    });

    await invoice.save();
    await logAction(req.user._id, "CREATE", "Sales", `Created invoice ${invoiceNumber}`);

    res.status(201).json({
      success: true,
      message: "Invoice created successfully.",
      data: invoice,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const updateInvoiceStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found.",
        data: null,
        errors: ["Invoice not found."],
        timestamp: new Date().toISOString()
      });
    }

    invoice.status = status;
    await invoice.save();
    await logAction(req.user._id, "UPDATE", "Sales", `Updated invoice ${invoice.invoiceNumber} status to ${status}`);

    res.json({
      success: true,
      message: `Invoice status updated to ${status}.`,
      data: invoice,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const deleteInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findByIdAndDelete(id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found.",
        data: null,
        errors: ["Invoice not found."],
        timestamp: new Date().toISOString()
      });
    }

    await logAction(req.user._id, "DELETE", "Sales", `Deleted invoice ${invoice.invoiceNumber}`);

    res.json({
      success: true,
      message: "Invoice deleted successfully.",
      data: null,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

export {
  getInvoices,
  createInvoice,
  updateInvoiceStatus,
  deleteInvoice,
};
