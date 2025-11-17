import { Controller, Get, Put, Body, UseGuards, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../common/services/encryption.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { UpdatePaymentSettingsDto } from './dto/update-payment-settings.dto';

@Controller('admin/payment-settings')
@UseGuards(RolesGuard)
export class PaymentSettingsController {
  private readonly logger = new Logger(PaymentSettingsController.name);

  constructor(
    private prisma: PrismaService,
    private encryptionService: EncryptionService,
  ) {}

  @Get()
  @Roles(UserRole.ADMIN)
  async getSettings() {
    let settings = await this.prisma.paymentSettings.findFirst();

    if (!settings) {
      // Create default settings
      settings = await this.createDefaultSettings();
    }

    // Don't return encrypted secrets in plain text
    return {
      ...settings,
      stripeSecretKey: settings.stripeSecretKey ? '••••••••' : null,
      stripeWebhookSecret: settings.stripeWebhookSecret ? '••••••••' : null,
    };
  }

  @Put()
  @Roles(UserRole.ADMIN)
  async updateSettings(@Body() dto: UpdatePaymentSettingsDto) {
    const currentSettings = await this.prisma.paymentSettings.findFirst();

    // Prepare data to update
    const dataToUpdate: any = { ...dto };

    // Encrypt sensitive keys only if they were changed (not ••••••••)
    if (dto.stripeSecretKey && dto.stripeSecretKey !== '••••••••') {
      dataToUpdate.stripeSecretKey = this.encryptionService.encrypt(dto.stripeSecretKey);
      this.logger.log('Stripe secret key encrypted and updated');
    } else {
      delete dataToUpdate.stripeSecretKey;
    }

    if (dto.stripeWebhookSecret && dto.stripeWebhookSecret !== '••••••••') {
      dataToUpdate.stripeWebhookSecret = this.encryptionService.encrypt(dto.stripeWebhookSecret);
      this.logger.log('Stripe webhook secret encrypted and updated');
    } else {
      delete dataToUpdate.stripeWebhookSecret;
    }

    // Update timestamp
    dataToUpdate.updatedAt = new Date();

    if (currentSettings) {
      const updated = await this.prisma.paymentSettings.update({
        where: { id: currentSettings.id },
        data: dataToUpdate,
      });

      this.logger.log('Payment settings updated successfully');

      return {
        ...updated,
        stripeSecretKey: updated.stripeSecretKey ? '••••••••' : null,
        stripeWebhookSecret: updated.stripeWebhookSecret ? '••••••••' : null,
      };
    } else {
      const created = await this.prisma.paymentSettings.create({
        data: dataToUpdate,
      });

      this.logger.log('Payment settings created successfully');

      return {
        ...created,
        stripeSecretKey: created.stripeSecretKey ? '••••••••' : null,
        stripeWebhookSecret: created.stripeWebhookSecret ? '••••••••' : null,
      };
    }
  }

  private async createDefaultSettings() {
    return this.prisma.paymentSettings.create({
      data: {
        stripeEnabled: false,
        bankTransferEnabled: false,
        currency: 'EUR',
        taxRate: 22,
        invoicePrefix: 'INV',
        invoiceStartNumber: 1,
        currentInvoiceNumber: 1,
        paymentDeadlineDays: 2,
        paymentReminderHours: 24,
        sendReminders: true,
      },
    });
  }
}
