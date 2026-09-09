import { Module } from '@nestjs/common';
import { AkunController } from './akun.controller';
import { KeycloakAdminService } from './keycloak-admin.service';

@Module({
  controllers: [AkunController],
  providers: [KeycloakAdminService],
})
export class AkunModule {}
