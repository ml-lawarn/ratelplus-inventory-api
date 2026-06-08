import PDFDocument from 'pdfkit';

export const buildInventorySummaryPdf = (
  doc: typeof PDFDocument,
  data: {
    totalItems: number;
    totalWarehouses: number;
    totalCategories: number;
  },
) => {
  doc.fontSize(22).text('RatelPlus Inventory Summary Report');

  doc.moveDown();

  doc.fontSize(14).text(`Total Equipment Items: ${data.totalItems}`);

  doc.text(`Total Warehouses: ${data.totalWarehouses}`);

  doc.text(`Total Categories: ${data.totalCategories}`);

  doc.moveDown();

  doc.text(`Generated: ${new Date().toLocaleString()}`);
};
