// utils/emailService.js
const nodemailer = require("nodemailer");

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail(to, subject, html) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Email sending failed:", error);
      throw error;
    }
  }

  async sendWelcomeEmail(user) {
    const subject = "Welcome to Fitness Tracker!";
    const html = `
      <h1>Welcome ${user.name}!</h1>
      <p>Thank you for joining our fitness community.</p>
      <p>Get started by:</p>
      <ul>
        <li>Completing your profile</li>
        <li>Setting your fitness goals</li>
        <li>Tracking your first workout</li>
      </ul>
    `;

    await this.sendEmail(user.email, subject, html);
  }

  async sendPasswordReset(user, resetToken) {
    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const subject = "Password Reset Request";
    const html = `
      <h1>Password Reset</h1>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetURL}">Reset Password</a>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    await this.sendEmail(user.email, subject, html);
  }

  async sendWorkoutReminder(user, workout) {
    const subject = "Workout Reminder";
    const html = `
      <h1>Workout Reminder</h1>
      <p>Don't forget your ${workout.type} workout today!</p>
      <p>Duration: ${workout.duration} minutes</p>
      <a href="${process.env.FRONTEND_URL}/workouts/${workout._id}">View Workout</a>
    `;

    await this.sendEmail(user.email, subject, html);
  }
}

module.exports = new EmailService();
