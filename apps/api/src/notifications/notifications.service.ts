import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class NotificationsService {
  private resend: Resend;
  private fromEmail: string;

  constructor(private configService: ConfigService) {
    this.resend = new Resend(this.configService.get('RESEND_API_KEY'));
    this.fromEmail = this.configService.get<string>('RESEND_FROM_EMAIL', 'Baleno San Zeno <onboarding@resend.dev>');
  }

  async sendBookingConfirmation(booking: any, user: any) {
    const subject = 'Prenotazione Confermata - Baleno San Zeno';
    const html = `
      <h2>Prenotazione Confermata</h2>
      <p>Ciao ${user.firstName},</p>
      <p>La tua prenotazione è stata confermata automaticamente:</p>
      <ul>
        <li><strong>Risorsa:</strong> ${booking.resource.name}</li>
        <li><strong>Data:</strong> ${new Date(booking.startTime).toLocaleDateString('it-IT')}</li>
        <li><strong>Orario:</strong> ${new Date(booking.startTime).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })} - ${new Date(booking.endTime).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</li>
        <li><strong>Stato:</strong> Confermata</li>
      </ul>
      <p>Ricordati di completare il pagamento tramite bonifico bancario per finalizzare la prenotazione.</p>
      <p>A presto!</p>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  async sendBookingCancellation(booking: any, user: any) {
    const subject = 'Booking Cancelled - Baleno San Zeno';
    const html = `
      <h2>Booking Cancelled</h2>
      <p>Dear ${user.firstName},</p>
      <p>Your booking has been cancelled:</p>
      <ul>
        <li><strong>Resource:</strong> ${booking.resource.name}</li>
        <li><strong>Date:</strong> ${new Date(booking.startTime).toLocaleDateString()}</li>
      </ul>
      <p>If you paid for this booking, a refund will be processed shortly.</p>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  async sendBookingApproval(booking: any, user: any) {
    const subject = 'Booking Approved - Baleno San Zeno';
    const html = `
      <h2>Booking Approved!</h2>
      <p>Dear ${user.firstName},</p>
      <p>Good news! Your booking has been approved:</p>
      <ul>
        <li><strong>Resource:</strong> ${booking.resource.name}</li>
        <li><strong>Date:</strong> ${new Date(booking.startTime).toLocaleDateString()}</li>
        <li><strong>Time:</strong> ${new Date(booking.startTime).toLocaleTimeString()} - ${new Date(booking.endTime).toLocaleTimeString()}</li>
      </ul>
      <p>We look forward to seeing you!</p>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  async sendBookingRejection(booking: any, user: any, reason: string) {
    const subject = 'Booking Rejected - Baleno San Zeno';
    const html = `
      <h2>Booking Rejected</h2>
      <p>Dear ${user.firstName},</p>
      <p>Unfortunately, your booking has been rejected:</p>
      <ul>
        <li><strong>Resource:</strong> ${booking.resource.name}</li>
        <li><strong>Date:</strong> ${new Date(booking.startTime).toLocaleDateString()}</li>
        <li><strong>Reason:</strong> ${reason}</li>
      </ul>
      <p>If you paid for this booking, a full refund will be processed.</p>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  async sendPaymentReceipt(payment: any, user: any) {
    const subject = 'Payment Receipt - Baleno San Zeno';
    const html = `
      <h2>Payment Receipt</h2>
      <p>Dear ${user.firstName},</p>
      <p>Thank you for your payment:</p>
      <ul>
        <li><strong>Amount:</strong> €${payment.amount}</li>
        <li><strong>Date:</strong> ${new Date(payment.createdAt).toLocaleDateString()}</li>
        <li><strong>Payment ID:</strong> ${payment.id}</li>
      </ul>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  async sendRefundNotification(payment: any, user: any) {
    const subject = 'Refund Processed - Baleno San Zeno';
    const html = `
      <h2>Refund Processed</h2>
      <p>Dear ${user.firstName},</p>
      <p>Your refund has been processed:</p>
      <ul>
        <li><strong>Amount:</strong> €${payment.refundedAmount}</li>
        <li><strong>Original Payment:</strong> €${payment.amount}</li>
      </ul>
      <p>The refund will appear in your account within 5-10 business days.</p>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  private async sendEmail(to: string, subject: string, html: string) {
    return this.resend.emails.send({
      from: this.fromEmail,
      to,
      subject,
      html,
    });
  }

  async sendNewBookingNotificationToAdmin(booking: any) {
    const subject = 'Nuova Prenotazione in Attesa di Approvazione';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0066cc;">Nuova Prenotazione Ricevuta</h2>
        <p>Ciao Admin,</p>
        <p>È stata ricevuta una nuova richiesta di prenotazione che richiede la tua approvazione:</p>

        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Dettagli Prenotazione</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="margin-bottom: 10px;"><strong>Risorsa:</strong> ${booking.resource.name}</li>
            <li style="margin-bottom: 10px;"><strong>Titolo:</strong> ${booking.title}</li>
            <li style="margin-bottom: 10px;"><strong>Data:</strong> ${new Date(booking.startTime).toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</li>
            <li style="margin-bottom: 10px;"><strong>Orario:</strong> ${new Date(booking.startTime).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })} - ${new Date(booking.endTime).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</li>
            <li style="margin-bottom: 10px;"><strong>Partecipanti:</strong> ${booking.numberOfPeople || 'N/A'}</li>
          </ul>
        </div>

        <div style="background-color: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Informazioni Cliente</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="margin-bottom: 10px;"><strong>Nome:</strong> ${booking.user.firstName} ${booking.user.lastName}</li>
            <li style="margin-bottom: 10px;"><strong>Email:</strong> ${booking.user.email}</li>
            ${booking.user.phone ? `<li style="margin-bottom: 10px;"><strong>Telefono:</strong> ${booking.user.phone}</li>` : ''}
            ${booking.user.companyName ? `<li style="margin-bottom: 10px;"><strong>Azienda:</strong> ${booking.user.companyName}</li>` : ''}
            ${booking.user.vatNumber ? `<li style="margin-bottom: 10px;"><strong>Partita IVA:</strong> ${booking.user.vatNumber}</li>` : ''}
            ${booking.user.fiscalCode ? `<li style="margin-bottom: 10px;"><strong>Codice Fiscale:</strong> ${booking.user.fiscalCode}</li>` : ''}
          </ul>
        </div>

        ${booking.notes ? `
        <div style="background-color: #fff9e6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Note</h3>
          <p>${booking.notes}</p>
        </div>
        ` : ''}

        <div style="margin-top: 30px; padding: 20px; background-color: #f0f0f0; border-radius: 8px;">
          <p style="margin: 0;"><strong>Azione Richiesta:</strong> Accedi al pannello amministrativo per approvare o rifiutare questa prenotazione.</p>
          <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">Una volta approvata, il cliente riceverà un'email con il link per il pagamento e avrà 48 ore per completarlo.</p>
        </div>
      </div>
    `;

    return this.sendEmail('alessandro@linos.co', subject, html);
  }

  async sendBookingSubmissionToUser(booking: any, user: any) {
    const subject = 'Richiesta di Prenotazione Ricevuta - Baleno San Zeno';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0066cc;">Richiesta di Prenotazione Ricevuta</h2>
        <p>Ciao ${user.firstName},</p>
        <p>Abbiamo ricevuto la tua richiesta di prenotazione. Ecco i dettagli:</p>

        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Dettagli Prenotazione</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="margin-bottom: 10px;"><strong>Risorsa:</strong> ${booking.resource.name}</li>
            <li style="margin-bottom: 10px;"><strong>Titolo:</strong> ${booking.title}</li>
            <li style="margin-bottom: 10px;"><strong>Data:</strong> ${new Date(booking.startTime).toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</li>
            <li style="margin-bottom: 10px;"><strong>Orario:</strong> ${new Date(booking.startTime).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })} - ${new Date(booking.endTime).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</li>
            ${booking.numberOfPeople ? `<li style="margin-bottom: 10px;"><strong>Partecipanti:</strong> ${booking.numberOfPeople}</li>` : ''}
          </ul>
        </div>

        <div style="background-color: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0066cc;">Prossimi Passi</h3>
          <ol style="padding-left: 20px;">
            <li style="margin-bottom: 10px;">Riceverai un'email di conferma con i dettagli della tua richiesta (questa email)</li>
            <li style="margin-bottom: 10px;">L'amministratore valuterà la tua richiesta</li>
            <li style="margin-bottom: 10px;">Riceverai un'email con il link per il pagamento quando la prenotazione sarà approvata</li>
            <li style="margin-bottom: 10px;">La prenotazione sarà confermata dopo il pagamento</li>
          </ol>
        </div>

        <div style="background-color: #fff9e6; padding: 15px; border-left: 4px solid #ffb700; margin: 20px 0;">
          <p style="margin: 0;"><strong>⏱️ Importante:</strong> Avrai 48 ore dall'approvazione per completare il pagamento.</p>
        </div>

        <div style="margin-top: 30px; padding: 20px; background-color: #f0f0f0; border-radius: 8px;">
          <p style="margin: 0; font-size: 14px; color: #666;">Puoi controllare lo stato della tua prenotazione accedendo al tuo account sul nostro sito.</p>
        </div>

        <p style="margin-top: 30px;">Grazie per aver scelto Baleno San Zeno!</p>
        <p style="color: #666; font-size: 14px;">Il Team di Baleno San Zeno</p>
      </div>
    `;

    return this.sendEmail(user.email, subject, html);
  }
}
