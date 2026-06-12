// /src/infrastructure/email/email.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import { SendEmailOptions } from './interfaces/send-email.interface';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  private readonly logoPath: string;
  private readonly coverImagePath: string;

  constructor() {
    const isProduction = process.env.NODE_ENV === 'production';
    const basePath = isProduction
      ? path.join(__dirname, '..', '..', 'storage', 'images')
      : path.join(process.cwd(), 'src', 'infrastructure', 'storage', 'images');
    this.logoPath = path.join(basePath, 'ratel-logo.png');
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
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      connectionTimeout: 20000,
      greetingTimeout: 20000,
      socketTimeout: 20000,
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
        attachments: this.getDefaultAttachments(),
      });

      this.logger.log(`Email sent to ${options.to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${options.to}:`,
        error.stack || error.message,
      );
      // Don't rethrow - let the application continue running
    }
  }

  getDefaultAttachments() {
    return [
      {
        filename: 'ratel-logo.png',
        path: this.logoPath,
        cid: 'ratel-logo',
      },
      {
        filename: 'ratel-cover-image.jpeg',
        path: this.coverImagePath,
        cid: 'ratel-cover-image',
      },
    ];
  }
}
