import nodemailer from "nodemailer";
import "dotenv/config";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "08mjarir@gmail.com",
    pass: "cznu krwi witd yjye"
  }
});

export default transporter;
