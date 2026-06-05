import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import * as nodemailer from 'nodemailer';

import { SendEmailOptions } from './interfaces/send-email.interface';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);

  private transporter: nodemailer.Transporter;

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
    });

    this.logger.log(`Email sent to ${options.to}`);
  }
}
