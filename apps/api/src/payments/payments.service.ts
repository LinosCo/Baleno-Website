import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { PdfService } from './pdf.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentStatus, UserRole, PaymentMethod } from '@prisma/client';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private pdfService: PdfService,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2023-10-16',
    });
  }

  async createPayment(createPaymentDto: CreatePaymentDto, user: any) {
    const { bookingId, paymentMethod } = createPaymentDto;

    // Verifica che la prenotazione esista e appartenga all'utente
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { resource: true },
    });

    if (!booking) {
      throw new NotFoundException('Prenotazione non trovata');
    }

    if (booking.userId !== user.sub) {
      throw new ForbiddenException('Non hai i permessi per questa prenotazione');
    }

    // Verifica che non esista già un pagamento per questa prenotazione
    const existingPayment = await this.prisma.payment.findFirst({
      where: { bookingId },
    });

    if (existingPayment) {
      throw new BadRequestException('Esiste già un pagamento per questa prenotazione');
    }

    // Crea il pagamento
    const payment = await this.prisma.payment.create({
      data: {
        bookingId,
        userId: user.sub,
        amount: booking.totalPrice,
        currency: 'EUR',
        paymentMethod,
        status: paymentMethod === PaymentMethod.BANK_TRANSFER ? PaymentStatus.PENDING : PaymentStatus.PROCESSING,
      },
    });

    return payment;
  }

  async createPaymentIntent(bookingId: string, userId: string, amount: number) {
    try {
      // Create Stripe payment intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'eur',
        metadata: {
          bookingId,
          userId,
        },
      });

      // Create payment record
      const payment = await this.prisma.payment.create({
        data: {
          bookingId,
          userId,
          amount,
          currency: 'EUR',
          status: PaymentStatus.PENDING,
          stripePaymentIntentId: paymentIntent.id,
        },
      });

      return {
        paymentId: payment.id,
        clientSecret: paymentIntent.client_secret,
      };
    } catch (error) {
      throw new BadRequestException('Failed to create payment intent');
    }
  }

  async confirmPayment(paymentIntentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Update payment status
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.SUCCEEDED,
      },
    });

    return payment;
  }

  async refundPayment(paymentId: string, amount?: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (!payment.stripePaymentIntentId) {
      throw new BadRequestException('No Stripe payment intent found');
    }

    try {
      // Create refund in Stripe
      const refund = await this.stripe.refunds.create({
        payment_intent: payment.stripePaymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
      });

      // Update payment status
      const refundedAmount = amount || Number(payment.amount);
      const isPartialRefund = amount && amount < Number(payment.amount);

      await this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: isPartialRefund ? PaymentStatus.PARTIALLY_REFUNDED : PaymentStatus.REFUNDED,
          stripeRefundId: refund.id,
          refundedAmount,
          refundedAt: new Date(),
        },
      });

      return { success: true, refundId: refund.id };
    } catch (error) {
      throw new BadRequestException('Failed to process refund');
    }
  }

  async getPaymentHistory(user: any) {
    const where: any = {};

    // Users can only see their own payments, Admin/CM can see all
    if (![UserRole.ADMIN, UserRole.COMMUNITY_MANAGER].includes(user.role)) {
      where.userId = user.id;
    }

    const payments = await this.prisma.payment.findMany({
      where,
      include: {
        booking: {
          include: {
            resource: true,
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return payments;
  }

  async getReceipt(id: string, user: any) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            resource: true,
            user: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Users can only see their own receipts
    if (payment.userId !== user.id && ![UserRole.ADMIN, UserRole.COMMUNITY_MANAGER].includes(user.role)) {
      throw new ForbiddenException('You can only view your own receipts');
    }

    return payment;
  }

  async handleStripeWebhook(body: any, signature: string) {
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');

    try {
      const event = this.stripe.webhooks.constructEvent(body, signature, webhookSecret);

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.confirmPayment(event.data.object.id);
          break;
        case 'payment_intent.payment_failed':
          await this.handleFailedPayment(event.data.object.id);
          break;
        // Add more webhook handlers as needed
      }

      return { received: true };
    } catch (error) {
      throw new BadRequestException('Webhook signature verification failed');
    }
  }

  private async handleFailedPayment(paymentIntentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (payment) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED },
      });
    }
  }

  async findByBookingId(bookingId: string) {
    return this.prisma.payment.findFirst({
      where: { bookingId },
    });
  }

  async generateInvoicePdf(paymentId: string, user: any): Promise<Buffer> {
    // Fetch payment with booking and user details
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: {
          include: {
            resource: true,
            user: true,
          },
        },
        user: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Check if user has access to this payment
    if (user.role !== UserRole.ADMIN && payment.userId !== user.id) {
      throw new ForbiddenException('You do not have permission to access this invoice');
    }

    // Only generate invoice for completed payments
    if (payment.status !== PaymentStatus.SUCCEEDED) {
      throw new BadRequestException('Invoice can only be generated for completed payments');
    }

    // Generate PDF using PDF service
    return this.pdfService.generateInvoice(payment, payment.booking, payment.user);
  }
}
