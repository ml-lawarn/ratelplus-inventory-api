// /src/infrastructure/email/email.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import { SendEmailOptions } from './interfaces/send-email.interface';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  private readonly logoPath = path.join(
    process.cwd(),
    'src',
    'infrastructure',
    'storage',
    'images',
    'ratel-logo.png',
  );

  private readonly coverImagePath = path.join(
    process.cwd(),
    'src',
    'infrastructure',
    'storage',
    'images',
    'ratel-cover-image.jpeg',
  );

  onModuleInit() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    this.logger.log('Email transporter initialized');
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      // Inject the attachments into the payload here
      attachments: this.getDefaultAttachments(),
    });

    this.logger.log(`Email sent to ${options.to}`);
  }

  getDefaultAttachments() {
    return [
      {
        filename: 'ratel-logo.png',
        path: this.logoPath,
        cid: 'ratel-logo',
      },
      {
        // Fixed file extension to match the source file type
        filename: 'ratel-cover-image.jpeg',
        path: this.coverImagePath,
        cid: 'ratel-cover-image',
      },
    ];
  }
}
