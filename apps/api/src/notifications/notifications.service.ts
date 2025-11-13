import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASSWORD'),
      },
    });
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
    return this.transporter.sendMail({
      from: this.configService.get('EMAIL_FROM'),
      to,
      subject,
      html,
    });
  }
}
