import PDFDocument from 'pdfkit';

export const buildMaintenanceCostPdf = (
  doc: typeof PDFDocument,
  data: {
    _sum: {
      repairCost: unknown;
      laborCost: unknown;
      partsCost: unknown;
    };
  },
) => {
  doc.fontSize(22).text('RatelPlus Maintenance Cost Report');

  doc.moveDown();

  doc.text(`Repair Cost: ₦${data._sum.repairCost ?? 0}`);

  doc.text(`Labor Cost: ₦${data._sum.laborCost ?? 0}`);

  doc.text(`Parts Cost: ₦${data._sum.partsCost ?? 0}`);

  doc.moveDown();

  doc.text(`Generated: ${new Date().toLocaleString()}`);
};
