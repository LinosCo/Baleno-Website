import { Injectable, ForbiddenException, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto, ChangePasswordDto } from './dto';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        avatar: true,
        emailVerified: true,
        isActive: true,
        createdAt: true,
        lastLogin: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return users;
  }

  async findOne(id: string, currentUser: any) {
    // Users can see their own profile, Admin/CM can see any
    if (currentUser.id !== id && ![UserRole.ADMIN, UserRole.COMMUNITY_MANAGER].includes(currentUser.role)) {
      throw new ForbiddenException('You can only view your own profile');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        avatar: true,
        emailVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user;
  }

  async create(userData: any) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password if provided
    let dataToCreate = { ...userData };
    if (userData.password) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      dataToCreate = { ...userData, password: hashedPassword };
    }

    const user = await this.prisma.user.create({
      data: dataToCreate,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    return user;
  }

  async update(id: string, updateDto: UpdateUserDto, currentUser: any) {
    // Users can update their own profile, Admin can update any
    if (currentUser.id !== id && currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only update your own profile');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if email is being changed and if it's already taken
    if (updateDto.email && updateDto.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateDto,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        avatar: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto, currentUser: any) {
    // Users can only change their own password
    if (currentUser.id !== id) {
      throw new ForbiddenException('You can only change your own password');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user || !user.password) {
      throw new NotFoundException('User not found or password not set');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(changePasswordDto.currentPassword, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully' };
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        bookings: true,
        payments: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Delete user's payments first (has Restrict constraint)
    if (user.payments.length > 0) {
      await this.prisma.payment.deleteMany({
        where: { userId: id },
      });
    }

    // Delete user's bookings and associated resources
    if (user.bookings.length > 0) {
      // Delete booking resources (additional resources)
      for (const booking of user.bookings) {
        await this.prisma.bookingResource.deleteMany({
          where: { bookingId: booking.id },
        });
      }

      // Delete bookings
      await this.prisma.booking.deleteMany({
        where: { userId: id },
      });
    }

    // RefreshTokens and Notifications will be deleted automatically (Cascade)
    // Now delete the user
    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }

  async updateRole(id: string, roleDto: { role: UserRole }) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { role: roleDto.role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    return updatedUser;
  }
}
