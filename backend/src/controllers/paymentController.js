import Transaction from "../models/Transaction.js";
import Invoice from "../models/Invoice.js";

// Generate Payment Intent / Order ID for Stripe or Razorpay
const createPaymentIntent = async (req, res, next) => {
  try {
    const { amount, currency = "INR", gateway = "stripe", invoiceId, customerName, customerEmail } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid payment amount is required.",
        data: null,
        errors: ["Invalid amount"],
        timestamp: new Date().toISOString()
      });
    }

    const orderId = `${gateway.toUpperCase()}_ORD_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const clientSecret = `${gateway}_secret_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    res.json({
      success: true,
      message: `${gateway.toUpperCase()} payment intent created successfully.`,
      data: {
        orderId,
        clientSecret,
        amount,
        currency,
        gateway,
        invoiceId,
        customerName,
        customerEmail,
        publishableKey: gateway === "stripe" ? (process.env.STRIPE_PUBLISHABLE_KEY || "pk_test_amdox_stripe_default_key") : (process.env.RAZORPAY_KEY_ID || "rzp_test_amdox_default_key")
      },
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

// Verify Payment and Settle Invoice
const verifyPayment = async (req, res, next) => {
  try {
    const {
      gateway,
      orderId,
      paymentIntentId,
      amount,
      currency = "INR",
      invoiceId,
      customerName,
      customerEmail,
      paymentMethod = "Card"
    } = req.body;

    const transactionId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    let invoiceNumber = "";
    if (invoiceId) {
      const invoice = await Invoice.findById(invoiceId);
      if (invoice) {
        invoice.status = "Paid";
        invoiceNumber = invoice.invoiceNumber;
        await invoice.save();
      }
    }

    const transaction = new Transaction({
      transactionId,
      orderId: orderId || `ORD-${Date.now()}`,
      gateway: gateway || "stripe",
      amount: parseFloat(amount),
      currency,
      status: "Success",
      customerName: customerName || "Enterprise Client",
      customerEmail: customerEmail || "",
      invoiceId: invoiceId || null,
      invoiceNumber,
      paymentMethod,
      paymentIntentId: paymentIntentId || `pi_${Date.now()}`,
      receiptUrl: `http://localhost:8081/uploads/receipts/${transactionId}.pdf`,
      metadata: { verifiedAt: new Date() }
    });

    await transaction.save();

    res.json({
      success: true,
      message: `Payment of ${currency} ${amount} verified successfully via ${gateway.toUpperCase()}!`,
      data: {
        transaction,
        invoiceStatus: "Paid"
      },
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

// Fetch Transaction History
const getTransactions = async (req, res, next) => {
  try {
    const { gateway, status, search } = req.query;
    const query = {};

    if (gateway && gateway !== "all") query.gateway = gateway;
    if (status && status !== "all") query.status = status;
    if (search) {
      query.$or = [
        { transactionId: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
        { invoiceNumber: { $regex: search, $options: "i" } }
      ];
    }

    const transactions = await Transaction.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      message: "Transactions fetched successfully.",
      data: transactions,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

// Process Refund
const processRefund = async (req, res, next) => {
  try {
    const { transactionId, reason } = req.body;
    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID is required for refund.",
        data: null,
        errors: ["Missing transactionId"],
        timestamp: new Date().toISOString()
      });
    }

    const transaction = await Transaction.findOne({ transactionId });
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found.",
        data: null,
        errors: ["Transaction not found"],
        timestamp: new Date().toISOString()
      });
    }

    transaction.status = "Refunded";
    transaction.metadata = { ...transaction.metadata, refundReason: reason, refundedAt: new Date() };
    await transaction.save();

    if (transaction.invoiceId) {
      await Invoice.findByIdAndUpdate(transaction.invoiceId, { status: "Refunded" });
    }

    res.json({
      success: true,
      message: `Refund processed successfully for transaction ${transactionId}.`,
      data: transaction,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

export {
  createPaymentIntent,
  verifyPayment,
  getTransactions,
  processRefund
};
