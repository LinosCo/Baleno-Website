import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookingStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getBookingsReport(query: { startDate?: string; endDate?: string }) {
    const where: any = {};

    if (query.startDate) {
      where.createdAt = { gte: new Date(query.startDate) };
    }

    if (query.endDate) {
      where.createdAt = { ...where.createdAt, lte: new Date(query.endDate) };
    }

    const bookings = await this.prisma.booking.findMany({
      where,
      include: {
        resource: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Calculate statistics
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter((b) => b.status === BookingStatus.PENDING).length;
    const approvedBookings = bookings.filter((b) => b.status === BookingStatus.APPROVED).length;
    const rejectedBookings = bookings.filter((b) => b.status === BookingStatus.REJECTED).length;
    const cancelledBookings = bookings.filter((b) => b.status === BookingStatus.CANCELLED).length;

    return {
      totalBookings,
      pendingBookings,
      approvedBookings,
      rejectedBookings,
      cancelledBookings,
      bookings,
    };
  }

  async getRevenueReport(query: { startDate?: string; endDate?: string }) {
    const where: any = {
      status: PaymentStatus.SUCCEEDED,
    };

    if (query.startDate) {
      where.createdAt = { gte: new Date(query.startDate) };
    }

    if (query.endDate) {
      where.createdAt = { ...where.createdAt, lte: new Date(query.endDate) };
    }

    const payments = await this.prisma.payment.findMany({
      where,
      include: {
        booking: {
          include: {
            resource: true,
          },
        },
      },
    });

    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalRefunded = payments.reduce((sum, p) => sum + Number(p.refundedAmount || 0), 0);
    const netRevenue = totalRevenue - totalRefunded;

    return {
      totalRevenue,
      totalRefunded,
      netRevenue,
      totalTransactions: payments.length,
      payments,
    };
  }

  async getUsersReport() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
        isActive: true,
        _count: {
          select: {
            bookings: true,
            payments: true,
          },
        },
      },
    });

    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.isActive).length;
    const inactiveUsers = totalUsers - activeUsers;

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      users,
    };
  }

  async getResourcesReport() {
    const resources = await this.prisma.resource.findMany({
      include: {
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    const totalResources = resources.length;
    const activeResources = resources.filter((r) => r.isActive).length;

    return {
      totalResources,
      activeResources,
      resources,
    };
  }

  async getDashboardStats() {
    const [
      totalUsers,
      totalBookings,
      pendingBookings,
      totalRevenue,
      totalResources,
      recentBookings,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.booking.count(),
      this.prisma.booking.count({
        where: { status: BookingStatus.PENDING },
      }),
      this.prisma.payment.aggregate({
        where: { status: PaymentStatus.SUCCEEDED },
        _sum: { amount: true },
      }),
      this.prisma.resource.count({ where: { isActive: true } }),
      this.prisma.booking.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          resource: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
    ]);

    return {
      totalUsers,
      totalBookings,
      pendingBookings,
      totalRevenue: totalRevenue._sum.amount || 0,
      totalResources,
      recentBookings,
    };
  }
}
