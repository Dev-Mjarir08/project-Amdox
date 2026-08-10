import app from "../app.js";
import connectDB from "../src/config/db.js";

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (err) {
    console.error("MongoDB Connection Warning in Vercel Function:", err.message);
  }
  return app(req, res);
}
