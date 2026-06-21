import transporter from "../config/nodemailer.js";

const FROM_EMAIL = '"AMDOX ERP" <08mjarir@gmail.com>';

const sendWelcomeEmail = async (email, name, password) => {
  const mailOptions = {
    from: FROM_EMAIL,
    to: email,
    subject: "Welcome to AMDOX ERP System!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #2563EB;">Welcome to the Team, ${name}!</h2>
        <p>Your enterprise ERP profile has been initialized by HR. You can now access your dashboard to clock-in shifts, submit leave requests, and track tasks.</p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Workspace Login Details:</strong></p>
          <p style="margin: 5px 0 0 0;">Work Email: <code>${email}</code></p>
          <p style="margin: 5px 0 0 0;">Temporary Password: <code>${password}</code></p>
        </div>
        <p style="font-size: 12px; color: #64748B;">Please change your password immediately upon your first sign in.</p>
      </div>
    `,
  };
  return await transporter.sendMail(mailOptions);
};

const sendTaskAssignmentEmail = async (email, taskTitle, dueDate, managerName) => {
  const mailOptions = {
    from: FROM_EMAIL,
    to: email,
    subject: `New Task Assigned: ${taskTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #2563EB;">Task Allocated</h2>
        <p>A new task has been assigned to you by <strong>${managerName}</strong>.</p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Task Details:</strong></p>
          <p style="margin: 5px 0 0 0;">Title: <code>${taskTitle}</code></p>
          <p style="margin: 5px 0 0 0;">Due Date: <code>${dueDate}</code></p>
        </div>
        <p>Please review full sprint details on your My Tasks workspace board.</p>
      </div>
    `,
  };
  return await transporter.sendMail(mailOptions);
};

const sendLeaveApprovalEmail = async (email, leaveType, startDate, endDate, status, managerName) => {
  const isApproved = status === "approved";
  const mailOptions = {
    from: FROM_EMAIL,
    to: email,
    subject: `Leave Application Status: ${status.toUpperCase()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: ${isApproved ? "#10B981" : "#EF4444"};">Leave Application ${isApproved ? "Approved" : "Rejected"}</h2>
        <p>Your request for ${leaveType} leave from ${startDate} to ${endDate} has been reviewed and <strong>${status}</strong> by HR / ${managerName}.</p>
        <p>Review current balances in your Personal Leave Request Portal.</p>
      </div>
    `,
  };
  return await transporter.sendMail(mailOptions);
};

const sendPasswordResetEmail = async (email, resetUrl) => {
  const mailOptions = {
    from: FROM_EMAIL,
    to: email,
    subject: "AMDOX ERP Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #2563EB;">Reset Password Request</h2>
        <p>You requested a password reset for your AMDOX ERP account. Please click the button below to configure your credentials:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
        </div>
        <p style="font-size: 12px; color: #64748B;">This link is valid for 1 hour. If you did not request this, please ignore this email.</p>
      </div>
    `,
  };
  return await transporter.sendMail(mailOptions);
};

export {
  sendWelcomeEmail,
  sendTaskAssignmentEmail,
  sendLeaveApprovalEmail,
  sendPasswordResetEmail,
};
