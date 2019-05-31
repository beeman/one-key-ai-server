import { Module } from '@nestjs/common';
import { NetModule } from './net/net.module';
import { CoreModule } from './core/core.module';
import { DockerModule } from './docker/docker.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataModule } from './data/data.module';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [
    NetModule,
    CoreModule,
    DockerModule,
    AuthModule,
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'save/ai.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    DataModule,
    StatsModule,
  ],
})
export class AppModule { }
