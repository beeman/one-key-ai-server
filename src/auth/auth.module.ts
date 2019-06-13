import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { HttpStrategy } from './http.strategy';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { DataModule } from '../data/data.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'bearer' }),
    DataModule
  ],
  providers: [AuthService, HttpStrategy],
  controllers: [AuthController]
})
export class AuthModule { }
