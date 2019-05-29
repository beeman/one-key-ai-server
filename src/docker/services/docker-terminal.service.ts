import { Injectable, Logger } from '@nestjs/common';
import * as io from 'socket.io';
import { DockerService } from './docker.service';
import * as Docker from 'dockerode';
import { SocketIOServer } from '../../core/socket-io-server';

class ShellSocket {
    exec: Docker.Exec;
    stream: any;
    socket: io.Socket;
    data: string = '';

    constructor(stream: any, socket: io.Socket, exec: Docker.Exec) {
        this.stream = stream;
        this.socket = socket;
        this.exec = exec;

        this.init();
    }

    public resetSocket(socket: io.Socket) {
        if (this.socket) {
            this.socket.disconnect();
        }
        this.socket = socket;
        this.initSocket();

        if (this.socket) {
            this.socket.emit('data', this.data);
        }
    }

    private init() {
        this.initSocket();

        this.stream.on('data', (chunk) => {
            this.data += chunk.toString();
            if (this.data.length > 256 * 1024) {
                this.data = this.data.slice(-256 * 1024);
            }
            if (this.socket) {
                this.socket.emit('data', chunk.toString());
            }
        });
        this.stream.on('error', (err) => {
            if (this.socket) {
                this.socket.emit('err', err);
            }
        });
        this.stream.on('end', () => {
            if (this.socket) {
                this.socket.emit('end', 'stream end');
            }
            this.stream.destroy();
        });
    }

    private initSocket() {
        this.socket.on('data', (value) => {
            if (this.stream) {
                this.stream.write(value);
            }
        });
        this.socket.on('disconnect', () => {
            this.socket = null;
        });
    }
}

class ContainerShell {
    private shellMap: Map<string, Map<string, ShellSocket>> = new Map();

    public addShellSocket(containerId: string, shellSocket: ShellSocket) {
        const shellSockets = this.shellMap.get(containerId);
        if (shellSockets) {
            shellSockets.set(shellSocket.exec.id, shellSocket);
        } else {
            const newShellSocket = new Map();
            newShellSocket.set(shellSocket.exec.id, shellSocket);
            this.shellMap.set(containerId, newShellSocket);
        }
    }

    /**
     * 将socket添加到未监听的shell终端上
     * 若成功添加，则返回true，否则返回false
     *
     * @param {string} containerId
     * @param {io.Socket} socket
     * @returns {boolean}
     * @memberof ContainerShell
     */
    public attachSocket(containerId: string, socket: io.Socket): boolean {
        const shellSockets = this.shellMap.get(containerId);
        if (!shellSockets) {
            return false;
        }

        for (let [key, shellSocket] of shellSockets) {
            if (!shellSocket.socket) {
                shellSocket.resetSocket(socket);
                return true;
            }
        }
        return false;

    }

    public deleteShellSocket(containerId: string, execId: string) {
        const shellSockets = this.shellMap.get(containerId);
        if (!shellSockets) {
            return;
        }

        shellSockets.delete(execId);
    }

    public length(containerId: string): number {
        const shellSockets = this.shellMap.get(containerId);
        if (shellSockets) {
            return shellSockets.size;
        } else {
            return 0;
        }
    }

    public shellSockets(containerId: string): Map<string, ShellSocket> {
        return this.shellMap.get(containerId);
    }
}

@Injectable()
export class DockerTerminalService {
    private docker: Docker;
    private containerShell: ContainerShell;

    constructor(private readonly dockerService: DockerService) {
        this.docker = this.dockerService.getDocker();
        this.containerShell = new ContainerShell();

        SocketIOServer.getInstance().on('connection', client => {
            client.on('exec', data => {
                if (this.containerShell.attachSocket(data['id'], client)) {
                    return;
                }

                this.createTerminal(data, client);
            });
        });
    }

    public shellLength(containerId: string): number {
        return this.containerShell.length(containerId);
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
            this.startExec(exec, socket, id);
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

    private startExec(exec: Docker.Exec, socket: io.Socket, containerId: string): void {
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
            // stream.write('cd /projects\nclear\n');

            const shellSocket = new ShellSocket(stream, socket, exec);
            this.containerShell.addShellSocket(containerId, shellSocket);

            stream.on('end', () => {
                this.containerShell.deleteShellSocket(containerId, exec.id);
            });

            // socket.on('data', (value) => {
            //     stream.write(value);
            // });
            // socket.on('disconnect', () => {
            //     // stream.destroy();
            // });

            // stream.on('data', (chunk) => {
            //     socket.emit('data', chunk.toString());
            // });
            // stream.on('error', (err) => {
            //     socket.emit('err', err);
            // });
            // stream.on('end', () => {
            //     socket.emit('end', 'stream end');
            // });
        });
    }
}
