import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from utils.logger import get_logger

logger = get_logger("EmailService")

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = "postmanmail21@gmail.com"
SENDER_PASSWORD = "wecw dxpw xsjo upgt"

def send_reset_otp_email(to_email: str, otp: str) -> bool:
    """
    Sends a 6-digit OTP code to the user's email address for password resets
    using Gmail SMTP and Google App Password.
    """
    logger.info(f"Preparing to send password reset OTP to: {to_email}")
    
    # HTML Email Template styled in LogNexio's brown/beige project theme
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{
                font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
                background-color: #faf6f0;
                color: #1c120c;
                margin: 0;
                padding: 0;
            }}
            .container {{
                max-width: 500px;
                margin: 40px auto;
                background-color: #f1e6d5;
                border: 1px solid #dfcbb5;
                border-radius: 24px;
                padding: 40px;
                box-shadow: 0 10px 25px -5px rgba(110, 61, 28, 0.05);
            }}
            .logo {{
                font-weight: 800;
                font-size: 20px;
                text-transform: uppercase;
                color: #6e3d1c;
                text-align: center;
                margin-bottom: 24px;
                letter-spacing: 1px;
            }}
            .divider {{
                height: 1px;
                background-color: #dfcbb5;
                margin: 20px 0;
            }}
            h2 {{
                font-size: 22px;
                font-weight: 700;
                text-align: center;
                margin-bottom: 8px;
            }}
            p {{
                font-size: 14px;
                line-height: 1.6;
                color: #6e3d1c;
                text-align: center;
                margin-bottom: 24px;
            }}
            .otp-box {{
                font-family: monospace;
                font-size: 32px;
                font-weight: 800;
                letter-spacing: 8px;
                text-align: center;
                padding: 16px;
                background-color: #faf6f0;
                border: 2px dashed #6e3d1c;
                border-radius: 16px;
                color: #6e3d1c;
                margin: 30px auto;
                max-width: 250px;
            }}
            .footer {{
                font-size: 11px;
                color: #8c6f56;
                text-align: center;
                margin-top: 30px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">LogNexio AI</div>
            <div class="divider"></div>
            <h2>Password Reset Verification</h2>
            <p>You requested a password reset for your LogNexio account. Use the verification code below to set a new password. This code will expire in 15 minutes.</p>
            <div class="otp-box">{otp}</div>
            <p style="font-size: 12px; margin-top: 20px;">If you did not request this password reset, you can safely ignore this email.</p>
            <div class="divider"></div>
            <div class="footer">
                &copy; 2026 LogNexio AI Platform. All Rights Reserved.
            </div>
        </div>
    </body>
    </html>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "LogNexio AI - Password Reset Code"
    msg["From"] = f"LogNexio Support <{SENDER_EMAIL}>"
    msg["To"] = to_email

    msg.attach(MIMEText(f"Your password reset verification code is: {otp}. It is valid for 15 minutes.", "plain"))
    msg.attach(MIMEText(html_content, "html"))

    try:
        # Establish SMTP connection
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.sendmail(SENDER_EMAIL, to_email, msg.as_string())
        server.quit()
        logger.info(f"Password reset email sent successfully to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return False
