// src/infrastructure/pdf/pdf.service.ts

import { Injectable } from '@nestjs/common';

import PDFDocument from 'pdfkit';
import doc from 'pdfkit/js/pdfkit.standalone';

@Injectable()
export class PdfService {
  generatePdf(
    buildCallback: (doc: typeof PDFDocument) => void,
  ): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFDocument({
        margin: 50,
      });

      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => {
        chunks.push(chunk);
      });

      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });

      buildCallback(doc);

      doc.end();
    });
  }
}
