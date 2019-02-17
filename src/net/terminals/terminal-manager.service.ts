import { Injectable, Logger } from '@nestjs/common';
import * as nodejsWebsocket from 'nodejs-websocket';
import * as pty from 'node-pty';

@Injectable()
export class TerminalManager {
    private terminals: { [pid: string]: pty.IPty } = {};
    private logs: { [pid: string]: string } = {};

    public createServer(): void {
        nodejsWebsocket.createServer((conn) => {
            this.connectTerminal(conn);
        }).listen(3002);
    }

    public createTerminal(rows: number, cols: number): string {
        const term: pty.IPty = pty.spawn(process.platform === 'win32' ? 'cmd.exe' : 'bash', [], {
            name: 'xterm-color',
            cols: cols || 80,
            rows: rows || 24,
            cwd: process.env.PWD,
            env: process.env,
        });

        Logger.log('Created terminal with PID: ' + term.pid);
        this.terminals[term.pid] = term;
        this.logs[term.pid] = '';
        term.on('data', (data) => {
            this.logs[term.pid] += data;
        });

        return term.pid.toString();
    }

    private connectTerminal(conn): void {
        const path = conn.path ? conn.path as string : '';
        const params = path.trim().split('/');
        if (params[1] !== 'terminals') {
            return;
        }
        const pid = params[2];

        const term = this.terminals[parseInt(pid, 10)];
        Logger.log('Connected to terminal ' + term.pid);
        conn.send(this.logs[term.pid]);

        function buffer(socket, timeout) {
            let s = '';
            let sender = null;
            return (data) => {
                s += data;
                if (!sender) {
                    sender = setTimeout(() => {
                        socket.send(s);
                        s = '';
                        sender = null;
                    }, timeout);
                }
            };
        }
        const send = buffer(conn, 5);

        term.on('data', (data) => {
            try {
                send(data);
            } catch (ex) {
                // The WebSocket is not open, ignore
            }
        });
        conn.on('text', (msg) => {
            term.write(msg);
        });
        conn.on('close', () => {
            term.kill();
            Logger.log('Closed terminal ' + term.pid);
            // Clean things up
            delete this.terminals[term.pid];
            delete this.logs[term.pid];
        });
        conn.on('error', (code, reason) => {
            Logger.error(`code: ${code}; reason: ${reason}`);
        });
    }
}
