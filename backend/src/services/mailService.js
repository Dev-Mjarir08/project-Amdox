import transporter from "../config/nodemailer.js";

const FROM_EMAIL = '"AMDOX Technologies" <08mjarir@gmail.com>';
const LOGO_URL = "https://raw.githubusercontent.com/Dev-Mjarir08/project-Amdox/main/frontend/src/assets/logo.png";
const APP_NAME = "AMDOX Technologies";
const APP_URL = "https://project-amdox.vercel.app";

const wrapEmailTemplate = (title, contentHtml) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 10px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08);">
              
              <!-- Company Header Bar -->
              <tr>
                <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 25px 30px; text-align: left;">
                  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td width="50" align="left" style="vertical-align: middle;">
                        <img src="${LOGO_URL}" alt="AMDOX Logo" width="42" height="42" style="display: block; border-radius: 10px; background-color: #2563eb; padding: 6px;" />
                      </td>
                      <td style="vertical-align: middle; padding-left: 15px;">
                        <span style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px; display: block; line-height: 1.2;">${APP_NAME}</span>
                        <span style="font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; display: block; margin-top: 3px;">Enterprise Resource Planning System</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Email Content -->
              <tr>
                <td style="padding: 35px 30px; color: #334155; font-size: 15px; line-height: 1.6;">
                  ${contentHtml}
                </td>
              </tr>

              <!-- Enterprise Footer -->
              <tr>
                <td style="background-color: #f8fafc; padding: 20px 30px; border-top: 1px solid #e2e8f0; text-align: center;">
                  <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #475569;">${APP_NAME} Pvt. Ltd.</p>
                  <p style="margin: 0 0 12px 0; font-size: 11px; color: #94a3b8; line-height: 1.4;">
                    This email was sent automatically by the AMDOX ERP System.<br />Please do not reply directly to this automated address.
                  </p>
                  <p style="margin: 0; font-size: 11px; color: #cbd5e1;">
                    &copy; 2026 AMDOX Technologies. All rights reserved. &bull; <a href="${APP_URL}" style="color: #2563eb; text-decoration: none;">Visit ERP Portal</a>
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

const sendWelcomeEmail = async (email, name, password) => {
  const content = `
    <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 22px; font-weight: 800;">Welcome to the Team, ${name}!</h2>
    <p style="margin: 0 0 20px 0; color: #475569;">Your enterprise ERP user account has been successfully initialized by HR. You can now log into your employee portal to track attendance, apply for leave, and view your tasks.</p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #2563eb; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <p style="margin: 0 0 10px 0; font-size: 13px; font-weight: 700; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px;">Account Credentials</p>
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 14px;">
        <tr>
          <td style="padding: 4px 0; color: #64748b; font-weight: 600; width: 140px;">Work Email:</td>
          <td style="padding: 4px 0; color: #0f172a; font-weight: 700;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #64748b; font-weight: 600;">Temporary Password:</td>
          <td style="padding: 4px 0; color: #2563eb; font-weight: 700; font-family: monospace; font-size: 15px;">${password}</td>
        </tr>
      </table>
    </div>

    <div style="text-align: center; margin: 30px 0 10px 0;">
      <a href="${APP_URL}/login" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">Sign In to Workspace</a>
    </div>
    <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 15px;">Please change your temporary password immediately upon your first sign in.</p>
  `;

  const mailOptions = {
    from: FROM_EMAIL,
    to: email,
    subject: "Welcome to AMDOX ERP System!",
    html: wrapEmailTemplate("Welcome to AMDOX ERP", content),
  };
  return await transporter.sendMail(mailOptions);
};

const sendTaskAssignmentEmail = async (email, taskTitle, dueDate, managerName) => {
  const content = `
    <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 22px; font-weight: 800;">New Task Assigned</h2>
    <p style="margin: 0 0 20px 0; color: #475569;">A new project task has been assigned to you by <strong>${managerName}</strong>.</p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #0284c7; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <p style="margin: 0 0 10px 0; font-size: 13px; font-weight: 700; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px;">Task Briefing</p>
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 14px;">
        <tr>
          <td style="padding: 4px 0; color: #64748b; font-weight: 600; width: 120px;">Task Title:</td>
          <td style="padding: 4px 0; color: #0f172a; font-weight: 700;">${taskTitle}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #64748b; font-weight: 600;">Due Date:</td>
          <td style="padding: 4px 0; color: #dc2626; font-weight: 700;">${dueDate}</td>
        </tr>
      </table>
    </div>

    <div style="text-align: center; margin: 25px 0 10px 0;">
      <a href="${APP_URL}/employee/my-tasks" style="background-color: #0f172a; color: #ffffff; padding: 12px 26px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; display: inline-block;">View Task in Workspace</a>
    </div>
  `;

  const mailOptions = {
    from: FROM_EMAIL,
    to: email,
    subject: `New Task Assigned: ${taskTitle}`,
    html: wrapEmailTemplate("New Task Assigned", content),
  };
  return await transporter.sendMail(mailOptions);
};

const sendLeaveApprovalEmail = async (email, leaveType, startDate, endDate, status, managerName) => {
  const isApproved = status === "approved";
  const content = `
    <h2 style="margin: 0 0 16px 0; color: ${isApproved ? "#059669" : "#dc2626"}; font-size: 22px; font-weight: 800;">
      Leave Request ${isApproved ? "Approved" : "Rejected"}
    </h2>
    <p style="margin: 0 0 20px 0; color: #475569;">
      Your application for <strong>${leaveType}</strong> from <strong>${startDate}</strong> to <strong>${endDate}</strong> has been reviewed and <strong style="color: ${isApproved ? "#059669" : "#dc2626"};">${status.toUpperCase()}</strong> by HR / ${managerName}.
    </p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid ${isApproved ? "#10b981" : "#ef4444"}; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 14px;">
        <tr>
          <td style="padding: 4px 0; color: #64748b; font-weight: 600; width: 140px;">Leave Category:</td>
          <td style="padding: 4px 0; color: #0f172a; font-weight: 700;">${leaveType}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #64748b; font-weight: 600;">Duration:</td>
          <td style="padding: 4px 0; color: #0f172a; font-weight: 700;">${startDate} &rarr; ${endDate}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #64748b; font-weight: 600;">Status Result:</td>
          <td style="padding: 4px 0; color: ${isApproved ? "#059669" : "#dc2626"}; font-weight: 800; text-transform: uppercase;">${status}</td>
        </tr>
      </table>
    </div>
  `;

  const mailOptions = {
    from: FROM_EMAIL,
    to: email,
    subject: `Leave Application Status: ${status.toUpperCase()}`,
    html: wrapEmailTemplate("Leave Request Status", content),
  };
  return await transporter.sendMail(mailOptions);
};

const sendPasswordResetEmail = async (email, resetUrl) => {
  const content = `
    <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 22px; font-weight: 800;">Password Reset Request</h2>
    <p style="margin: 0 0 20px 0; color: #475569;">You requested a password reset for your AMDOX ERP account. Click the button below to update your security credentials:</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);">Reset My Password</a>
    </div>
    <p style="font-size: 12px; color: #94a3b8; text-align: center;">This link is valid for 1 hour. If you did not request this, please ignore this email.</p>
  `;

  const mailOptions = {
    from: FROM_EMAIL,
    to: email,
    subject: "AMDOX ERP Password Reset Request",
    html: wrapEmailTemplate("Password Reset Request", content),
  };
  return await transporter.sendMail(mailOptions);
};

const sendOTPEmail = async (email, otp, name = "User") => {
  const content = `
    <h2 style="margin: 0 0 10px 0; color: #0f172a; font-size: 22px; font-weight: 800;">Security Verification Code</h2>
    <p style="margin: 0 0 20px 0; color: #475569;">Hello <strong>${name}</strong>, use the One-Time Password (OTP) below to authenticate your account and secure your session:</p>

    <div style="background-color: #f1f5f9; border: 2px dashed #cbd5e1; padding: 25px; border-radius: 12px; text-align: center; margin: 25px 0;">
      <span style="font-size: 36px; font-weight: 900; color: #2563eb; letter-spacing: 10px; font-family: monospace;">${otp}</span>
    </div>

    <p style="font-size: 13px; color: #64748b; text-align: center; margin-top: 15px;">This OTP code is valid for <strong>10 minutes</strong>. Do not share this code with anyone for security purposes.</p>
  `;

  const mailOptions = {
    from: FROM_EMAIL,
    to: email,
    subject: `AMDOX ERP - Your Verification OTP Code is ${otp}`,
    html: wrapEmailTemplate("Email OTP Verification", content),
  };
  return await transporter.sendMail(mailOptions);
};

export {
  sendWelcomeEmail,
  sendTaskAssignmentEmail,
  sendLeaveApprovalEmail,
  sendPasswordResetEmail,
  sendOTPEmail,
};
