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
    const subject = 'Booking Confirmation - Baleno Sanzeno';
    const html = `
      <h2>Booking Confirmed</h2>
      <p>Dear ${user.firstName},</p>
      <p>Your booking has been confirmed:</p>
      <ul>
        <li><strong>Resource:</strong> ${booking.resource.name}</li>
        <li><strong>Date:</strong> ${new Date(booking.startTime).toLocaleDateString()}</li>
        <li><strong>Time:</strong> ${new Date(booking.startTime).toLocaleTimeString()} - ${new Date(booking.endTime).toLocaleTimeString()}</li>
        <li><strong>Status:</strong> Pending Approval</li>
      </ul>
      <p>You will receive another email once your booking is approved by our team.</p>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  async sendBookingCancellation(booking: any, user: any) {
    const subject = 'Booking Cancelled - Baleno Sanzeno';
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
    const subject = 'Booking Approved - Baleno Sanzeno';
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
    const subject = 'Booking Rejected - Baleno Sanzeno';
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
    const subject = 'Payment Receipt - Baleno Sanzeno';
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
    const subject = 'Refund Processed - Baleno Sanzeno';
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
