import PDFDocument from 'pdfkit';

export const buildAssignmentsPdf = (
  doc: typeof PDFDocument,
  data: {
    activeAssignments: number;
    returnedAssignments: number;
  },
) => {
  doc.fontSize(22).text('RatelPlus Assignments Report');

  doc.moveDown();

  doc.fontSize(14).text(`Active Assignments: ${data.activeAssignments}`);

  doc.text(`Returned Assignments: ${data.returnedAssignments}`);

  doc.moveDown();

  doc.text(`Generated: ${new Date().toLocaleString()}`);
};
