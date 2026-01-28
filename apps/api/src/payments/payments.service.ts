import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { PdfService } from './pdf.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentStatus, UserRole, PaymentMethod } from '@prisma/client';
import { EncryptionService } from '../common/services/encryption.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private pdfService: PdfService,
    private encryptionService: EncryptionService,
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
      include: {
        resource: true,
        additionalResources: {
          include: { resource: true }
        }
      },
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

    // Calcola il totale
    const startTime = new Date(booking.startTime);
    const endTime = new Date(booking.endTime);
    const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

    let totalAmount = Number(booking.resource.pricePerHour) * hours;

    // Aggiungi costo risorse aggiuntive
    for (const additionalResource of booking.additionalResources) {
      totalAmount += Number(additionalResource.resource.pricePerHour) * additionalResource.quantity * hours;
    }

    // Crea il pagamento
    const payment = await this.prisma.payment.create({
      data: {
        bookingId,
        userId: user.sub,
        amount: totalAmount,
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

  /**
   * Create Stripe checkout session for booking payment
   */
  async createCheckoutSession(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        resource: true,
        user: true,
        additionalResources: {
          include: { resource: true },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== 'APPROVED') {
      throw new BadRequestException('Booking must be approved before payment');
    }

    // Calculate total amount
    const duration = (booking.endTime.getTime() - booking.startTime.getTime()) / (1000 * 60 * 60);
    let totalAmount = Number(booking.resource.pricePerHour) * duration;

    // Add additional resources
    for (const additionalResource of booking.additionalResources) {
      totalAmount += Number(additionalResource.resource.pricePerHour) * additionalResource.quantity * duration;
    }

    const amountInCents = Math.round(totalAmount * 100);

    // Get payment settings for custom Stripe keys
    const settings = await this.prisma.paymentSettings.findFirst();
    let stripeInstance = this.stripe;

    if (settings?.stripeSecretKey) {
      const decryptedKey = this.encryptionService.decrypt(settings.stripeSecretKey);
      stripeInstance = new Stripe(decryptedKey, { apiVersion: '2023-10-16' });
    }

    // Create checkout session
    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Prenotazione ${booking.resource.name}`,
              description: `Dal ${booking.startTime.toLocaleDateString('it-IT')} al ${booking.endTime.toLocaleDateString('it-IT')}`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${this.configService.get('FRONTEND_URL')}/bookings/${bookingId}/success`,
      cancel_url: `${this.configService.get('FRONTEND_URL')}/bookings/${bookingId}/payment`,
      expires_at: Math.floor(Date.now() / 1000) + (48 * 60 * 60), // 48 hours
      metadata: { bookingId },
      // Per prenotazioni manuali, usa l'email del guest se disponibile
      ...(booking.isManualBooking
        ? booking.manualGuestEmail ? { customer_email: booking.manualGuestEmail } : {}
        : booking.user?.email ? { customer_email: booking.user.email } : {}),
    });

    // Create or update payment record
    const existingPayment = await this.prisma.payment.findFirst({
      where: { bookingId },
    });

    if (existingPayment) {
      await this.prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId: session.payment_intent as string,
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        },
      });
    } else {
      await this.prisma.payment.create({
        data: {
          stripePaymentIntentId: session.payment_intent as string,
          stripeCheckoutSessionId: session.id,
          amount: totalAmount,
          currency: 'EUR',
          status: PaymentStatus.PENDING,
          paymentMethod: PaymentMethod.CREDIT_CARD,
          bookingId,
          userId: booking.userId, // Può essere null per prenotazioni manuali
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        },
      });
    }

    return { sessionId: session.id, url: session.url };
  }

  /**
   * Generate unique bank transfer code for booking
   */
  generateBankTransferCode(bookingId: string): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const bookingPrefix = bookingId.substring(0, 4).toUpperCase();
    return `BAL-${bookingPrefix}-${timestamp}-${random}`;
  }

  /**
   * Create bank transfer payment for booking
   */
  async createBankTransferPayment(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        resource: true,
        additionalResources: {
          include: { resource: true },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== 'APPROVED') {
      throw new BadRequestException('Booking must be approved before payment');
    }

    // Calculate total amount
    const duration = (booking.endTime.getTime() - booking.startTime.getTime()) / (1000 * 60 * 60);
    let totalAmount = Number(booking.resource.pricePerHour) * duration;

    // Add additional resources
    for (const additionalResource of booking.additionalResources) {
      totalAmount += Number(additionalResource.resource.pricePerHour) * additionalResource.quantity * duration;
    }

    // Get payment settings
    const settings = await this.prisma.paymentSettings.findFirst();
    if (!settings?.bankTransferEnabled) {
      throw new BadRequestException('Bank transfer payment is not enabled');
    }

    const transferCode = this.generateBankTransferCode(bookingId);
    const deadlineDays = settings.paymentDeadlineDays || 2;

    // Create payment record
    const payment = await this.prisma.payment.create({
      data: {
        bookingId,
        userId: booking.userId, // Può essere null per prenotazioni manuali
        amount: totalAmount,
        currency: 'EUR',
        status: PaymentStatus.PENDING,
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        bankTransferCode: transferCode,
        expiresAt: new Date(Date.now() + deadlineDays * 24 * 60 * 60 * 1000),
      },
    });

    return {
      transferCode,
      payment,
      bankDetails: {
        bankName: settings.bankName,
        accountHolder: settings.bankAccountHolder,
        iban: settings.bankIBAN,
        bic: settings.bankBIC,
        causale: this.generateCausale(transferCode, booking.resource.name, booking.startTime, settings.bankTransferNote || undefined),
        deadlineDays,
      },
    };
  }

  /**
   * Generate causale (payment reference) for bank transfer
   */
  private generateCausale(
    transferCode: string,
    resourceName: string,
    date: Date,
    template?: string,
  ): string {
    const defaultTemplate = 'Prenotazione {CODICE} - {RISORSA} - {DATA}';
    const causaleTemplate = template || defaultTemplate;

    return causaleTemplate
      .replace('{CODICE}', transferCode)
      .replace('{RISORSA}', resourceName)
      .replace('{DATA}', date.toLocaleDateString('it-IT'))
      .replace('{UTENTE}', '') || ''; // Can be filled if needed
  }

  /**
   * Verify bank transfer payment (admin only)
   */
  async verifyBankTransfer(paymentId: string, userId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { booking: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.paymentMethod !== PaymentMethod.BANK_TRANSFER) {
      throw new BadRequestException('Payment is not a bank transfer');
    }

    if (payment.bankTransferVerified) {
      throw new BadRequestException('Bank transfer already verified');
    }

    // Update payment as verified
    const updatedPayment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        bankTransferVerified: true,
        bankTransferDate: new Date(),
        status: PaymentStatus.SUCCEEDED,
      },
    });

    // Update booking payment status
    await this.prisma.booking.update({
      where: { id: payment.bookingId },
      data: {
        paymentStatus: PaymentStatus.SUCCEEDED,
      },
    });

    this.logger.log(`Bank transfer verified for payment ${paymentId} by user ${userId}`);

    return updatedPayment;
  }

  /**
   * Get pending bank transfers (admin only)
   */
  async getPendingBankTransfers() {
    return this.prisma.payment.findMany({
      where: {
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        bankTransferVerified: false,
        status: PaymentStatus.PENDING,
      },
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
  }
}
