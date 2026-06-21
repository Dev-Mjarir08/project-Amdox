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

    const records = await Payroll.find(query)
      .populate("employee", "name initials email role")
      .sort({ month: -1 });

    const mapped = await Promise.all(
      records.map(async (p) => {
        if (!p.employee) return null;
        
        let departmentName = "General";
        let title = p.employee.role === "admin" ? "ERP Administrator" : "Staff Member";
        const empDetails = await Employee.findOne({ user: p.employee._id }).populate("department");
        
        if (empDetails) {
          title = empDetails.designation;
          if (empDetails.department) {
            departmentName = empDetails.department.departmentName;
          }
        }

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
      })
    );

    res.json(mapped.filter(Boolean));
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

    // Get active users who don't have payroll generated for this month yet
    const activeUsers = await User.find({ status: "active" });
    
    for (const u of activeUsers) {
      const alreadyGenerated = await Payroll.findOne({ employee: u._id, month });
      if (alreadyGenerated) continue;

      const empDetails = await Employee.findOne({ user: u._id });
      const basic = empDetails ? empDetails.salary : 3000;
      const allowance = parseFloat((basic * 0.05).toFixed(2)); // 5% allowance
      const deduction = parseFloat((basic * 0.02).toFixed(2)); // 2% tax/deduction
      const total = basic + allowance - deduction;

      const payrollEntry = new Payroll({
        employee: u._id,
        month,
        basicSalary: basic,
        allowance,
        deduction,
        totalSalary: total,
        status: "processing",
      });

      await payrollEntry.save();
    }

    // Return the generated records
    const allRecordsForMonth = await Payroll.find({ month }).populate("employee", "name initials email role");
    
    const mapped = await Promise.all(
      allRecordsForMonth.map(async (p) => {
        if (!p.employee) return null;

        let departmentName = "General";
        let title = p.employee.role === "admin" ? "ERP Administrator" : "Staff Member";
        const empDetails = await Employee.findOne({ user: p.employee._id }).populate("department");
        
        if (empDetails) {
          title = empDetails.designation;
          if (empDetails.department) {
            departmentName = empDetails.department.departmentName;
          }
        }

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
      })
    );

    res.json({
      message: "Payroll list updated successfully.",
      records: mapped.filter(Boolean),
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
