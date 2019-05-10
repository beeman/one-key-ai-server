import { Module } from '@nestjs/common';
import { ImagesController } from './controllers/images.controller';
import { CoreModule } from 'src/core/core.module';
import { ContainersController } from './controllers/containers.controller';
import { DockerService } from './services/docker.service';
import { DockerTerminalService } from './services/docker-terminal.service';
import { DockerContainerStatsService } from './services/docker-container-stats.service';

@Module({
    imports: [CoreModule],
    providers: [DockerService, DockerTerminalService, DockerContainerStatsService],
    controllers: [ImagesController, ContainersController],
})
export class DockerModule { }
