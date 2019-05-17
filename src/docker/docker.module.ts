import { Module } from '@nestjs/common';
import { ImagesController } from './controllers/images.controller';
import { ContainersController } from './controllers/containers.controller';
import { DockerService } from './services/docker.service';
import { DockerTerminalService } from './services/docker-terminal.service';
import { DockerContainerStatsService } from './services/docker-container-stats.service';
import { CoreModule } from '../core/core.module';
import { DataModule } from 'src/data/data.module';

@Module({
    imports: [CoreModule, DataModule],
    providers: [DockerService, DockerTerminalService, DockerContainerStatsService],
    controllers: [ImagesController, ContainersController],
})
export class DockerModule { }
