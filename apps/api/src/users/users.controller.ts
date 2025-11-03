import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateUserDto, ChangePasswordDto } from './dto';
import { UserRole } from '@prisma/client';

@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.COMMUNITY_MANAGER)
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() currentUser: any) {
    return this.usersService.findOne(id, currentUser);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateUserDto, @CurrentUser() currentUser: any) {
    return this.usersService.update(id, updateDto, currentUser);
  }

  @Put(':id/password')
  async changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.usersService.changePassword(id, changePasswordDto, currentUser);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Put(':id/role')
  @Roles(UserRole.ADMIN)
  async updateRole(@Param('id') id: string, @Body() roleDto: any) {
    return this.usersService.updateRole(id, roleDto);
  }
}
