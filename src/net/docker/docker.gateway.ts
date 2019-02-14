import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { DockerService } from './docker.service';

@WebSocketGateway()
export class DockerGateway {
  private readonly tag = DockerGateway.name;

  constructor(private readonly dockerService: DockerService) {
    this.dockerService.getDockerImages();
  }

  @SubscribeMessage('dockerImages')
  dockerImages(client: any, payload: any) {
    this.dockerService.getDockerImages().subscribe(value => {
      client.emit('dockerImages', value);
    });
  }

  @SubscribeMessage('runDocker')
  runDocker(client: any, payload: any) {
    this.dockerService.runDocker(payload).subscribe(value => {
      Logger.log(value);
      client.emit('runDocker');
    });
  }
}
