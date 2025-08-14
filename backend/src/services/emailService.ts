// src/services/emailService.ts
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter using Gmail with enhanced debugging
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS, // Your Gmail app password
  },
  debug: true, // Enable debug logging
  logger: true, // Enable logger
});

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    console.log('=== EMAIL SERVICE DEBUG ===');
    console.log('📧 EMAIL_USER:', process.env.EMAIL_USER);
    console.log('📧 EMAIL_PASS exists:', !!process.env.EMAIL_PASS);
    console.log('📧 To:', options.to);
    console.log('📧 Subject:', options.subject);

    // Test the SMTP connection first
    console.log('🔍 Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');

    const mailOptions = {
      from: `"Learning Management System" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const result = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully!');
    console.log('📨 Message ID:', result.messageId);
    console.log('=== END EMAIL DEBUG ===');
    
    return true;
  } catch (error: any) {
    console.error('❌ EMAIL SENDING FAILED:', error);
    console.log('=== END EMAIL DEBUG ===');
    return false;
  }
};

// Fixed email template with correct password setup URL
export const generateWelcomeEmail = (employeeName: string, companyName: string = 'Your Company', token?: string) => {
  // ✅ Fixed: Correct URL for password setup
  const passwordSetupUrl = token 
    ? `${process.env.FRONTEND_URL || 'http://localhost:5173'}/employee/set-password?token=${token}`
    : `${process.env.FRONTEND_URL || 'http://localhost:5173'}/employee/set-password`;
  
  return {
    subject: 'Welcome to the Learning Management System - Set Your Password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .email-container {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .email-content {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            color: #333;
            margin-bottom: 30px;
          }
          .welcome-message {
            color: #555;
            line-height: 1.6;
            margin-bottom: 25px;
          }
          .cta-button {
            display: inline-block;
            background-color: #4F46E5;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #777;
            font-size: 14px;
          }
          .company-info {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-content">
            <div class="header">
              <h1>🎉 Welcome to Our Learning Management System!</h1>
            </div>
            
            <div class="welcome-message">
              <p>Dear <strong>${employeeName}</strong>,</p>
              
              <p>Congratulations! Your account has been successfully created in our Learning Management System by the HR team at <strong>${companyName}</strong>.</p>
              
              <div class="company-info">
                <h3>🔐 Set Your Password</h3>
                <p>To get started with your learning journey, you need to <strong>set up your password</strong> for the system.</p>
              </div>
              
              <p><strong>Important:</strong> Please click the button below to set your password and activate your account:</p>
              
              <div style="text-align: center;">
                <a href="${passwordSetupUrl}" class="cta-button">Set My Password</a>
              </div>
              
              <p style="text-align: center; margin: 20px 0; color: #666; font-size: 14px;">
                Or copy and paste this link in your browser:
              </p>
              <p style="word-break: break-all; color: #007bff; text-align: center; font-size: 12px;">
                ${passwordSetupUrl}
              </p>
              
            </div>
            
            <div class="footer">
              <p><strong>What's Next?</strong></p>
              <p>After setting your password, you'll be able to:</p>
              <ul>
                <li>Access your personalized learning dashboard</li>
                <li>View and track your learning progress</li>
                <li>Participate in training modules</li>
                <li>Earn rewards for your achievements</li>
              </ul>
              
              <p><strong>Need Help?</strong></p>
              <p>If you have any questions or need assistance, please contact your HR department.</p>
              
              <p><strong>Security Notice:</strong></p>
              <p>This password setup link will expire in 7 days for security reasons. If you don't set your password within this time, please contact HR for assistance.</p>
              
              <p>Best regards,<br>
              <strong>The Learning Management System Team</strong><br>
              ${companyName}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Welcome to Our Learning Management System!
      
      Dear ${employeeName},
      
      Congratulations! Your account has been successfully created in our Learning Management System by the HR team at ${companyName}.
      
      To get started with your learning journey, you need to set up your password for the system.
      
      Please visit this link to set your password: ${passwordSetupUrl}
      
      After setting your password, you'll be able to:
      - Access your personalized learning dashboard
      - View and track your learning progress
      - Participate in training modules
      - Earn rewards for your achievements
      
      This password setup link will expire in 7 days for security reasons.
      
      If you have any questions or need assistance, please contact your HR department.
      
      Best regards,
      The Learning Management System Team
      ${companyName}
    `
  };
};