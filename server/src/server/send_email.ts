import nodemailer from 'nodemailer'; // Import the nodemailer module
import dotenv from 'dotenv'; // Import the dotenv module

// Load environment variables from .env file
dotenv.config();

// Create a transporter object
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export function sendEmail(
  to: string,
  subject: string,
  text: string,
  html: string,
) {
  // Set up email data
  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender address
    to: to, // List of recipients
    subject: subject, // Subject line
    text: text, // Plain text body
    html: html, // HTML body
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.error(error);
    }
    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  });
}
