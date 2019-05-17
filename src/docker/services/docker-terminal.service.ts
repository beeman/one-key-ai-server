import { Injectable, Logger } from '@nestjs/common';
import * as io from 'socket.io';
import { DockerService } from './docker.service';
import * as Docker from 'dockerode';
import { SocketIOServer } from '../../core/socket-io-server';

@Injectable()
export class DockerTerminalService {
    private docker: Docker;

    constructor(private readonly dockerService: DockerService) {
        this.docker = this.dockerService.getDocker();

        SocketIOServer.getInstance().on('connection', client => {
            client.on('exec', data => {
                this.createTerminal(data, client);
            });
        });
    }

    // socket不能emit('error')，否则会抛出错误
    private createTerminal(data: any, socket: io.Socket): void {
        const id = data['id'];
        const cols = data['cols'];
        const rows = data['rows'];

        const container = this.docker.getContainer(id);
        var config = {
            "AttachStdout": true,
            "AttachStderr": true,
            "AttachStdin": true,
            "Tty": true,
            Cmd: ['/bin/bash']
        };

        container.exec(config, (err, exec: Docker.Exec) => {
            if (err) {
                socket.emit('err', err);
                return;
            }

            container.wait((err, data) => {
                if (err) {
                    socket.emit('err', err);
                    return;
                }
                socket.emit('end', 'container end');
            });

            this.resizeExec(exec, cols, rows, socket);

            this.startExec(exec, socket);
        })
    }

    private resizeExec(exec: Docker.Exec, cols: number, rows: number, socket?: io.Socket): void {
        const dimensions = { w: cols, h: rows };

        if (dimensions.h != 0 && dimensions.w != 0) {
            exec.resize(dimensions, (err) => {
                if (err && socket) {
                    socket.emit('err', err);
                }
            });
        }
    }

    private startExec(exec: Docker.Exec, socket: io.Socket): void {
        const options = {
            'Tty': true,
            stream: true,
            stdin: true,
            stdout: true,
            stderr: true,
            // fix vim
            hijack: true,
        };

        exec.start(options, (err, stream) => {
            if (err) {
                socket.emit('err', err);
                return;
            }

            socket.on('data', (value) => {
                stream.write(value);
            });
            socket.on('disconnect', () => {
                stream.destroy();
            });

            stream.on('data', (chunk) => {
                socket.emit('data', chunk.toString());
            });
            stream.on('error', (err) => {
                socket.emit('err', err);
            });
            stream.on('end', () => {
                socket.emit('end', 'stream end');
            });
        });
    }
}
