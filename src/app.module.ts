import { Module } from '@nestjs/common';
import { NetModule } from './net/net.module';
import { CoreModule } from './core/core.module';

@Module({
  imports: [NetModule, CoreModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
