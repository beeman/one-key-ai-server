import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NetModule } from './net/net.module';
import { CoreModule } from './core/core.module';

@Module({
  imports: [NetModule, CoreModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
