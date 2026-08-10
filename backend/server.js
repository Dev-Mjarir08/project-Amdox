import "dotenv/config";
import app from "./app.js";
import connectDB from "./src/config/db.js";

const PORT = process.env.PORT || 5000;

// Initialize Database connection
connectDB().then(() => {
  // Start server listening
  app.listen(PORT, () => {
    console.log(`🚀 AMDOX ERP System - Enterprise MERN Backend Active   `);
    console.log(`🌐 API Server Running on: http://localhost:${PORT}      `);
    
  });
}).catch((err) => {
  console.error("Critical: Failed to launch database and initialize API server:", err.message);
  process.exit(1);
});

