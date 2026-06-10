import PDFDocument from 'pdfkit';

export const buildWarrantyExpiryPdf = (
  doc: typeof PDFDocument,
  data: {
    items: {
      category: { name: string } | null;
      brand: { name: string } | null;
      warehouse: { name: string } | null;
    }[];
  },
) => {
  doc.fontSize(22).text('RatelPlus Warranty Expiry Report');

  doc.moveDown();

  if (data.items.length === 0) {
    doc.text('No items with warranty expiring within the specified period.');
  } else {
    data.items.forEach((item, index) => {
      doc
        .fontSize(14)
        .text(
          `${index + 1}. Category: ${item.category?.name ?? 'N/A'}, Brand: ${
            item.brand?.name ?? 'N/A'
          }, Warehouse: ${item.warehouse?.name ?? 'N/A'}`,
        );
    });
  }

  doc.moveDown();

  doc.text(`Generated: ${new Date().toLocaleString()}`);
};
