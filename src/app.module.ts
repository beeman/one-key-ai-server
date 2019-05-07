import { Module } from '@nestjs/common';
import { NetModule } from './net/net.module';
import { CoreModule } from './core/core.module';
import { DockerModule } from './docker/docker.module';

@Module({
  imports: [NetModule, CoreModule, DockerModule],
})
export class AppModule { }
