import { Injectable } from '@nestjs/common';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

// Use dynamic import for pdfmake
let PdfMake: any;
try {
  const pdfMakeBuild = require('pdfmake/build/pdfmake');
  const pdfFontsBuild = require('pdfmake/build/vfs_fonts');

  // Handle both CommonJS and ES module exports
  PdfMake = pdfMakeBuild.default || pdfMakeBuild;
  const pdfFonts = pdfFontsBuild.default || pdfFontsBuild;

  // Set fonts with proper error handling
  if (pdfFonts && pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
    PdfMake.vfs = pdfFonts.pdfMake.vfs;
  } else if (pdfFonts && pdfFonts.vfs) {
    PdfMake.vfs = pdfFonts.vfs;
  } else {
    console.warn('pdfMake fonts not loaded, PDFs may not render correctly');
  }
} catch (error) {
  console.error('Error loading pdfMake:', error);
}

@Injectable()
export class PdfService {
  constructor() {
    // pdfmake is initialized with fonts
    if (!PdfMake) {
      console.error('PdfMake not initialized properly');
    }
  }

  async generateInvoice(payment: any, booking: any, user: any): Promise<Buffer> {
    if (!PdfMake) {
      throw new Error('PDF generation is not available. PdfMake not initialized.');
    }

    const invoiceDate = new Date(payment.createdAt);
    const invoiceNumber = `INV-${invoiceDate.getFullYear()}${String(invoiceDate.getMonth() + 1).padStart(2, '0')}-${payment.id.substring(0, 8).toUpperCase()}`;

    const docDefinition: TDocumentDefinitions = {
      content: [
        // Header
        {
          columns: [
            {
              width: '*',
              stack: [
                { text: 'BALENO SAN ZENO', style: 'header', color: '#0066cc' },
                { text: 'Spazio Coworking & Eventi', style: 'subheader' },
                { text: 'Via San Zeno, Verona, Italia', fontSize: 10 },
                { text: 'P.IVA: IT12345678901', fontSize: 10 },
              ],
            },
            {
              width: 'auto',
              stack: [
                { text: 'FATTURA/RICEVUTA', style: 'invoiceTitle', alignment: 'right' },
                { text: `N. ${invoiceNumber}`, alignment: 'right', fontSize: 11, bold: true },
                {
                  text: `Data: ${invoiceDate.toLocaleDateString('it-IT')}`,
                  alignment: 'right',
                  fontSize: 10,
                },
              ],
            },
          ],
        },

        { text: '', margin: [0, 20] }, // Spacer

        // Customer Info
        {
          columns: [
            {
              width: '50%',
              stack: [
                { text: 'Intestato a:', style: 'sectionHeader' },
                { text: `${user.firstName} ${user.lastName}`, fontSize: 11, bold: true },
                { text: user.email, fontSize: 10 },
              ],
            },
            {
              width: '50%',
              stack: [
                { text: 'Dettagli Pagamento:', style: 'sectionHeader' },
                {
                  text: `Metodo: ${payment.method === 'STRIPE' ? 'Carta di Credito' : payment.method}`,
                  fontSize: 10,
                },
                { text: `ID Transazione: ${payment.stripePaymentId || payment.id}`, fontSize: 9 },
                {
                  text: `Stato: ${payment.status === 'SUCCEEDED' ? 'Completato' : payment.status}`,
                  fontSize: 10,
                  color: payment.status === 'SUCCEEDED' ? '#28a745' : '#dc3545',
                },
              ],
            },
          ],
        },

        { text: '', margin: [0, 20] }, // Spacer

        // Booking Details
        {
          text: 'Dettagli Prenotazione:',
          style: 'sectionHeader',
        },
        {
          table: {
            widths: ['*', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Descrizione', style: 'tableHeader' },
                { text: 'Data', style: 'tableHeader' },
                { text: 'Durata', style: 'tableHeader' },
                { text: 'Importo', style: 'tableHeader' },
              ],
              [
                {
                  stack: [
                    { text: booking.resource.name, bold: true },
                    { text: booking.title, fontSize: 9, color: '#666' },
                  ],
                },
                {
                  text: new Date(booking.startTime).toLocaleDateString('it-IT'),
                  fontSize: 10,
                },
                {
                  text: this.calculateDuration(booking.startTime, booking.endTime),
                  fontSize: 10,
                },
                {
                  text: `€${parseFloat(payment.amount.toString()).toFixed(2)}`,
                  bold: true,
                  fontSize: 11,
                },
              ],
            ],
          },
          layout: {
            fillColor: function (rowIndex: number) {
              return rowIndex === 0 ? '#f0f0f0' : null;
            },
            hLineWidth: function (i: number, node: any) {
              return i === 0 || i === 1 || i === node.table.body.length ? 1 : 0;
            },
            vLineWidth: function () {
              return 0;
            },
          },
        },

        { text: '', margin: [0, 15] }, // Spacer

        // Totals
        {
          columns: [
            { width: '*', text: '' },
            {
              width: 'auto',
              table: {
                widths: [120, 80],
                body: [
                  [
                    { text: 'Subtotale:', alignment: 'right', fontSize: 11 },
                    {
                      text: `€${parseFloat(payment.amount.toString()).toFixed(2)}`,
                      alignment: 'right',
                      fontSize: 11,
                    },
                  ],
                  [
                    { text: 'IVA (22%):', alignment: 'right', fontSize: 11 },
                    {
                      text: `€${(parseFloat(payment.amount.toString()) * 0.22).toFixed(2)}`,
                      alignment: 'right',
                      fontSize: 11,
                    },
                  ],
                  [
                    { text: 'TOTALE:', alignment: 'right', fontSize: 13, bold: true },
                    {
                      text: `€${(parseFloat(payment.amount.toString()) * 1.22).toFixed(2)}`,
                      alignment: 'right',
                      fontSize: 13,
                      bold: true,
                      color: '#0066cc',
                    },
                  ],
                ],
              },
              layout: {
                hLineWidth: function (i: number, node: any) {
                  return i === node.table.body.length - 1 ? 2 : 1;
                },
                vLineWidth: function () {
                  return 0;
                },
                paddingTop: function (i: number) {
                  return i === 2 ? 8 : 4;
                },
                paddingBottom: function (i: number) {
                  return i === 2 ? 8 : 4;
                },
              },
            },
          ],
        },

        { text: '', margin: [0, 30] }, // Spacer

        // Footer Notes
        {
          text: 'Note:',
          style: 'sectionHeader',
        },
        {
          text: 'Grazie per aver scelto Baleno San Zeno. Questa ricevuta certifica il pagamento per la prenotazione indicata. Per qualsiasi domanda o chiarimento, non esitate a contattarci.',
          fontSize: 9,
          color: '#666',
          margin: [0, 5, 0, 10],
        },

        // Contact Info
        {
          canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#e0e0e0' }],
          margin: [0, 10, 0, 10],
        },
        {
          columns: [
            {
              width: '33%',
              stack: [
                { text: 'Email', fontSize: 9, bold: true },
                { text: 'info@balenosanzeno.it', fontSize: 9, color: '#0066cc' },
              ],
            },
            {
              width: '33%',
              stack: [
                { text: 'Telefono', fontSize: 9, bold: true },
                { text: '+39 045 1234567', fontSize: 9 },
              ],
            },
            {
              width: '34%',
              stack: [
                { text: 'Web', fontSize: 9, bold: true },
                { text: 'www.balenosanzeno.it', fontSize: 9, color: '#0066cc' },
              ],
            },
          ],
        },
      ],
      styles: {
        header: {
          fontSize: 22,
          bold: true,
          margin: [0, 0, 0, 5] as [number, number, number, number],
        },
        subheader: {
          fontSize: 12,
          color: '#666',
          margin: [0, 0, 0, 10] as [number, number, number, number],
        },
        invoiceTitle: {
          fontSize: 16,
          bold: true,
          color: '#0066cc',
        },
        sectionHeader: {
          fontSize: 12,
          bold: true,
          margin: [0, 10, 0, 5] as [number, number, number, number],
        },
        tableHeader: {
          bold: true,
          fontSize: 11,
          color: '#333',
        },
      },
      defaultStyle: {
        font: 'Roboto',
      },
    };

    return new Promise((resolve, reject) => {
      try {
        const pdfDocGenerator = PdfMake.createPdf(docDefinition);

        pdfDocGenerator.getBuffer((buffer: Buffer) => {
          resolve(buffer);
        }, (error: Error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  private calculateDuration(startTime: string, endTime: string): string {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes} min`;
    }

    return `${hours.toFixed(1)} ore`;
  }
}
