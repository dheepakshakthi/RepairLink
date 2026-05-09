const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
      port: process.env.SMTP_PORT || 2525,
      auth: {
        user: process.env.SMTP_USER || 'user',
        pass: process.env.SMTP_PASS || 'pass'
      }
    });
    this.from = process.env.EMAIL_FROM || 'noreply@repairlink.com';
  }

  async sendEmail(options) {
    try {
      const mailOptions = {
        from: this.from,
        to: options.to,
        subject: options.subject,
        html: options.html
      };
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending email: ', error);
    }
  }

  async sendVerificationEmail(user, token) {
    const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${token}&email=${user.email}`;
    const html = `
      <h1>Welcome to RepairLink, ${user.name}!</h1>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verifyUrl}">Verify Email</a>
    `;
    await this.sendEmail({ to: user.email, subject: 'Verify your email address', html });
  }

  async sendPasswordResetEmail(user, token) {
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    const html = `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset. Click the link below to set a new password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>If you didn't request this, you can ignore this email.</p>
    `;
    await this.sendEmail({ to: user.email, subject: 'Password Reset', html });
  }

  async sendBidReceivedEmail(customer, ticket, bid) {
    const html = `
      <h1>New Bid Received</h1>
      <p>Hi ${customer.name},</p>
      <p>You have received a new bid of $${bid.amount} for your ticket <strong>${ticket.title}</strong>.</p>
      <p>Log in to review the bid.</p>
    `;
    await this.sendEmail({ to: customer.email, subject: 'New Bid on Your Ticket', html });
  }

  async sendBidAcceptedEmail(provider, ticket) {
    const html = `
      <h1>Bid Accepted!</h1>
      <p>Hi,</p>
      <p>Your bid for the ticket <strong>${ticket.title}</strong> has been accepted.</p>
      <p>Please log in to check the details and coordinate with the customer.</p>
    `;
    // Assuming provider document has an email or we can pass user object of provider
    const to = provider.email || provider.user?.email || 'provider@example.com';
    await this.sendEmail({ to, subject: 'Your Bid was Accepted', html });
  }

  async sendStatusUpdateEmail(user, ticket) {
    const html = `
      <h1>Ticket Status Updated</h1>
      <p>Hi ${user.name},</p>
      <p>The status of the ticket <strong>${ticket.title}</strong> has been updated to: ${ticket.status}.</p>
    `;
    await this.sendEmail({ to: user.email, subject: 'Ticket Status Update', html });
  }

  async sendOtpEmail(user, otp, leg) {
    const html = `
      <h1>OTP Verification</h1>
      <p>Hi ${user.name},</p>
      <p>Your OTP for ${leg} is: <strong>${otp}</strong></p>
      <p>Please do not share this with anyone.</p>
    `;
    await this.sendEmail({ to: user.email, subject: 'Your OTP Code', html });
  }
}

module.exports = new EmailService();
