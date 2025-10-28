import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    // TODO: Implement - Get all users (Admin/CM only)
    throw new Error('Not implemented yet');
  }

  async findOne(id: string, currentUser: any) {
    // TODO: Implement - Users can see their own profile, Admin/CM can see any
    throw new Error('Not implemented yet');
  }

  async findByEmail(email: string) {
    // TODO: Implement - Find user by email
    throw new Error('Not implemented yet');
  }

  async create(userData: any) {
    // TODO: Implement - Create new user
    throw new Error('Not implemented yet');
  }

  async update(id: string, updateDto: any, currentUser: any) {
    // TODO: Implement - Users can update their own profile, Admin can update any
    throw new Error('Not implemented yet');
  }

  async remove(id: string) {
    // TODO: Implement - Soft delete user (Admin only)
    throw new Error('Not implemented yet');
  }

  async updateRole(id: string, roleDto: any) {
    // TODO: Implement - Update user role (Admin only)
    throw new Error('Not implemented yet');
  }
}
