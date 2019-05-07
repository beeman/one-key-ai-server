import { Module } from '@nestjs/common';
import { ImagesController } from './controllers/images.controller';
import { CoreModule } from 'src/core/core.module';
import { ContainersController } from './controllers/containers.controller';
import { DockerService } from './services/docker.service';

@Module({
    imports: [CoreModule],
    providers: [DockerService],
    controllers: [ImagesController, ContainersController],
})
export class DockerModule { }
