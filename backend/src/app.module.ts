import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GuruModule } from './guru/guru.module';
import { SiswaModule } from './siswa/siswa.module';
import { Guru } from './guru/guru.entity';
import { Siswa } from './siswa/siswa.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: parseInt(configService.get<string>('DB_PORT', '5432'), 10),
        username: configService.get<string>('DB_USER', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_NAME', 'db_manajemen_data'),
        entities: [Guru, Siswa],
        synchronize: true, // Matches Exposed's SchemaUtils.createMissingTablesAndColumns
      }),
    }),
    GuruModule,
    SiswaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
