import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connStr = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/amdox_erp";
    await mongoose.connect(connStr, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("MongoDB Connected successfully to AMDOX ERP database");
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
