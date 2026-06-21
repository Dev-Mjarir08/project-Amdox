import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Department from "../models/Department.js";
import Employee from "../models/Employee.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import Inventory from "../models/Inventory.js";
import Attendance from "../models/Attendance.js";
import Leave from "../models/Leave.js";
import Payroll from "../models/Payroll.js";

const seedDatabase = async () => {
  try {
    // 1. Connect to DB
    await connectDB();

    console.log("Clearing existing collections...");
    await User.deleteMany({});
    await Department.deleteMany({});
    await Employee.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    await Inventory.deleteMany({});
    await Attendance.deleteMany({});
    await Leave.deleteMany({});
    await Payroll.deleteMany({});

    console.log("Seeding admin user...");
    // Password will be hashed by the User pre-save hook
    const adminUser = new User({
      name: "Nadia Wilson",
      email: "admin@gmail.com",
      password: "123456",
      role: "admin",
      phone: "+1 (555) 019-2834",
    });
    await adminUser.save();

    console.log("Database seeded successfully with only the Admin user!");
    process.exit(0);
  } catch (error) {
    console.error(`Seeding database failed: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
