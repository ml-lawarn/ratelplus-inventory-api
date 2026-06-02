// src/infrastructure/email/email.service.ts

import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendEmail(
    to: string,

    subject: string,

    body: string,
  ) {
    this.logger.log(`Email queued to ${to}`);

    return true;
  }
}
