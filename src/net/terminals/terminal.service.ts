import { Injectable, Logger } from '@nestjs/common';
import * as pty from 'node-pty';
import { SocketIOServer } from '../../core/socket-io-server';
import * as io from 'socket.io';

@Injectable()
export class TerminalService {
    private terminals: { [pid: string]: pty.IPty } = {};
    private logs: { [pid: string]: string } = {};

    constructor() {
        this.createServer();
    }

    public createServer(): void {
        SocketIOServer.getInstance().on('connection', client => {
            client.on('terminal', (data) => {
                let term = this.terminals[parseInt(data['pid'], 10)];
                if (!term) {
                    const pid = this.createTerminal(data['rows'], data['cols']);
                    term = this.terminals[parseInt(pid, 10)];
                    client.emit('pid', pid);
                } else {
                    client.emit('data', this.logs[term.pid]);
                }

                this.connectTerminal(client, term);
            });
        });
    }

    public createTerminal(rows: number, cols: number): string {
        const term: pty.IPty = pty.spawn(process.platform === 'win32' ? 'cmd.exe' : 'bash', [], {
            name: 'xterm-color',
            cols: cols || 80,
            rows: rows || 24,
            cwd: process.env.PWD,
            env: process.env,
        });

        this.terminals[term.pid] = term;
        this.logs[term.pid] = '';
        term.on('data', (data) => {
            this.logs[term.pid] += data;
        });

        return term.pid.toString();
    }

    private connectTerminal(socket: io.Socket, term): void {
        function buffer(socket, timeout) {
            let s = '';
            let sender = null;
            return (data) => {
                s += data;
                if (!sender) {
                    sender = setTimeout(() => {
                        socket.emit('data', s);
                        s = '';
                        sender = null;
                    }, timeout);
                }
            };
        }
        const send = buffer(socket, 5);

        term.on('data', (data) => {
            try {
                send(data);
                // socket.emit('data', data);
            } catch (ex) {
                // The WebSocket is not open, ignore
            }
        });
        socket.on('data', (msg) => {
            term.write(msg);
        });
        socket.on('disconnect', () => {
            term.kill();
            // Clean things up
            delete this.terminals[term.pid];
            delete this.logs[term.pid];
        });
        socket.on('error', (code, reason) => {
            Logger.error(`code: ${code}; reason: ${reason}`);
        });
    }
}
