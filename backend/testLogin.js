import "dotenv/config";
import mongoose from "mongoose";
import User from "./models/User.js";
import Employee from "./models/Employee.js";

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");

    const email = "admin@g.com";
    const password = "123456";

    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found!");
      mongoose.disconnect();
      return;
    }

    console.log("User found! Status:", user.status);
    const isMatch = await user.comparePassword(password);
    console.log("Password matches 123456:", isMatch);

    let department = "General";
    let title = user.role === "admin" ? "ERP Administrator" : "Staff Member";
    
    // Check if employee population throws any errors
    const employeeData = await Employee.findOne({ user: user._id }).populate("department");
    if (employeeData) {
      title = employeeData.designation;
      if (employeeData.department) {
        department = employeeData.department.departmentName;
      }
    }
    console.log("Populated Employee details: Title =", title, "Dept =", department);

    mongoose.disconnect();
  } catch (err) {
    console.error("Error during test login:", err);
  }
}

run();
