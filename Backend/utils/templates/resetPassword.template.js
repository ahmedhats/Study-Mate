module.exports.resetPasswordTemplate = (resetLink, userName = 'User') => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Reset Your StudyMate Password</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f0f2f5;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            color: #121212;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          h2 {
            color: #121212;
            text-align: center;
            margin-bottom: 25px;
            font-size: 28px;
          }
          p {
            font-size: 16px;
            line-height: 1.6;
            color: #666;
            margin-bottom: 20px;
            text-align: center;
          }
          .button-container {
            text-align: center;
            margin: 30px 0;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            font-size: 16px;
            font-weight: 600;
            background-color: #121212;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            transition: all 0.3s ease;
          }
          .button:hover {
            background-color: #333;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
          .link-text {
            word-break: break-all;
            background: #f5f5f5;
            padding: 15px;
            border-radius: 4px;
            font-size: 14px;
            text-align: center;
            border: 1px solid #ddd;
          }
          .footer {
            margin-top: 40px;
            font-size: 13px;
            color: #666;
            text-align: center;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
          .highlight {
            color: #121212;
            font-weight: 600;
          }
          .button a {
            color: white !important;
            text-decoration: none;
          }
          .security-note {
            background-color: #f8f8f8;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
            color: #666;
          }
          .security-note strong {
            color: #121212;
          }
          .social-links {
            margin-top: 20px;
            display: flex;
            justify-content: center;
            gap: 16px;
          }
          .social-link {
            color: #666;
            text-decoration: none;
            font-size: 14px;
          }
          .social-link:hover {
            color: #121212;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">StudyMate</div>
            <h2>Reset Your Password</h2>
          </div>
          
          <p>Hello <span class="highlight">${userName}</span>,</p>
          <p>We received a request to reset your StudyMate account password. To proceed with the password reset, click the button below:</p>
          
          <div class="button-container">
            <a href="${resetLink}" class="button" target="_blank">Reset Password</a>
          </div>
          
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p class="link-text"><a href="${resetLink}" target="_blank">${resetLink}</a></p>
          
          <div class="security-note">
            <p><strong>Security Note:</strong> This link will expire in 1 hour for your security. If you didn't request this password reset, please ignore this email and ensure your account is secure.</p>
          </div>
          
          <div class="footer">
            <p>Need help? Contact our support team at <a href="mailto:support@studymate.com" style="color: #121212; text-decoration: none;">support@studymate.com</a></p>
            <div class="social-links">
              <a href="#" class="social-link">Twitter</a>
              <a href="#" class="social-link">Facebook</a>
              <a href="#" class="social-link">Instagram</a>
            </div>
            <p>© ${new Date().getFullYear()} StudyMate. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
};