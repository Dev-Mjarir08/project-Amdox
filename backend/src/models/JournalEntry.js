import mongoose from "mongoose";

const journalEntrySchema = new mongoose.Schema(
  {
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    reference: {
      type: String,
      required: true,
    },
    transactions: [
      {
        account: { type: String, required: true }, // e.g. "Cash", "Accounts Receivable"
        debit: { type: Number, default: 0 },
        credit: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

const JournalEntry = mongoose.model("JournalEntry", journalEntrySchema);
export default JournalEntry;
