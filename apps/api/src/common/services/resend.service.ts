import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export interface BookingDetails {
  id: string;
  resourceName: string;
  startDate: Date;
  endDate: Date;
  requestDate?: Date;
  totalAmount?: number;
  userName?: string;
  userEmail?: string;
}

export interface PaymentDetails {
  stripePaymentUrl?: string;
  bankTransferDetails?: {
    bankName: string;
    accountHolder: string;
    iban: string;
    bic?: string;
    transferCode: string;
    causale: string;
    deadlineDays: number;
  };
}

export interface RejectionDetails {
  reason: string;
  reasonMessage: string;
  additionalNotes?: string;
}

@Injectable()
export class ResendService {
  private readonly logger = new Logger(ResendService.name);
  private resend: Resend | null = null;
  private fromEmail: string;
  private frontendUrl: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.fromEmail = this.configService.get<string>('RESEND_FROM_EMAIL', 'Baleno San Zeno <noreply@balenosanzeno.it>');
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');

    if (apiKey) {
      this.resend = new Resend(apiKey);
    } else {
      this.logger.warn('RESEND_API_KEY not configured. Email sending will be disabled.');
    }
  }

  async sendBookingApprovedEmail(
    to: string,
    booking: BookingDetails,
    payment?: PaymentDetails,
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.resend) {
      this.logger.warn('Resend not configured. Skipping email.');
      return { success: false, error: 'Resend not configured' };
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject: 'Prenotazione Approvata - Baleno San Zeno',
        html: this.getApprovedEmailTemplate(booking, payment),
      });

      if (error) {
        this.logger.error('Failed to send approval email', error);
        return { success: false, error: String(error) };
      }

      this.logger.log(`Approval email sent to ${to} for booking ${booking.id}`);
      return { success: true };
    } catch (error) {
      this.logger.error('Error sending approval email', error);
      return { success: false, error: String(error) };
    }
  }

  async sendBookingRejectedEmail(
    to: string,
    booking: BookingDetails,
    rejection: RejectionDetails,
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.resend) {
      this.logger.warn('Resend not configured. Skipping email.');
      return { success: false, error: 'Resend not configured' };
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject: 'Prenotazione Non Approvata - Baleno San Zeno',
        html: this.getRejectedEmailTemplate(booking, rejection),
      });

      if (error) {
        this.logger.error('Failed to send rejection email', error);
        return { success: false, error: String(error) };
      }

      this.logger.log(`Rejection email sent to ${to} for booking ${booking.id}`);
      return { success: true };
    } catch (error) {
      this.logger.error('Error sending rejection email', error);
      return { success: false, error: String(error) };
    }
  }

  async sendPaymentReminderEmail(
    to: string,
    booking: BookingDetails,
    paymentUrl: string,
    hoursRemaining: number,
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.resend) {
      this.logger.warn('Resend not configured. Skipping email.');
      return { success: false, error: 'Resend not configured' };
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject: 'Promemoria Pagamento - Baleno San Zeno',
        html: this.getReminderEmailTemplate(booking, paymentUrl, hoursRemaining),
      });

      if (error) {
        this.logger.error('Failed to send reminder email', error);
        return { success: false, error: String(error) };
      }

      this.logger.log(`Reminder email sent to ${to} for booking ${booking.id}`);
      return { success: true };
    } catch (error) {
      this.logger.error('Error sending reminder email', error);
      return { success: false, error: String(error) };
    }
  }

  async sendBookingCancelledEmail(
    to: string,
    booking: BookingDetails,
    reason: string,
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.resend) {
      this.logger.warn('Resend not configured. Skipping email.');
      return { success: false, error: 'Resend not configured' };
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject: 'Prenotazione Cancellata - Baleno San Zeno',
        html: this.getCancelledEmailTemplate(booking, reason),
      });

      if (error) {
        this.logger.error('Failed to send cancellation email', error);
        return { success: false, error: String(error) };
      }

      this.logger.log(`Cancellation email sent to ${to} for booking ${booking.id}`);
      return { success: true };
    } catch (error) {
      this.logger.error('Error sending cancellation email', error);
      return { success: false, error: String(error) };
    }
  }

  private getApprovedEmailTemplate(booking: BookingDetails, payment?: PaymentDetails): string {
    const hasStripe = payment?.stripePaymentUrl;
    const hasBankTransfer = payment?.bankTransferDetails;

    return `
      <!DOCTYPE html>
      <html lang="it">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: 'Work Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            background-color: #e5e5e5;
            color: #333333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
          }
          .header {
            background-color: #2B548E;
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .checkmark {
            font-size: 48px;
            margin-bottom: 16px;
          }
          .content {
            padding: 40px 30px;
          }
          .details-box {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .details-box h3 {
            margin-top: 0;
            color: #2B548E;
          }
          .payment-option {
            border: 2px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
          }
          .payment-option.recommended {
            border-color: #2B548E;
            position: relative;
          }
          .payment-option.recommended::before {
            content: "CONSIGLIATO";
            position: absolute;
            top: -12px;
            left: 20px;
            background: #2B548E;
            color: white;
            padding: 2px 10px;
            font-size: 12px;
            border-radius: 4px;
          }
          .payment-button {
            display: inline-block;
            background-color: #EDBB00;
            color: #2B548E;
            padding: 14px 40px;
            text-decoration: none;
            font-weight: 600;
            font-size: 18px;
            border-radius: 4px;
          }
          .bank-details {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 4px;
            margin: 15px 0;
          }
          .causale-code {
            background: #fff;
            padding: 10px;
            display: inline-block;
            margin-top: 5px;
            font-family: monospace;
            border: 1px solid #dee2e6;
            border-radius: 4px;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #6c757d;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="checkmark">✓</div>
            <h1>Prenotazione Approvata!</h1>
          </div>

          <div class="content">
            <p>Ciao,</p>
            <p>Ottima notizia! La tua richiesta di prenotazione è stata approvata.</p>

            <div class="details-box">
              <h3>Dettagli della prenotazione</h3>
              <p><strong>Risorsa:</strong> ${booking.resourceName}</p>
              <p><strong>Data inizio:</strong> ${new Date(booking.startDate).toLocaleDateString('it-IT', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
              <p><strong>Data fine:</strong> ${new Date(booking.endDate).toLocaleDateString('it-IT', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
              ${booking.totalAmount ? `<p><strong>Importo totale:</strong> €${((booking.totalAmount || 0) / 100).toFixed(2)}</p>` : ''}
            </div>

            ${hasStripe || hasBankTransfer ? `
              <h3>Completa il pagamento</h3>
              <p>Per confermare definitivamente la tua prenotazione, è necessario completare il pagamento.</p>

              ${hasStripe ? `
                <div class="payment-option recommended">
                  <h4>💳 Paga con Carta</h4>
                  <p>Pagamento immediato e sicuro con carta di credito/debito</p>
                  <ul>
                    <li>Conferma immediata</li>
                    <li>Pagamento sicuro con Stripe</li>
                    <li>Ricevuta automatica</li>
                  </ul>
                  <center>
                    <a href="${payment.stripePaymentUrl}" class="payment-button">
                      Paga Ora €${((booking.totalAmount || 0) / 100).toFixed(2)}
                    </a>
                  </center>
                </div>
              ` : ''}

              ${hasBankTransfer && payment?.bankTransferDetails ? `
                <div class="payment-option">
                  <h4>🏦 Paga con Bonifico</h4>
                  <p>Trasferimento bancario tradizionale</p>

                  <div class="bank-details">
                    <strong>Coordinate bancarie:</strong><br>
                    Intestatario: <strong>${payment.bankTransferDetails.accountHolder}</strong><br>
                    Banca: ${payment.bankTransferDetails.bankName}<br>
                    IBAN: <strong>${payment.bankTransferDetails.iban}</strong><br>
                    ${payment.bankTransferDetails.bic ? `BIC/SWIFT: ${payment.bankTransferDetails.bic}<br>` : ''}
                    <br>
                    <strong>Causale obbligatoria:</strong><br>
                    <div class="causale-code">
                      ${payment.bankTransferDetails.causale}
                    </div>
                  </div>

                  <p><strong>⚠️ Importante:</strong></p>
                  <ul>
                    <li>Completa il bonifico entro <strong>${payment.bankTransferDetails.deadlineDays} giorni</strong></li>
                    <li>Usa esattamente la causale indicata sopra</li>
                    <li>La conferma avverrà entro 24-48 ore dalla ricezione</li>
                  </ul>
                </div>
              ` : ''}
            ` : ''}
          </div>

          <div class="footer">
            <p>Baleno San Zeno<br>
            Via Don Giuseppe Andreoli, 37 - San Zeno di Cassola (VI)<br>
            info@balenosanzeno.it</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getRejectedEmailTemplate(booking: BookingDetails, rejection: RejectionDetails): string {
    return `
      <!DOCTYPE html>
      <html lang="it">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: 'Work Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            background-color: #e5e5e5;
            color: #333333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
          }
          .header {
            background-color: #dc3545;
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .icon {
            font-size: 48px;
            margin-bottom: 16px;
          }
          .content {
            padding: 40px 30px;
          }
          .details-box {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .reason-box {
            background-color: #f8d7da;
            border-left: 4px solid #dc3545;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .reason-box h3 {
            margin-top: 0;
            color: #721c24;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #2B548E;
            color: white;
            text-decoration: none;
            font-weight: 600;
            border-radius: 4px;
            margin: 10px;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #6c757d;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="icon">❌</div>
            <h1>Prenotazione Non Approvata</h1>
          </div>

          <div class="content">
            <p>Ciao,</p>
            <p>Ci dispiace informarti che la tua richiesta di prenotazione non è stata approvata.</p>

            <div class="details-box">
              <h3>Dettagli prenotazione rifiutata</h3>
              <p><strong>Risorsa richiesta:</strong> ${booking.resourceName}</p>
              <p><strong>Data richiesta:</strong> ${new Date(booking.startDate).toLocaleDateString('it-IT', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })} - ${new Date(booking.endDate).toLocaleTimeString('it-IT', {
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
              ${booking.requestDate ? `
                <p><strong>Data richiesta inviata:</strong> ${new Date(booking.requestDate).toLocaleDateString('it-IT')}</p>
              ` : ''}
            </div>

            <div class="reason-box">
              <h3>Motivo del rifiuto</h3>
              <p><strong>${rejection.reasonMessage}</strong></p>
              ${rejection.additionalNotes ? `
                <p style="margin-top: 16px; font-style: italic;">
                  Note dell'amministratore:<br>
                  "${rejection.additionalNotes}"
                </p>
              ` : ''}
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <p><strong>Cosa puoi fare ora:</strong></p>
              <a href="${this.frontendUrl}/resources" class="button">
                Verifica Altre Date
              </a>
              <br><br>
              <a href="mailto:info@balenosanzeno.it" style="color: #2B548E; text-decoration: none;">
                Contatta il supporto
              </a>
            </div>

            <p>Ti invitiamo a consultare il calendario delle disponibilità per trovare un'alternativa adatta alle tue esigenze.</p>
          </div>

          <div class="footer">
            <p>Baleno San Zeno<br>
            Via Don Giuseppe Andreoli, 37 - San Zeno di Cassola (VI)<br>
            info@balenosanzeno.it</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getReminderEmailTemplate(
    booking: BookingDetails,
    paymentUrl: string,
    hoursRemaining: number,
  ): string {
    return `
      <!DOCTYPE html>
      <html lang="it">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: 'Work Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            background-color: #e5e5e5;
            color: #333333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
          }
          .header {
            background-color: #EDBB00;
            color: #2B548E;
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .icon {
            font-size: 48px;
            margin-bottom: 16px;
          }
          .content {
            padding: 40px 30px;
          }
          .warning-box {
            background-color: #fff3cd;
            border-left: 4px solid #EDBB00;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .payment-button {
            display: inline-block;
            background-color: #2B548E;
            color: white;
            padding: 14px 40px;
            text-decoration: none;
            font-weight: 600;
            font-size: 18px;
            border-radius: 4px;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #6c757d;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="icon">⏰</div>
            <h1>Promemoria Pagamento</h1>
          </div>

          <div class="content">
            <p>Ciao,</p>
            <p>Ti ricordiamo che hai ancora <strong>${hoursRemaining} ore</strong> per completare il pagamento della tua prenotazione:</p>

            <div class="warning-box">
              <h3 style="margin-top: 0;">Dettagli prenotazione</h3>
              <p><strong>Risorsa:</strong> ${booking.resourceName}</p>
              <p><strong>Data:</strong> ${new Date(booking.startDate).toLocaleDateString('it-IT', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })} - ${new Date(booking.endDate).toLocaleTimeString('it-IT', {
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
              ${booking.totalAmount ? `<p><strong>Importo:</strong> €${(booking.totalAmount / 100).toFixed(2)}</p>` : ''}
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${paymentUrl}" class="payment-button">
                Paga Ora
              </a>
            </div>

            <p><strong>⚠️ Attenzione:</strong> Se non completi il pagamento entro il termine, la prenotazione verrà annullata automaticamente.</p>
          </div>

          <div class="footer">
            <p>Baleno San Zeno<br>
            Via Don Giuseppe Andreoli, 37 - San Zeno di Cassola (VI)<br>
            info@balenosanzeno.it</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getCancelledEmailTemplate(booking: BookingDetails, reason: string): string {
    return `
      <!DOCTYPE html>
      <html lang="it">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: 'Work Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            background-color: #e5e5e5;
            color: #333333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
          }
          .header {
            background-color: #6c757d;
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .content {
            padding: 40px 30px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #2B548E;
            color: white;
            text-decoration: none;
            font-weight: 600;
            border-radius: 4px;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #6c757d;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Prenotazione Cancellata</h1>
          </div>

          <div class="content">
            <p>Ciao,</p>
            <p>La tua prenotazione per <strong>${booking.resourceName}</strong> è stata cancellata.</p>

            <p><strong>Motivo:</strong> ${reason}</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${this.frontendUrl}/resources" class="button">
                Cerca Nuova Disponibilità
              </a>
            </div>
          </div>

          <div class="footer">
            <p>Baleno San Zeno<br>
            Via Don Giuseppe Andreoli, 37 - San Zeno di Cassola (VI)<br>
            info@balenosanzeno.it</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
