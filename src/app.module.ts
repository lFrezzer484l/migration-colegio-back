import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [

  ConfigModule.forRoot({
    isGlobal: true,
  }),
  
  ThrottlerModule.forRoot([
    {
      name: 'short',
      ttl: 5000,
      limit: 20,
    },
  ]),


  TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],

    useFactory: (configService: ConfigService) => ({
      
      type: 'postgres',
      
      host: configService.get<string>('DB_HOST'),

      port: configService.get<number>('DB_PORT'),

      username: configService.get<string>('DB_USERNAME'),

      password: configService.get<string>('DB_PASSWORD'),

      database: configService.get<string>('DB_DATABASE'),

      autoLoadEntities: true,

      synchronize: false,
    }),
  }),
  
  AuthModule,
  ],

  providers: [
  {
    provide: APP_GUARD,
    useClass: ThrottlerGuard,
  },
],
})
export class AppModule {}
