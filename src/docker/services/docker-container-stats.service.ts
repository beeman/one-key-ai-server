import { Injectable, Logger } from '@nestjs/common';
import { SocketIOServer } from 'src/core/socket-io-server';
import * as Docker from 'dockerode';
import { DockerService } from './docker.service';

@Injectable()
export class DockerContainerStatsService {
    private docker: Docker;

    constructor(private readonly dockerService: DockerService) {
        this.docker = this.dockerService.getDocker();

        SocketIOServer.getInstance().on('connection', client => {
            client.on('containerStats', data => {
                this.getStats(data, client);
            });
        });
    }

    private getStats(id: string, socket: SocketIO.Socket): void {
        const container = this.docker.getContainer(id);
        container.stats((err, stream: any) => {
            if (!err && stream) {
                socket.on('disconnect', () => {
                    stream.destroy();
                });

                stream.on('data', function (data) {
                    socket.emit('stats', data.toString('utf8'));
                });

                stream.on('end', function () {
                    socket.disconnect();
                    stream.destroy();
                    Logger.warn('constainer stats stream end');
                });
                stream.on('error', function (err) {
                    socket.disconnect();
                    stream.destroy();
                    Logger.error(err);
                });
            }
        });
    }
}
