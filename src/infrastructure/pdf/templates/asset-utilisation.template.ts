import PDFDocument from 'pdfkit';

export const buildAssetUtilisationPdf = (
  doc: typeof PDFDocument,
  data: {
    id: string;
    assetTag: string;
    equipmentName: string;
    status: unknown;
    assignmentCount: number;
    maintenanceCount: number;
    utilisationPercent: number;
  }[],
) => {
  doc.fontSize(22).text('RatelPlus Asset Utilisation Report');

  doc.moveDown();

  data.forEach((item) => {
    doc.fontSize(14).text(`Asset Tag: ${item.assetTag}`);
    doc.text(`Equipment Name: ${item.equipmentName}`);
    doc.text(`Status: ${item.status}`);
    doc.text(`Assignment Count: ${item.assignmentCount}`);
    doc.text(`Maintenance Count: ${item.maintenanceCount}`);
    doc.text(`Utilisation Percent: ${item.utilisationPercent}%`);
    doc.moveDown();
  });

  doc.moveDown();

  doc.text(`Generated: ${new Date().toLocaleString()}`);
};
