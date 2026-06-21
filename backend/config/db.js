import mongoose from "mongoose";
import "dotenv/config";
import User from "../models/User.js";

const connectDB = async () => {
  try {
    const connStr = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/amdox_erp";
    await mongoose.connect(connStr);
    console.log("MongoDB Connected successfully");

    // Autoseed demo users if database is empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log("No users found in database. Seeding default demo accounts...");
      
      const admin1 = new User({
        name: "Nadia Wilson",
        email: "admin@amdoxerp.com",
        password: "enterprise",
        role: "admin",
        phone: "+1 (555) 019-2834",
      });
      await admin1.save();

      const admin2 = new User({
        name: "Nadia Wilson",
        email: "admin@gmail.com",
        password: "123456",
        role: "admin",
        phone: "+1 (555) 019-2834",
      });
      await admin2.save();

      console.log("Default demo accounts seeded successfully.");
    }
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
