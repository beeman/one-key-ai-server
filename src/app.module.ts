import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NetModule } from './net/net.module';

@Module({
  imports: [NetModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
