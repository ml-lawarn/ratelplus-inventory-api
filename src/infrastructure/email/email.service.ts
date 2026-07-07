// /src/infrastructure/email/email.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import * as fs from 'fs'; // Add fs module to verify files exist
import { Attachment } from 'nodemailer/lib/mailer'; // Import the precise type definition
import { SendEmailOptions } from './interfaces/send-email.interface';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  // private readonly logoPath: string;
  private readonly coverImagePath: string;

  constructor() {
    const isProduction = process.env.NODE_ENV === 'production';

    // FIXED: Removed 'src' from the production path array to match your actual dist layout
    const basePath = isProduction
      ? path.join(process.cwd(), 'dist', 'infrastructure', 'storage', 'images')
      : path.join(process.cwd(), 'src', 'infrastructure', 'storage', 'images');

    // this.logoPath = path.join(basePath, 'ratel-logo.png');
    this.coverImagePath = path.join(basePath, 'ratel-cover-image.jpeg');
  }

  onModuleInit() {
    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASSWORD
    ) {
      this.logger.warn(
        'SMTP configuration not found. Email service will be disabled.',
      );
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true', // Recommended: Use 465 and true for production VPS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    this.logger.log('Email transporter initialized');
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    if (!this.transporter) {
      this.logger.warn('Email service not configured. Skipping email send.');
      return;
    }

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: this.getValidAttachments(), // Safely filter out missing image assets
      });

      this.logger.log(`Email successfully sent to ${options.to}`);
    } catch (error) {
      this.logger.error(
        `CRITICAL error sending email to ${options.to}: ${error.message}`,
        error.stack,
      );
    }
  }

  private getValidAttachments() {
    // Explicitly type the array to prevent the 'never' error
    const attachments: Attachment[] = [];

    // Safely check if files exist inside Docker image volume before attaching
    // if (fs.existsSync(this.logoPath)) {
    //   attachments.push({
    //     filename: 'ratel-logo.png',
    //     path: this.logoPath,
    //     cid: 'ratel-logo',
    //   });
    // } else {
    //   this.logger.warn(`Email Asset Missing: ${this.logoPath}`);
    // }

    if (fs.existsSync(this.coverImagePath)) {
      attachments.push({
        filename: 'ratel-cover-image.jpeg',
        path: this.coverImagePath,
        cid: 'ratel-cover-image',
      });
    } else {
      this.logger.warn(`Email Asset Missing: ${this.coverImagePath}`);
    }

    return attachments;
  }
}
