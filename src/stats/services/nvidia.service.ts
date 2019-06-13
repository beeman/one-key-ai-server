import { Injectable, Logger } from '@nestjs/common';
import { SocketIOServer } from '../../core/socket-io-server';
import { ProcessService } from '../../core/process.service';
import { spawn } from 'child_process';
import { EventEmitter } from 'events';
import * as xml from 'xml2js';

@Injectable()
export class NvidiaService {
    private eventEmitter: EventEmitter = new EventEmitter();
    private stats = null;

    constructor(
        private readonly processService: ProcessService
    ) {
        this.initListener();
        this.initServer();
    }

    private initServer(): void {
        SocketIOServer.getInstance().on('connection', client => {
            client.on('nvidiaStats', () => {
                // 建立连接时发送数据
                if (this.stats) {
                    client.emit('data', this.stats);
                }

                const onData = (data: string): void => {
                    client.emit('data', data);
                };
                const onError = (err: string): void => {
                    client.emit('err', err);
                };
                this.eventEmitter.on('data', onData);
                this.eventEmitter.on('err', onError);

                client.on('disconnect', () => {
                    this.eventEmitter.removeListener('data', onData);
                    this.eventEmitter.removeListener('err', onError);
                });
            });
        });
    }

    private async initListener() {
        try {
            let existNvidiaDriver = await this.processService.existCommand('nvidia-smi');
            if (existNvidiaDriver) {
                this.listenNvidiaStats();
            } else {
                const intervalId = setInterval(() => {
                    this.processService.existCommand('nvidia-smi').then(
                        value => {
                            if (value) {
                                this.listenNvidiaStats();
                                clearInterval(intervalId);
                            }
                        }
                    );
                }, 5000);
            }
        } catch (err) {
            Logger.error(err);
        }
    }

    private listenNvidiaStats(): void {
        const process = spawn('nvidia-smi', ['-q', '-x', '-l', '5']);
        let logs = '';
        process.stdout.on('data', (chunk) => {
            logs += chunk.toString();
            if (logs.indexOf('</nvidia_smi_log>') >= 0) {
                this.xmlToJson(logs, (data) => {
                    this.stats = data;
                    this.eventEmitter.emit('data', data);
                    logs = '';
                });
            }

            // this.eventEmitter.emit('data', chunk.toString());
        });
        process.stdout.on('end', () => {
            // Logger.log('end');
        })
        process.stderr.on('data', (chunk) => {
            this.eventEmitter.emit('err', chunk.toString());
        });
        process.on('error', (err) => {
            this.eventEmitter.emit('err', err.message);
        });
    }

    private xmlToJson(text: string, callback: Function) {
        try {
            xml.parseString(text, (err, result) => {
                if (err) {
                    Logger.log(err);
                    return;
                } else {
                    callback(result);
                }
            });
        } catch (err) {
            Logger.error(err.message);
        }

    }
}
