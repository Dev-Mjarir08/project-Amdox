import Payroll from "../models/Payroll.js";
import User from "../models/User.js";
import Employee from "../models/Employee.js";

// Get Payroll Records
const getPayrollRecords = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === "employee") {
      query.employee = req.user._id;
    }
    // Support monthly filtering from query params
    if (req.query.month) {
      query.month = req.query.month;
    }

    const records = await Payroll.find(query)
      .populate("employee", "name initials email role")
      .sort({ month: -1 });

    const employeeIds = records.map(p => p.employee?._id).filter(Boolean);
    const employees = await Employee.find({ user: { $in: employeeIds } }).populate("department");
    const empMap = new Map(employees.map(e => [e.user.toString(), e]));

    const mapped = records.map((p) => {
      if (!p.employee) return null;
      
      const empDetails = empMap.get(p.employee._id.toString());
      const departmentName = empDetails?.department?.departmentName || "General";
      const title = empDetails ? empDetails.designation : (p.employee.role === "admin" ? "ERP Administrator" : "Staff Member");

      return {
        id: p._id,
        user_id: p.employee._id,
        name: p.employee.name,
        initials: p.employee.initials,
        title,
        department: departmentName,
        month: p.month,
        basic_salary: p.basicSalary,
        allowance: p.allowance,
        deduction: p.deduction,
        total_salary: p.totalSalary,
        status: p.status,
      };
    }).filter(Boolean);

    res.json(mapped);
  } catch (err) {
    next(err);
  }
};

// Generate Payroll
const generatePayroll = async (req, res, next) => {
  try {
    const { month } = req.body; // format YYYY-MM
    if (!month) {
      return res.status(400).json({ error: "Payroll month is required." });
    }

    // Get active users
    const activeUsers = await User.find({ status: "active" });
    const userIds = activeUsers.map(u => u._id);

    // Fetch existing payrolls for the month and employee details in bulk
    const [existingPayroll, employeeDetails] = await Promise.all([
      Payroll.find({ employee: { $in: userIds }, month }).select("employee"),
      Employee.find({ user: { $in: userIds } })
    ]);

    const generatedEmployeeIds = new Set(existingPayroll.map(p => p.employee.toString()));
    const empDetailsMap = new Map(employeeDetails.map(e => [e.user.toString(), e]));

    const newPayrollEntries = [];

    for (const u of activeUsers) {
      if (generatedEmployeeIds.has(u._id.toString())) continue;

      const empDetails = empDetailsMap.get(u._id.toString());
      const basic = empDetails ? empDetails.salary : 3000;
      const allowance = parseFloat((basic * 0.05).toFixed(2)); // 5% allowance
      const deduction = parseFloat((basic * 0.02).toFixed(2)); // 2% tax/deduction
      const total = basic + allowance - deduction;

      newPayrollEntries.push({
        employee: u._id,
        month,
        basicSalary: basic,
        allowance,
        deduction,
        totalSalary: total,
        status: "processing",
      });
    }

    if (newPayrollEntries.length > 0) {
      await Payroll.insertMany(newPayrollEntries);
    }

    // Return the generated records (using bulk queries for mapping)
    const allRecordsForMonth = await Payroll.find({ month }).populate("employee", "name initials email role");
    const recordEmployeeIds = allRecordsForMonth.map(p => p.employee?._id).filter(Boolean);
    const employeesForMap = await Employee.find({ user: { $in: recordEmployeeIds } }).populate("department");
    const empMapForMap = new Map(employeesForMap.map(e => [e.user.toString(), e]));
    
    const mapped = allRecordsForMonth.map((p) => {
      if (!p.employee) return null;

      const empDetails = empMapForMap.get(p.employee._id.toString());
      const departmentName = empDetails?.department?.departmentName || "General";
      const title = empDetails ? empDetails.designation : (p.employee.role === "admin" ? "ERP Administrator" : "Staff Member");

      return {
        id: p._id,
        user_id: p.employee._id,
        name: p.employee.name,
        initials: p.employee.initials,
        title,
        department: departmentName,
        month: p.month,
        basic_salary: p.basicSalary,
        allowance: p.allowance,
        deduction: p.deduction,
        total_salary: p.totalSalary,
        status: p.status,
      };
    }).filter(Boolean);

    res.json({
      message: "Payroll list updated successfully.",
      records: mapped,
    });
  } catch (err) {
    next(err);
  }
};

// Update status
const updatePayrollStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // paid, processing, pending

    const record = await Payroll.findById(id).populate("employee", "name initials email role");
    if (!record) {
      return res.status(404).json({ error: "Payroll record not found." });
    }

    if (status) record.status = status;
    await record.save();

    let departmentName = "General";
    let title = record.employee.role === "admin" ? "ERP Administrator" : "Staff Member";
    const empDetails = await Employee.findOne({ user: record.employee._id }).populate("department");
    
    if (empDetails) {
      title = empDetails.designation;
      if (empDetails.department) {
        departmentName = empDetails.department.departmentName;
      }
    }

    res.json({
      id: record._id,
      user_id: record.employee._id,
      name: record.employee.name,
      initials: record.employee.initials,
      title,
      department: departmentName,
      month: record.month,
      basic_salary: record.basicSalary,
      allowance: record.allowance,
      deduction: record.deduction,
      total_salary: record.totalSalary,
      status: record.status,
    });
  } catch (err) {
    next(err);
  }
};

export {
  getPayrollRecords,
  generatePayroll,
  updatePayrollStatus,
};
