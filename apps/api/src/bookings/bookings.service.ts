import { Injectable, ForbiddenException, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from '../payments/payments.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { ResendService } from '../common/services/resend.service';
import { CreateBookingDto, CreateManualBookingDto, UpdateBookingDto, CancelBookingDto, AdminUpdateBookingDto } from './dto';
import { ApproveBookingDto } from './dto/approve-booking.dto';
import { RejectBookingDto, REJECTION_REASON_MESSAGES } from './dto/reject-booking.dto';
import { BookingStatus, UserRole, AuditAction, PaymentStatus } from '@prisma/client';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    private prisma: PrismaService,
    private paymentsService: PaymentsService,
    private notificationsService: NotificationsService,
    private auditLogsService: AuditLogsService,
    private resendService: ResendService,
  ) {}

  /**
   * Helper per ottenere email e nome dell'utente o ospite manuale
   */
  private getBookingContact(booking: any): { email: string | null; name: string } {
    if (booking.isManualBooking) {
      return {
        email: booking.manualGuestEmail,
        name: booking.manualGuestName || 'Ospite',
      };
    }
    return {
      email: booking.user?.email || null,
      name: booking.user ? `${booking.user.firstName} ${booking.user.lastName}` : 'Utente',
    };
  }

  async create(createDto: CreateBookingDto, user: any) {
    const { resourceId, startTime, endTime, additionalResources, ...bookingData } = createDto;

    // Validate dates
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      throw new BadRequestException('End time must be after start time');
    }

    if (start < new Date()) {
      throw new BadRequestException('Cannot book in the past');
    }

    // Check if resource exists and is active
    const resource = await this.prisma.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    if (!resource.isActive) {
      throw new BadRequestException('Resource is not available');
    }

    // Check allowed weekdays for this resource
    if (resource.allowedWeekdays && resource.allowedWeekdays.length > 0 && resource.allowedWeekdays.length < 7) {
      const bookingWeekday = start.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
      if (!resource.allowedWeekdays.includes(bookingWeekday)) {
        const dayNames = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
        const allowedDays = resource.allowedWeekdays.map(d => dayNames[d]).join(', ');
        throw new BadRequestException(`Questa risorsa è prenotabile solo nei seguenti giorni: ${allowedDays}`);
      }
    }

    // Check availability
    const isAvailable = await this.checkAvailability({
      resourceId,
      startTime: start,
      endTime: end,
    });

    if (!isAvailable) {
      throw new ConflictException('Resource is not available for the selected time period');
    }

    // Calculate base price
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    let amount = Number(resource.pricePerHour) * hours;

    // Validate and calculate additional resources price
    let validatedAdditionalResources: Array<{ resourceId: string; quantity: number; resource: any }> = [];

    if (additionalResources && additionalResources.length > 0) {
      const additionalResourceIds = additionalResources.map(r => r.resourceId);

      // Fetch all additional resources
      const foundResources = await this.prisma.resource.findMany({
        where: {
          id: { in: additionalResourceIds },
          isActive: true,
        },
      });

      // Validate all resources exist
      for (const addRes of additionalResources) {
        const res = foundResources.find(r => r.id === addRes.resourceId);

        if (!res) {
          throw new NotFoundException(`Additional resource ${addRes.resourceId} not found`);
        }

        const quantity = addRes.quantity || 1;
        const resourcePrice = Number(res.pricePerHour) * hours * quantity;
        amount += resourcePrice;

        validatedAdditionalResources.push({
          resourceId: addRes.resourceId,
          quantity,
          resource: res
        });
      }
    }

    // Apply minimum price if defined for the resource
    if (resource.minPrice && amount < Number(resource.minPrice)) {
      amount = Number(resource.minPrice);
      this.logger.log(`Applied minimum price €${amount} for resource ${resource.name}`);
    }

    // Create booking with PENDING status (requires admin approval)
    const booking = await this.prisma.booking.create({
      data: {
        ...bookingData,
        resourceId,
        userId: user.id,
        startTime: start,
        endTime: end,
        status: BookingStatus.PENDING,
      },
      include: {
        resource: true,
        user: true,
      },
    });

    // Create additional resources associations
    if (validatedAdditionalResources.length > 0) {
      await this.prisma.bookingResource.createMany({
        data: validatedAdditionalResources.map(ar => ({
          bookingId: booking.id,
          resourceId: ar.resourceId,
          quantity: ar.quantity,
        })),
      });
    }

    // Fetch complete booking with additional resources
    const completeBooking = await this.prisma.booking.findUnique({
      where: { id: booking.id },
      include: {
        resource: true,
        user: true,
        additionalResources: {
          include: {
            resource: true,
          },
        },
      },
    });

    // Send email notifications (non-blocking)
    try {
      // Email to admin
      const adminResult = await this.resendService.sendNewBookingNotificationToAdmin(completeBooking);
      if (adminResult.success) {
        this.logger.log(`Admin notification sent for booking ${booking.id}`);
      } else {
        this.logger.error(`Failed to send admin notification email: ${adminResult.error}`);
      }
    } catch (emailError) {
      this.logger.error('Failed to send admin notification email:', emailError);
    }

    try {
      // Email to user
      const userResult = await this.resendService.sendBookingSubmissionToUser(user.email, completeBooking);
      if (userResult.success) {
        this.logger.log(`User submission email sent to ${user.email} for booking ${booking.id}`);
      } else {
        this.logger.error(`Failed to send user submission email: ${userResult.error}`);
      }
    } catch (emailError) {
      this.logger.error('Failed to send user submission email:', emailError);
    }

    return completeBooking;
  }

  /**
   * Crea una prenotazione manuale (admin crea per conto di un ospite senza account)
   */
  async createManualBooking(createDto: CreateManualBookingDto, admin: any) {
    const { resourceId, startTime, endTime, additionalResources, guestName, guestEmail, guestPhone, autoApprove, ...bookingData } = createDto;

    // Validate dates
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      throw new BadRequestException('End time must be after start time');
    }

    // Check if resource exists and is active
    const resource = await this.prisma.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    if (!resource.isActive) {
      throw new BadRequestException('Resource is not available');
    }

    // Check allowed weekdays for manual bookings too (admin can override if needed by using different dates)
    if (resource.allowedWeekdays && resource.allowedWeekdays.length > 0 && resource.allowedWeekdays.length < 7) {
      const bookingWeekday = start.getDay();
      if (!resource.allowedWeekdays.includes(bookingWeekday)) {
        const dayNames = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
        const allowedDays = resource.allowedWeekdays.map(d => dayNames[d]).join(', ');
        throw new BadRequestException(`Questa risorsa è prenotabile solo nei seguenti giorni: ${allowedDays}`);
      }
    }

    // Check availability
    const isAvailable = await this.checkAvailability({
      resourceId,
      startTime: start,
      endTime: end,
    });

    if (!isAvailable) {
      throw new ConflictException('Resource is not available for the selected time period');
    }

    // Calculate base price
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    let amount = Number(resource.pricePerHour) * hours;

    // Validate and calculate additional resources price
    let validatedAdditionalResources: Array<{ resourceId: string; quantity: number; resource: any }> = [];

    if (additionalResources && additionalResources.length > 0) {
      const additionalResourceIds = additionalResources.map(r => r.resourceId);

      const foundResources = await this.prisma.resource.findMany({
        where: {
          id: { in: additionalResourceIds },
          isActive: true,
        },
      });

      for (const addRes of additionalResources) {
        const res = foundResources.find(r => r.id === addRes.resourceId);

        if (!res) {
          throw new NotFoundException(`Additional resource ${addRes.resourceId} not found`);
        }

        const quantity = addRes.quantity || 1;
        const resourcePrice = Number(res.pricePerHour) * hours * quantity;
        amount += resourcePrice;

        validatedAdditionalResources.push({
          resourceId: addRes.resourceId,
          quantity,
          resource: res
        });
      }
    }

    // Apply minimum price if defined for the resource
    if (resource.minPrice && amount < Number(resource.minPrice)) {
      amount = Number(resource.minPrice);
      this.logger.log(`Applied minimum price €${amount} for resource ${resource.name}`);
    }

    // Determine initial status
    const initialStatus = autoApprove ? BookingStatus.APPROVED : BookingStatus.PENDING;

    // Create manual booking (without userId)
    const booking = await this.prisma.booking.create({
      data: {
        ...bookingData,
        resourceId,
        userId: null, // No user account
        startTime: start,
        endTime: end,
        status: initialStatus,
        isManualBooking: true,
        manualGuestName: guestName,
        manualGuestEmail: guestEmail || null,
        manualGuestPhone: guestPhone || null,
        createdByAdminId: admin.id,
        ...(autoApprove && {
          approvedBy: admin.id,
          approvedAt: new Date(),
        }),
      },
      include: {
        resource: true,
      },
    });

    // Create additional resources associations
    if (validatedAdditionalResources.length > 0) {
      await this.prisma.bookingResource.createMany({
        data: validatedAdditionalResources.map(ar => ({
          bookingId: booking.id,
          resourceId: ar.resourceId,
          quantity: ar.quantity,
        })),
      });
    }

    // Fetch complete booking with additional resources
    const completeBooking = await this.prisma.booking.findUnique({
      where: { id: booking.id },
      include: {
        resource: true,
        additionalResources: {
          include: {
            resource: true,
          },
        },
      },
    });

    // Log audit
    await this.auditLogsService.log({
      userId: admin.id,
      userEmail: admin.email,
      userRole: admin.role,
      action: AuditAction.CREATE,
      entity: 'booking',
      entityId: booking.id,
      description: `Prenotazione manuale "${booking.title}" creata per ${guestName}${autoApprove ? ' (auto-approvata)' : ''}`,
      metadata: {
        bookingTitle: booking.title,
        resourceName: resource.name,
        guestName,
        guestEmail,
        guestPhone,
        isManualBooking: true,
        autoApproved: autoApprove || false,
      },
    });

    this.logger.log(`Manual booking ${booking.id} created by admin ${admin.email} for guest ${guestName}`);

    // Send email to guest if email provided
    if (guestEmail) {
      try {
        // Create a mock user object for email
        const mockUser = {
          email: guestEmail,
          firstName: guestName.split(' ')[0] || guestName,
          lastName: guestName.split(' ').slice(1).join(' ') || '',
        };

        if (autoApprove) {
          // Send approval email
          const amountInCents = Math.round(amount * 100);
          await this.resendService.sendBookingApprovedEmail(
            guestEmail,
            {
              id: booking.id,
              resourceName: resource.name,
              startDate: start,
              endDate: end,
              totalAmount: amountInCents,
            },
            {}, // No payment links for manual bookings (payment handled manually)
          );
        } else {
          // Send confirmation email
          await this.resendService.sendBookingSubmissionToUser(guestEmail, {
            ...completeBooking,
            user: mockUser,
          });
        }
        this.logger.log(`Email sent to guest ${guestEmail} for manual booking ${booking.id}`);
      } catch (emailError) {
        this.logger.error('Failed to send email to guest:', emailError);
      }
    }

    return {
      message: autoApprove
        ? 'Prenotazione manuale creata e approvata con successo'
        : 'Prenotazione manuale creata con successo',
      booking: completeBooking,
      calculatedAmount: amount,
    };
  }

  async findAll(query: any, user: any) {
    const where: any = {};

    // Filter by user role
    if (user.role === UserRole.USER) {
      where.userId = user.id;
    }

    // Additional filters
    if (query.status) {
      where.status = query.status;
    }

    if (query.resourceId) {
      where.resourceId = query.resourceId;
    }

    if (query.startDate) {
      where.startTime = {
        gte: new Date(query.startDate),
      };
    }

    const bookings = await this.prisma.booking.findMany({
      where,
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
        additionalResources: {
          include: {
            resource: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    return bookings;
  }

  async getPublicCalendar(query: any) {
    const where: any = {
      status: BookingStatus.APPROVED,
    };

    if (query.resourceId) {
      where.resourceId = query.resourceId;
    }

    if (query.startDate) {
      where.startTime = {
        gte: new Date(query.startDate),
      };
    }

    if (query.endDate) {
      where.endTime = {
        lte: new Date(query.endDate),
      };
    }

    const bookings = await this.prisma.booking.findMany({
      where,
      select: {
        id: true,
        title: true,
        startTime: true,
        endTime: true,
        resource: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    return bookings;
  }

  async findOne(id: string, user: any) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        resource: true,
        user: true,
        payments: true,
        additionalResources: {
          include: {
            resource: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Users can only see their own bookings
    if (booking.userId !== user.id && ![UserRole.ADMIN, UserRole.COMMUNITY_MANAGER].includes(user.role)) {
      throw new ForbiddenException('You can only view your own bookings');
    }

    return booking;
  }

  async update(id: string, updateDto: UpdateBookingDto, user: any) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Users can only update their own bookings and only if pending
    if (booking.userId !== user.id) {
      throw new ForbiddenException('You can only update your own bookings');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Can only update pending bookings');
    }

    // If dates are being updated, check availability
    if (updateDto.startTime || updateDto.endTime) {
      const startTime = updateDto.startTime ? new Date(updateDto.startTime) : booking.startTime;
      const endTime = updateDto.endTime ? new Date(updateDto.endTime) : booking.endTime;

      const isAvailable = await this.checkAvailability({
        resourceId: booking.resourceId,
        startTime,
        endTime,
        excludeBookingId: id,
      });

      if (!isAvailable) {
        throw new ConflictException('Resource is not available for the selected time period');
      }
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: updateDto,
      include: {
        resource: true,
        user: true,
      },
    });

    return updatedBooking;
  }

  async cancel(id: string, cancelDto: CancelBookingDto, user: any) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        resource: true,
        user: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Users can only cancel their own bookings
    if (booking.userId !== user.id) {
      throw new ForbiddenException('You can only cancel your own bookings');
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled');
    }

    // Update booking status
    await this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELLED,
        cancelledAt: new Date(),
        cancellationReason: cancelDto.cancellationReason,
      },
    });

    // Process refund if payment exists
    const payment = await this.paymentsService.findByBookingId(id);
    if (payment && payment.status === 'SUCCEEDED') {
      await this.paymentsService.refundPayment(payment.id);
    }

    // Send cancellation email (non-blocking)
    try {
      await this.notificationsService.sendBookingCancellation(booking, user);
    } catch (emailError) {
      console.error('Failed to send booking cancellation email:', emailError);
    }

    return { message: 'Booking cancelled successfully' };
  }

  async delete(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        payments: true,
        additionalResources: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Delete payments first (has Restrict constraint)
    if (booking.payments.length > 0) {
      await this.prisma.payment.deleteMany({
        where: { bookingId: id },
      });
    }

    // Delete additional resources
    if (booking.additionalResources.length > 0) {
      await this.prisma.bookingResource.deleteMany({
        where: { bookingId: id },
      });
    }

    // Delete the booking
    await this.prisma.booking.delete({
      where: { id },
    });

    return { message: 'Booking deleted successfully' };
  }

  async approve(id: string, approveDto: ApproveBookingDto, user: any) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
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

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Can only approve pending bookings');
    }

    // Calculate total amount (or use custom amount if provided)
    let totalAmount: number;
    let originalAmount: number;
    let discountAmount: number = 0;
    let discountReason: string | undefined;

    // Always calculate the original amount first
    const duration = (booking.endTime.getTime() - booking.startTime.getTime()) / (1000 * 60 * 60);
    originalAmount = Number(booking.resource.pricePerHour) * duration;

    // Add additional resources to original amount
    for (const additionalResource of booking.additionalResources) {
      originalAmount += Number(additionalResource.resource.pricePerHour) * additionalResource.quantity * duration;
    }

    // Apply minimum price if defined for the resource
    const resourceMinPrice = booking.resource.minPrice ? Number(booking.resource.minPrice) : null;
    if (resourceMinPrice && originalAmount < resourceMinPrice) {
      this.logger.log(`Applied minimum price €${resourceMinPrice} for resource ${booking.resource.name} (original: €${originalAmount})`);
      originalAmount = resourceMinPrice;
    }

    if (approveDto.customAmount !== undefined && approveDto.customAmount !== null) {
      // Use custom amount provided by admin
      totalAmount = approveDto.customAmount;
      discountAmount = originalAmount - totalAmount;
      discountReason = approveDto.discountReason;
      this.logger.log(`Using custom amount: €${totalAmount} (original: €${originalAmount}, discount: €${discountAmount}) for booking ${id}`);
    } else {
      // Use calculated amount
      totalAmount = originalAmount;
      this.logger.log(`Calculated automatic amount: €${totalAmount} for booking ${id}`);
    }

    const amountInCents = Math.round(totalAmount * 100);

    // Update booking status
    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.APPROVED,
        approvedBy: user.id,
        approvedAt: new Date(),
        notes: approveDto.notes,
      },
      include: {
        resource: true,
        user: true,
        additionalResources: {
          include: { resource: true },
        },
      },
    });

    // Get payment settings
    const settings = await this.prisma.paymentSettings.findFirst();

    // Prepare email data
    const emailDetails: any = {
      id: booking.id,
      resourceName: booking.resource.name,
      startDate: booking.startTime,
      endDate: booking.endTime,
      totalAmount: amountInCents,
    };

    // Add discount information if applicable
    if (discountAmount > 0) {
      emailDetails.originalAmount = Math.round(originalAmount * 100);
      emailDetails.discountAmount = Math.round(discountAmount * 100);
      if (discountReason) {
        emailDetails.discountReason = discountReason;
      }
    }

    const paymentDetails: any = {};

    // Create Stripe checkout session if enabled
    if (settings?.stripeEnabled) {
      try {
        const stripeSession = await this.paymentsService.createCheckoutSession(booking.id);
        paymentDetails.stripePaymentUrl = stripeSession.url;
      } catch (error) {
        this.logger.error('Failed to create Stripe checkout session', error);
      }
    }

    // Create bank transfer payment if enabled
    if (settings?.bankTransferEnabled) {
      try {
        const bankTransfer = await this.paymentsService.createBankTransferPayment(booking.id);
        paymentDetails.bankTransferDetails = bankTransfer.bankDetails;
      } catch (error) {
        this.logger.error('Failed to create bank transfer payment', error);
      }
    }

    // Send approval email with payment options
    const contact = this.getBookingContact(booking);
    if (contact.email) {
      try {
        await this.resendService.sendBookingApprovedEmail(
          contact.email,
          emailDetails,
          paymentDetails,
        );
        this.logger.log(`Approval email sent to ${contact.email} for booking ${id}`);
      } catch (emailError) {
        this.logger.error('Failed to send booking approval email:', emailError);
      }
    }

    // Log audit
    await this.auditLogsService.log({
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      action: AuditAction.APPROVE,
      entity: 'booking',
      entityId: id,
      description: `Prenotazione "${booking.title}" approvata`,
      metadata: {
        bookingTitle: booking.title,
        resourceName: booking.resource.name,
        userName: contact.name,
        totalAmount: amountInCents,
        notes: approveDto.notes,
      },
    });

    return updatedBooking;
  }

  async reject(id: string, rejectDto: RejectBookingDto, user: any) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        resource: true,
        user: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Can only reject pending bookings');
    }

    // Get user-friendly reason message
    const reasonMessage = REJECTION_REASON_MESSAGES[rejectDto.reason] || 'Motivo non specificato';

    // Update booking status
    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.REJECTED,
        rejectedBy: user.id,
        rejectedAt: new Date(),
        rejectionReason: `${reasonMessage}${rejectDto.additionalNotes ? ` - ${rejectDto.additionalNotes}` : ''}`,
      },
      include: {
        resource: true,
        user: true,
      },
    });

    // Process refund if payment exists
    const payment = await this.paymentsService.findByBookingId(id);
    if (payment && payment.status === PaymentStatus.SUCCEEDED) {
      try {
        await this.paymentsService.refundPayment(payment.id);
        this.logger.log(`Payment ${payment.id} refunded for rejected booking ${id}`);
      } catch (error) {
        this.logger.error('Failed to refund payment:', error);
      }
    }

    // Send rejection email with ResendService
    const rejectContact = this.getBookingContact(booking);
    if (rejectContact.email) {
      try {
        await this.resendService.sendBookingRejectedEmail(
          rejectContact.email,
          {
            id: booking.id,
            resourceName: booking.resource.name,
            startDate: booking.startTime,
            endDate: booking.endTime,
            requestDate: booking.createdAt,
          },
          {
            reason: rejectDto.reason.toString(),
            reasonMessage,
            additionalNotes: rejectDto.additionalNotes,
          },
        );
        this.logger.log(`Rejection email sent to ${rejectContact.email} for booking ${id}`);
      } catch (emailError) {
        this.logger.error('Failed to send booking rejection email:', emailError);
      }
    }

    // Log audit
    await this.auditLogsService.log({
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      action: AuditAction.REJECT,
      entity: 'booking',
      entityId: id,
      description: `Prenotazione "${booking.title}" rifiutata - ${reasonMessage}`,
      metadata: {
        bookingTitle: booking.title,
        resourceName: booking.resource.name,
        userName: rejectContact.name,
        reason: rejectDto.reason,
        reasonMessage,
        additionalNotes: rejectDto.additionalNotes,
      },
    });

    return { message: 'Booking rejected successfully', booking: updatedBooking };
  }

  async markPaymentReceived(id: string, user: any) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        resource: true,
        user: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== BookingStatus.APPROVED) {
      throw new BadRequestException('Can only mark payment for approved bookings');
    }

    if (booking.paymentReceived) {
      throw new BadRequestException('Payment already marked as received');
    }

    // Update booking
    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: {
        paymentReceived: true,
        paymentReceivedAt: new Date(),
        paymentReceivedBy: user.id,
        // If both payment and invoice are marked, mark as completed
        ...(booking.invoiceIssued && { status: BookingStatus.COMPLETED }),
      },
      include: {
        resource: true,
        user: true,
      },
    });

    // Log audit
    await this.auditLogsService.log({
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      action: AuditAction.UPDATE,
      entity: 'booking',
      entityId: id,
      description: `Pagamento ricevuto per prenotazione "${booking.title}"`,
      metadata: {
        bookingTitle: booking.title,
        resourceName: booking.resource.name,
        userName: this.getBookingContact(booking).name,
        paymentReceivedAt: new Date().toISOString(),
      },
    });

    this.logger.log(`Payment marked as received for booking ${id} by ${user.email}`);
    return { message: 'Payment marked as received successfully', booking: updatedBooking };
  }

  async markInvoiceIssued(id: string, user: any) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        resource: true,
        user: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== BookingStatus.APPROVED) {
      throw new BadRequestException('Can only issue invoice for approved bookings');
    }

    if (booking.invoiceIssued) {
      throw new BadRequestException('Invoice already marked as issued');
    }

    // Update booking
    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: {
        invoiceIssued: true,
        invoiceIssuedAt: new Date(),
        invoiceIssuedBy: user.id,
        // If both payment and invoice are marked, mark as completed
        ...(booking.paymentReceived && { status: BookingStatus.COMPLETED }),
      },
      include: {
        resource: true,
        user: true,
      },
    });

    // Log audit
    await this.auditLogsService.log({
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      action: AuditAction.UPDATE,
      entity: 'booking',
      entityId: id,
      description: `Fattura emessa per prenotazione "${booking.title}"`,
      metadata: {
        bookingTitle: booking.title,
        resourceName: booking.resource.name,
        userName: this.getBookingContact(booking).name,
        invoiceIssuedAt: new Date().toISOString(),
      },
    });

    this.logger.log(`Invoice marked as issued for booking ${id} by ${user.email}`);
    return { message: 'Invoice marked as issued successfully', booking: updatedBooking };
  }

  async checkAvailability(query: {
    resourceId: string;
    startTime: Date;
    endTime: Date;
    excludeBookingId?: string;
  }): Promise<boolean> {
    const { resourceId, startTime, endTime, excludeBookingId } = query;

    const conflictingBookings = await this.prisma.booking.findMany({
      where: {
        resourceId,
        status: {
          in: [BookingStatus.PENDING, BookingStatus.APPROVED],
        },
        // Two intervals [A_start, A_end] and [B_start, B_end] overlap if:
        // A_start < B_end AND B_start < A_end
        startTime: {
          lt: endTime, // existing.startTime < new.endTime
        },
        endTime: {
          gt: startTime, // existing.endTime > new.startTime
        },
        ...(excludeBookingId && { id: { not: excludeBookingId } }),
      },
    });

    return conflictingBookings.length === 0;
  }

  async exportToCsv(query: any, user: any): Promise<string> {
    // Get bookings with same filters as findAll
    const bookings = await this.findAll(query, user);

    // CSV headers
    const headers = [
      'ID',
      'Titolo',
      'Utente',
      'Email',
      'Risorsa',
      'Tipo Risorsa',
      'Data Inizio',
      'Data Fine',
      'Stato',
      'Partecipanti',
      'Note',
      'Data Creazione',
    ];

    // Convert bookings to CSV rows
    const rows = bookings.map((booking: any) => {
      const contact = this.getBookingContact(booking);
      return [
        booking.id,
        this.escapeCsvField(booking.title),
        contact.name,
        contact.email || '',
        this.escapeCsvField(booking.resource.name),
        booking.resource.type,
        new Date(booking.startTime).toLocaleString('it-IT'),
        new Date(booking.endTime).toLocaleString('it-IT'),
        booking.status,
        booking.attendees || '',
        this.escapeCsvField(booking.notes || ''),
        new Date(booking.createdAt).toLocaleString('it-IT'),
      ];
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    return csvContent;
  }

  private escapeCsvField(field: string): string {
    if (!field) return '';
    // Escape double quotes and wrap in quotes if contains comma or quotes
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }

  /**
   * Cron job: Send payment reminders every 6 hours
   * Checks for approved bookings with pending payments that are 24 hours old
   */
  @Cron('0 */6 * * *')
  async sendPaymentReminders() {
    this.logger.log('Running payment reminder cron job');

    try {
      const settings = await this.prisma.paymentSettings.findFirst();
      if (!settings?.sendReminders) {
        this.logger.log('Payment reminders disabled in settings');
        return;
      }

      const reminderHours = settings.paymentReminderHours || 24;
      const cutoffDate = new Date(Date.now() - reminderHours * 60 * 60 * 1000);

      const bookings = await this.prisma.booking.findMany({
        where: {
          status: BookingStatus.APPROVED,
          paymentStatus: PaymentStatus.PENDING,
          approvedAt: { lte: cutoffDate },
          reminderSent: false,
        },
        include: {
          user: true,
          resource: true,
          payments: true,
        },
      });

      this.logger.log(`Found ${bookings.length} bookings requiring payment reminders`);

      for (const booking of bookings) {
        const payment = booking.payments[0];
        if (!payment || !payment.expiresAt) continue;

        const hoursRemaining = Math.max(
          0,
          Math.floor((payment.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60)),
        );

        if (hoursRemaining > 0) {
          // Determine payment URL
          let paymentUrl = `${process.env.FRONTEND_URL}/bookings/${booking.id}/payment`;

          if (payment.stripeCheckoutSessionId && settings?.stripeEnabled) {
            try {
              const session = await this.paymentsService['stripe'].checkout.sessions.retrieve(
                payment.stripeCheckoutSessionId,
              );
              if (session.url) {
                paymentUrl = session.url;
              }
            } catch (error) {
              this.logger.error(`Failed to retrieve Stripe session for booking ${booking.id}`, error);
            }
          }

          // Calculate total amount
          const duration = (booking.endTime.getTime() - booking.startTime.getTime()) / (1000 * 60 * 60);
          const totalAmount = Math.round(Number(booking.resource.pricePerHour) * duration * 100);

          // Send reminder email
          const reminderContact = this.getBookingContact(booking);
          if (reminderContact.email) {
            await this.resendService.sendPaymentReminderEmail(
              reminderContact.email,
              {
                id: booking.id,
                resourceName: booking.resource.name,
                startDate: booking.startTime,
                endDate: booking.endTime,
                totalAmount,
              },
              paymentUrl,
              hoursRemaining,
            );
          }

          // Mark reminder as sent
          await this.prisma.booking.update({
            where: { id: booking.id },
            data: { reminderSent: true },
          });

          this.logger.log(`Payment reminder sent for booking ${booking.id}`);
        }
      }

      this.logger.log('Payment reminder cron job completed');
    } catch (error) {
      this.logger.error('Error in payment reminder cron job', error);
    }
  }

  /**
   * Cron job: Cancel unpaid bookings every hour
   * Cancels approved bookings with pending payments that have expired (48 hours)
   */
  @Cron('0 * * * *')
  async cancelUnpaidBookings() {
    this.logger.log('Running unpaid booking cancellation cron job');

    try {
      const settings = await this.prisma.paymentSettings.findFirst();
      const deadlineDays = settings?.paymentDeadlineDays || 2;
      const cutoffDate = new Date(Date.now() - deadlineDays * 24 * 60 * 60 * 1000);

      const bookings = await this.prisma.booking.findMany({
        where: {
          status: BookingStatus.APPROVED,
          paymentStatus: PaymentStatus.PENDING,
          approvedAt: { lte: cutoffDate },
        },
        include: {
          user: true,
          resource: true,
          payments: true,
        },
      });

      this.logger.log(`Found ${bookings.length} bookings to cancel due to non-payment`);

      for (const booking of bookings) {
        // Update booking status
        await this.prisma.booking.update({
          where: { id: booking.id },
          data: {
            status: BookingStatus.CANCELLED,
            paymentStatus: PaymentStatus.FAILED,
            cancellationReason: `Pagamento non completato entro ${deadlineDays} giorni dall'approvazione`,
          },
        });

        // Send cancellation email
        const cancelContact = this.getBookingContact(booking);
        if (cancelContact.email) {
          await this.resendService.sendBookingCancelledEmail(
            cancelContact.email,
            {
              id: booking.id,
              resourceName: booking.resource.name,
              startDate: booking.startTime,
              endDate: booking.endTime,
            },
            `Pagamento non completato entro ${deadlineDays} giorni`,
          );
        }

        // Log audit
        await this.auditLogsService.log({
          userId: 'system',
          userEmail: 'system',
          userRole: 'SYSTEM',
          action: AuditAction.CANCEL,
          entity: 'booking',
          entityId: booking.id,
          description: `Prenotazione "${booking.title}" cancellata automaticamente per mancato pagamento`,
          metadata: {
            bookingTitle: booking.title,
            resourceName: booking.resource.name,
            userName: cancelContact.name,
            reason: 'Payment deadline exceeded',
          },
        });

        this.logger.log(`Booking ${booking.id} cancelled due to non-payment`);
      }

      this.logger.log('Unpaid booking cancellation cron job completed');
    } catch (error) {
      this.logger.error('Error in unpaid booking cancellation cron job', error);
    }
  }

  /**
   * Admin update booking (date/time and details only, not resources)
   */
  async adminUpdate(id: string, updateDto: AdminUpdateBookingDto, user: any) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
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

    // Store old values for email notification
    const oldValues = {
      title: booking.title,
      description: booking.description || '',
      startTime: booking.startTime,
      endTime: booking.endTime,
    };

    // Check if dates are being updated and validate availability
    if (updateDto.startTime || updateDto.endTime) {
      const newStartTime = updateDto.startTime ? new Date(updateDto.startTime) : booking.startTime;
      const newEndTime = updateDto.endTime ? new Date(updateDto.endTime) : booking.endTime;

      // Validate that start is before end
      if (newStartTime >= newEndTime) {
        throw new BadRequestException('Start time must be before end time');
      }

      // Check availability for the main resource (excluding current booking)
      const conflicts = await this.prisma.booking.findMany({
        where: {
          resourceId: booking.resourceId,
          id: { not: id }, // Exclude current booking
          status: { in: [BookingStatus.APPROVED, BookingStatus.PENDING] },
          OR: [
            {
              AND: [
                { startTime: { lte: newStartTime } },
                { endTime: { gt: newStartTime } },
              ],
            },
            {
              AND: [
                { startTime: { lt: newEndTime } },
                { endTime: { gte: newEndTime } },
              ],
            },
            {
              AND: [
                { startTime: { gte: newStartTime } },
                { endTime: { lte: newEndTime } },
              ],
            },
          ],
        },
      });

      if (conflicts.length > 0) {
        throw new BadRequestException(
          'La nuova data/orario selezionata è già occupata per questa risorsa',
        );
      }
    }

    // Update booking
    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: {
        ...(updateDto.title && { title: updateDto.title }),
        ...(updateDto.description && { description: updateDto.description }),
        ...(updateDto.startTime && { startTime: new Date(updateDto.startTime) }),
        ...(updateDto.endTime && { endTime: new Date(updateDto.endTime) }),
        ...(updateDto.adminNote && { internalNotes: updateDto.adminNote }),
      },
      include: {
        resource: true,
        user: true,
        additionalResources: {
          include: { resource: true },
        },
      },
    });

    // Send email notification to user
    const hasChanges =
      updateDto.title ||
      updateDto.description ||
      updateDto.startTime ||
      updateDto.endTime;

    const modifyContact = this.getBookingContact(booking);
    if (hasChanges && modifyContact.email) {
      try {
        await this.resendService.sendBookingModifiedEmail(
          modifyContact.email,
          {
            id: booking.id,
            title: booking.title,
            resourceName: booking.resource.name,
          },
          oldValues,
          {
            title: updatedBooking.title,
            description: updatedBooking.description || '',
            startTime: updatedBooking.startTime,
            endTime: updatedBooking.endTime,
          },
        );
        this.logger.log(`Modification email sent to ${modifyContact.email} for booking ${id}`);
      } catch (emailError) {
        this.logger.error('Failed to send booking modification email:', emailError);
      }
    }

    // Log audit
    const changes: string[] = [];
    if (updateDto.title) changes.push(`Titolo: "${oldValues.title}" → "${updatedBooking.title}"`);
    if (updateDto.description) changes.push(`Descrizione modificata`);
    if (updateDto.startTime || updateDto.endTime) {
      changes.push(
        `Data/Ora: ${oldValues.startTime.toLocaleString('it-IT')} - ${oldValues.endTime.toLocaleString('it-IT')} → ${updatedBooking.startTime.toLocaleString('it-IT')} - ${updatedBooking.endTime.toLocaleString('it-IT')}`,
      );
    }

    await this.auditLogsService.log({
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      action: AuditAction.UPDATE,
      entity: 'booking',
      entityId: id,
      description: `Prenotazione "${booking.title}" modificata dall'admin: ${changes.join(', ')}`,
      metadata: {
        bookingTitle: booking.title,
        resourceName: booking.resource.name,
        userName: modifyContact.name,
        changes: changes,
        adminNote: updateDto.adminNote,
      },
    });

    return {
      message: 'Booking updated successfully',
      booking: updatedBooking,
      changes: changes,
    };
  }
}
