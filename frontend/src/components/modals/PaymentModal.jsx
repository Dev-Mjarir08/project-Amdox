import { useState, useEffect } from 'react';
import { FiX, FiCreditCard, FiShield, FiCheckCircle, FiDownload, FiDollarSign } from 'react-icons/fi';
import api from '../../lib/api.js';
import { toast } from 'react-toastify';

export default function PaymentModal({ isOpen, onClose, onSuccess, invoice }) {
  const [gateway, setGateway] = useState('stripe'); // 'stripe' | 'razorpay'
  const [currency, setCurrency] = useState('INR');
  const [paymentMethod, setPaymentMethod] = useState('Card'); // 'Card' | 'UPI' | 'NetBanking'
  
  // Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');

  // UPI / NetBanking State
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  const [loading, setLoading] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [transactionData, setTransactionData] = useState(null);

  useEffect(() => {
    if (invoice) {
      setCardName(invoice.customerName || invoice.customer || '');
      setPaymentCompleted(false);
      setTransactionData(null);
    }
  }, [invoice, isOpen]);

  if (!isOpen || !invoice) return null;

  const rawAmount = invoice.totalAmount || invoice.amount || 1000;
  const displayAmount = currency === 'USD' ? Math.round(rawAmount / 83) : currency === 'EUR' ? Math.round(rawAmount / 90) : rawAmount;
  const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₹';

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // 1. Create Payment Intent API call
      const intentRes = await api.post('/payment/create-intent', {
        amount: displayAmount,
        currency,
        gateway,
        invoiceId: invoice.id || invoice._id,
        customerName: invoice.customerName || invoice.customer,
        customerEmail: invoice.email || 'customer@enterprise.com'
      });

      const orderData = intentRes.data;

      // Simulate Gateway Verification API Call
      const verifyRes = await api.post('/payment/verify', {
        gateway,
        orderId: orderData?.data?.orderId || `ORD_${Date.now()}`,
        paymentIntentId: orderData?.data?.clientSecret || `pi_${Date.now()}`,
        amount: displayAmount,
        currency,
        invoiceId: invoice.id || invoice._id,
        customerName: invoice.customerName || invoice.customer,
        customerEmail: invoice.email || 'customer@enterprise.com',
        paymentMethod: gateway === 'razorpay' ? paymentMethod : 'Credit/Debit Card'
      });

      const txn = verifyRes.data?.data?.transaction;
      setTransactionData(txn);
      setPaymentCompleted(true);
      toast.success(`Payment of ${currencySymbol}${displayAmount} processed successfully via ${gateway.toUpperCase()}!`);

      if (onSuccess) {
        onSuccess(txn);
      }
    } catch (err) {
      console.error('Payment Error:', err);
      toast.error(err.response?.data?.message || err.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (!transactionData) return;
    const content = `
==================================================
              AMDOX ERP PAYMENT RECEIPT
==================================================
Transaction ID : ${transactionData.transactionId}
Order Reference: ${transactionData.orderId}
Gateway        : ${transactionData.gateway?.toUpperCase()}
Invoice Number : ${invoice.invoiceNumber}
Customer Name  : ${transactionData.customerName}
Payment Date   : ${new Date(transactionData.createdAt || Date.now()).toLocaleString()}
Amount Paid    : ${currencySymbol}${transactionData.amount} (${currency})
Status         : SUCCESS / SETTLED
==================================================
Thank you for your business!
AMDOX Enterprise Resource Planning Platform
==================================================
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt_${transactionData.transactionId}.txt`;
    link.click();
    toast.success('Payment receipt downloaded!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2 text-primary dark:bg-primary/20">
              <FiCreditCard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Enterprise Payment Checkout</h3>
              <p className="text-xs text-slate-500">Invoice #{invoice.invoiceNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800">
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {paymentCompleted ? (
          <div className="py-8 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <FiCheckCircle className="h-10 w-10" />
            </div>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white">Payment Successful!</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Transaction ID: <span className="font-semibold text-primary">{transactionData?.transactionId}</span>
            </p>
            <div className="mx-auto max-w-xs rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50 text-xs space-y-1 text-slate-700 dark:text-slate-300">
              <div className="flex justify-between"><span>Amount Paid:</span><span className="font-bold">{currencySymbol}{displayAmount}</span></div>
              <div className="flex justify-between"><span>Payment Gateway:</span><span className="font-semibold capitalize">{gateway}</span></div>
              <div className="flex justify-between"><span>Invoice Status:</span><span className="font-bold text-emerald-600">PAID</span></div>
            </div>

            <div className="flex justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={handleDownloadReceipt}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-blue-700 transition"
              >
                <FiDownload className="h-4 w-4" />
                Download Receipt
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleProcessPayment} className="mt-5 space-y-5">
            {/* Gateway Toggle */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Select Payment Gateway</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setGateway('stripe')}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-xl border transition ${
                    gateway === 'stripe'
                      ? 'border-primary bg-primary/5 text-primary shadow-sm dark:bg-primary/10'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400'
                  }`}
                >
                  <span className="text-sm font-extrabold tracking-wide">STRIPE</span>
                  <span className="text-[10px] opacity-70">Credit & Debit Cards (Global)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGateway('razorpay')}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-xl border transition ${
                    gateway === 'razorpay'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm dark:bg-blue-950/40 dark:text-blue-300'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400'
                  }`}
                >
                  <span className="text-sm font-extrabold tracking-wide">RAZORPAY</span>
                  <span className="text-[10px] opacity-70">UPI, NetBanking, Cards (India)</span>
                </button>
              </div>
            </div>

            {/* Currency Selector & Summary */}
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
              <div>
                <span className="text-xs text-slate-500">Invoice Amount</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  {currencySymbol}{displayAmount.toLocaleString()}
                </p>
              </div>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="erp-focus h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>

            {/* Dynamic Form Content */}
            {gateway === 'stripe' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Name on Card</label>
                  <input
                    type="text"
                    required
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="John Doe"
                    className="mt-1 erp-focus h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Card Number</label>
                  <input
                    type="text"
                    required
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                    placeholder="4242 •••• •••• 4242"
                    className="mt-1 erp-focus h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium tracking-wider dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="12/28"
                      className="mt-1 erp-focus h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">CVC Code</label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="123"
                      className="mt-1 erp-focus h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('QR')}
                    className={`py-1.5 rounded-lg transition ${paymentMethod === 'QR' ? 'bg-white text-blue-700 shadow-xs dark:bg-slate-900 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}
                  >
                    Scan QR
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`py-1.5 rounded-lg transition ${paymentMethod === 'UPI' ? 'bg-white text-blue-700 shadow-xs dark:bg-slate-900 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}
                  >
                    UPI ID
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('NetBanking')}
                    className={`py-1.5 rounded-lg transition ${paymentMethod === 'NetBanking' ? 'bg-white text-blue-700 shadow-xs dark:bg-slate-900 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}
                  >
                    NetBank
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Card')}
                    className={`py-1.5 rounded-lg transition ${paymentMethod === 'Card' ? 'bg-white text-blue-700 shadow-xs dark:bg-slate-900 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}
                  >
                    Card
                  </button>
                </div>

                {paymentMethod === 'QR' ? (
                  <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950 text-center space-y-2">
                    <div className="relative p-2 rounded-xl bg-white shadow-md border border-slate-200">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=upi://pay?pa=amdox.erp@razorpay&pn=AMDOX%20Enterprise&am=${displayAmount}&cu=INR`}
                        alt="Razorpay QR Code"
                        className="h-36 w-36 object-contain"
                      />
                      <div className="absolute inset-0 rounded-xl border-2 border-dashed border-blue-500/40 animate-pulse pointer-events-none" />
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Scan & Pay ₹{displayAmount.toLocaleString()}</p>
                    <div className="flex items-center justify-center gap-2 text-[10px] font-semibold text-slate-500">
                      <span className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">Google Pay</span>
                      <span className="rounded bg-indigo-50 px-2 py-0.5 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400">PhonePe</span>
                      <span className="rounded bg-blue-50 px-2 py-0.5 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">Paytm</span>
                      <span className="rounded bg-amber-50 px-2 py-0.5 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">BHIM</span>
                    </div>
                  </div>
                ) : paymentMethod === 'UPI' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">UPI ID / VPA</label>
                    <input
                      type="text"
                      required
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="customer@okhdfcbank"
                      className="mt-1 erp-focus h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                    <div className="flex gap-1.5 mt-2">
                      {['@okhdfcbank', '@ybl', '@paytm', '@ibl'].map((suffix) => (
                        <button
                          key={suffix}
                          type="button"
                          onClick={() => {
                            const prefix = upiId.split('@')[0] || 'user';
                            setUpiId(`${prefix}${suffix}`);
                          }}
                          className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 hover:border-blue-400 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                        >
                          {suffix}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : paymentMethod === 'NetBanking' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Select Bank</label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="mt-1 erp-focus h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    >
                      <option>HDFC Bank</option>
                      <option>ICICI Bank</option>
                      <option>State Bank of India (SBI)</option>
                      <option>Axis Bank</option>
                      <option>Kotak Mahindra Bank</option>
                      <option>Punjab National Bank (PNB)</option>
                    </select>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">RuPay / Debit / Credit Card</label>
                      <input
                        type="text"
                        required
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                        placeholder="5241 •••• •••• 9988"
                        className="mt-1 erp-focus h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium tracking-wider dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          required
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="09/29"
                          className="mt-1 erp-focus h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">CVV Code</label>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          placeholder="456"
                          className="mt-1 erp-focus h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-2">
              <FiShield className="h-4 w-4 text-emerald-500" />
              <span>256-bit SSL encrypted secure checkout • Instant ERP Ledger Sync</span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {loading ? 'Processing Payment...' : `Pay ${currencySymbol}${displayAmount.toLocaleString()} via ${gateway.toUpperCase()}`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
