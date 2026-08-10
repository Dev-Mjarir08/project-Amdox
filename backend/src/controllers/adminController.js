import User from "../models/User.js";

const createAdmin = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Name, email, and password are required.",
        data: null,
        errors: ["Name, email, and password are required."],
        timestamp: new Date().toISOString()
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "Email is already in use.",
        data: null,
        errors: ["Email is already in use."],
        timestamp: new Date().toISOString()
      });
    }

    const admin = new User({
      name,
      email,
      password, // userSchema.pre("save") will hash it automatically
      role: "admin",
      phone: phone || "",
      status: "active"
    });

    await admin.save();

    res.status(201).json({
      success: true,
      message: "Admin created successfully.",
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        phone: admin.phone
      },
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

export { createAdmin };
