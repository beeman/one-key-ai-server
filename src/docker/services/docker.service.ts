import { Injectable, Logger } from '@nestjs/common';
import * as Docker from 'dockerode';
import { SocketIOServer } from '../../core/socket-io-server';
import * as io from 'socket.io';


@Injectable()
export class DockerService {
    private docker: Docker = null;

    constructor() {
        this.docker = new Docker();

        SocketIOServer.getInstance().on('connection', client => {
            client.on('pullImage', (data) => {
                this.pullImage(client, data['name']);
            });
        });
    }

    public getDocker(): Docker {
        return this.docker;
    }

    private pullImage(socket: io.Socket, name: string) {
        this.docker.pull(name, null, (err, stream) => {
            if (err) {
                socket.emit('err', err);
                return;
            }
            if(!stream){
                socket.emit('err', 'not find stream');
                return;
            }
            this.docker.modem.followProgress(stream, onFinished, onProgress);

            socket.on('stop', () => {
                stream.destroy();
            });

            function onFinished(err, output) {
                if (err) {
                    socket.emit('err', err);
                }
                socket.emit('end');
            }

            function onProgress(event) {
                if (event.id) {
                    socket.emit('data', event.status + ':' + event.id + '\n\r');
                } else {
                    socket.emit('data', event.status + '\n\r');

                }
                if (event.progress) {
                    socket.emit('data', event.progress + '\n\r');
                }
            }
        });
    }
}
