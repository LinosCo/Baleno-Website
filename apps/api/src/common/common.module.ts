import { Global, Module } from '@nestjs/common';
import { ResendService } from './services/resend.service';
import { EncryptionService } from './services/encryption.service';

@Global()
@Module({
  providers: [ResendService, EncryptionService],
  exports: [ResendService, EncryptionService],
})
export class CommonModule {}
