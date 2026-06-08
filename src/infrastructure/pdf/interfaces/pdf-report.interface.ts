export interface PdfReportData {
  title: string;

  generatedAt: Date;

  sections: {
    title: string;

    rows: {
      label: string;

      value: string | number;
    }[];
  }[];
}
