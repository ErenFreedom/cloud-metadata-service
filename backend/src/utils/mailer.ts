import dotenv from 'dotenv';
dotenv.config();   // 🔥 ADD THIS AT TOP

import nodemailer from 'nodemailer';

// console.log("EMAIL_USER:", process.env.EMAIL_USER);
// console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);
// console.log("EMAIL_PASS length:", process.env.EMAIL_PASS?.length);

export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendOTPEmail(to: string, otp: string) {
  await transporter.sendMail({
    from: `"IoT Cloud" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your OTP Verification Code",
    html: `
      <h3>Your OTP Code</h3>
      <h2>${otp}</h2>
      <p>This code expires in 5 minutes.</p>
    `,
  });
}