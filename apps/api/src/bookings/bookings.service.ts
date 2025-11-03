import { Injectable, ForbiddenException, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from '../payments/payments.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateBookingDto, UpdateBookingDto, RejectBookingDto, CancelBookingDto } from './dto';
import { BookingStatus, UserRole } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private paymentsService: PaymentsService,
    private notificationsService: NotificationsService,
  ) {}

  async create(createDto: CreateBookingDto, user: any) {
    const { resourceId, startTime, endTime, ...bookingData } = createDto;

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

    // Calculate price
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const amount = Number(resource.pricePerHour) * hours;

    // Create booking
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

    // Create payment intent
    const payment = await this.paymentsService.createPaymentIntent(
      booking.id,
      user.id,
      amount,
    );

    // Send confirmation email
    await this.notificationsService.sendBookingConfirmation(booking, user);

    return {
      booking,
      payment,
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

    // Send cancellation email
    await this.notificationsService.sendBookingCancellation(booking, user);

    return { message: 'Booking cancelled successfully' };
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

    // Send approval email
    await this.notificationsService.sendBookingApproval(updatedBooking, booking.user);

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

    // Send rejection email
    await this.notificationsService.sendBookingRejection(
      booking,
      booking.user,
      rejectDto.rejectionReason,
    );

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
        OR: [
          {
            // New booking starts during existing booking
            startTime: {
              lte: startTime,
            },
            endTime: {
              gt: startTime,
            },
          },
          {
            // New booking ends during existing booking
            startTime: {
              lt: endTime,
            },
            endTime: {
              gte: endTime,
            },
          },
          {
            // New booking contains existing booking
            startTime: {
              gte: startTime,
            },
            endTime: {
              lte: endTime,
            },
          },
        ],
        ...(excludeBookingId && { id: { not: excludeBookingId } }),
      },
    });

    return conflictingBookings.length === 0;
  }
}
