import "dotenv/config";
import mongoose from "mongoose";
import User from "./models/User.js";

async function run() {
  try {
    const connStr = process.env.MONGO_URL;
    console.log("Connecting to:", connStr);
    await mongoose.connect(connStr);
    console.log("Connected! Finding users...");
    const users = await User.find({}, "name email role status");
    console.log("Users in database:");
    console.log(users);
    
    // Check specifically for admin@gmail.com or admin@g.com
    const target1 = await User.findOne({ email: "admin@gmail.com" });
    const target2 = await User.findOne({ email: "admin@g.com" });
    
    console.log("admin@gmail.com exists:", !!target1);
    console.log("admin@g.com exists:", !!target2);
    
    mongoose.disconnect();
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
