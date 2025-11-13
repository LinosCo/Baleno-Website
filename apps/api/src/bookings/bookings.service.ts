import { Injectable, ForbiddenException, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from '../payments/payments.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CreateBookingDto, UpdateBookingDto, RejectBookingDto, CancelBookingDto } from './dto';
import { BookingStatus, UserRole, AuditAction } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private paymentsService: PaymentsService,
    private notificationsService: NotificationsService,
    private auditLogsService: AuditLogsService,
  ) {}

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

    // Create booking with APPROVED status (auto-approval if slot is available)
    const booking = await this.prisma.booking.create({
      data: {
        ...bookingData,
        resourceId,
        userId: user.id,
        startTime: start,
        endTime: end,
        status: BookingStatus.APPROVED,
        approvedAt: new Date(),
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

    // Send confirmation email (non-blocking) - DISABLED TEMPORARILY
    // try {
    //   await this.notificationsService.sendBookingConfirmation(booking, user);
    // } catch (emailError) {
    //   // Log error but don't block booking creation
    //   console.error('Failed to send booking confirmation email:', emailError);
    // }
    console.log('Email notifications disabled - booking created successfully');

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

    return completeBooking;
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

  async approve(id: string, user: any) {
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
      throw new BadRequestException('Can only approve pending bookings');
    }

    // Update booking status
    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.APPROVED,
        approvedBy: user.id,
        approvedAt: new Date(),
      },
      include: {
        resource: true,
        user: true,
      },
    });

    // Send approval email (non-blocking)
    try {
      await this.notificationsService.sendBookingApproval(updatedBooking, booking.user);
    } catch (emailError) {
      console.error('Failed to send booking approval email:', emailError);
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
        userName: `${booking.user.firstName} ${booking.user.lastName}`,
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

    // Update booking status
    await this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.REJECTED,
        rejectedBy: user.id,
        rejectedAt: new Date(),
        rejectionReason: rejectDto.rejectionReason,
      },
    });

    // Process refund if payment exists
    const payment = await this.paymentsService.findByBookingId(id);
    if (payment && payment.status === 'SUCCEEDED') {
      await this.paymentsService.refundPayment(payment.id);
    }

    // Send rejection email (non-blocking)
    try {
      await this.notificationsService.sendBookingRejection(
        booking,
        booking.user,
        rejectDto.rejectionReason,
      );
    } catch (emailError) {
      console.error('Failed to send booking rejection email:', emailError);
    }

    // Log audit
    await this.auditLogsService.log({
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      action: AuditAction.REJECT,
      entity: 'booking',
      entityId: id,
      description: `Prenotazione "${booking.title}" rifiutata`,
      metadata: {
        bookingTitle: booking.title,
        resourceName: booking.resource.name,
        userName: `${booking.user.firstName} ${booking.user.lastName}`,
        reason: rejectDto.rejectionReason,
      },
    });

    return { message: 'Booking rejected successfully' };
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
    const rows = bookings.map(booking => [
      booking.id,
      this.escapeCsvField(booking.title),
      `${booking.user.firstName} ${booking.user.lastName}`,
      booking.user.email,
      this.escapeCsvField(booking.resource.name),
      booking.resource.type,
      new Date(booking.startTime).toLocaleString('it-IT'),
      new Date(booking.endTime).toLocaleString('it-IT'),
      booking.status,
      booking.attendees || '',
      this.escapeCsvField(booking.notes || ''),
      new Date(booking.createdAt).toLocaleString('it-IT'),
    ]);

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
}
