import { Injectable  } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }
  async sendPasswordResetEmail(
    email: string,
    resetLink: string,
  ): Promise<boolean> {
    try {
      const subject = 'Reset Your Password';
      const html = this.getPasswordResetTemplate(resetLink);

      await this.transporter.sendMail({
        from: this.configService.get('USER'),
        to: email,
        subject,
        html,
      });

      return true;
    } catch (error) {
      console.log(error);
      
      return false;
    }
  }

  private getPasswordResetTemplate(
    resetLink: string,
  ): string {
    const appName = 'FitTech';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: white;
              padding: 20px;
              border-radius: 8px;
            }
            .cta-button {
              display: inline-block;
              background-color: #4285F4;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 4px;
              margin: 20px 0;
              font-weight: bold;
            }
            .warning {
              background-color: #fee;
              border-left: 4px solid #d32f2f;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Password Reset Request</h1>

            <p>Hi Manager,</p>

            <p>We received a request to reset your password for your FitTech account.</p>

            <a href="${resetLink}" class="cta-button">Reset Your Password</a>

            <p>If you didn't request a password reset, you can safely ignore this email.</p>

            <div class="warning">
              <p><strong>⚠️ Important:</strong> This link will expire in 1 hour for security reasons.</p>
            </div>

          </div>
        </body>
      </html>
    `;
  }
}
