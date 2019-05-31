import { Injectable, Logger } from '@nestjs/common';
import * as os from 'os';
import { SocketIOServer } from '../../core/socket-io-server';
import { EventEmitter } from 'events';

@Injectable()
export class ComputerStatsService {
    private stats = null;
    private eventEmitter: EventEmitter = new EventEmitter();

    constructor() {
        this.initListener();
        this.initServer();
    }

    private getCpuInfo() {
        const cpus = os.cpus();
        let wholeTimes = 0;
        let idleTimes = 0;
        for (let i = 0; i < cpus.length; ++i) {
            const times = cpus[i].times;
            wholeTimes += times.idle + times.user + times.nice + times.sys + times.irq;
            idleTimes += times.idle;
        }

        const cpuPercent = (1 - idleTimes / wholeTimes) * 100
        return Number.parseFloat(cpuPercent.toFixed(2));
    }

    private getMemInfo() {
        const totalMem = os.totalmem();
        const freeMem = os.freemem();

        return {
            memUsage: totalMem - freeMem,
            limit: totalMem,
        }
    }

    // private getNetworksInfo() {
    //     console.log('*****网卡信息*******');
    //     const networksObj = os.networkInterfaces();
    //     console.log(networksObj);
    //     for (let nw in networksObj) {
    //         let objArr = networksObj[nw];
    //         console.log(`\r\n${nw}：`);
    //         objArr.forEach((obj, idx, arr) => {
    //             console.log(`地址：${obj.address}`);
    //             console.log(`掩码：${obj.netmask}`);
    //             console.log(`物理地址：${obj.mac}`);
    //             console.log(`协议族：${obj.family}`);
    //         });
    //     }
    // }

    private initListener(): void {
        setInterval(() => {
            this.stats = {
                cpu: this.getCpuInfo(),
                mem: this.getMemInfo(),
                time: new Date()
            }
            this.eventEmitter.emit('data', this.stats);
        }, 1000);
    }

    private initServer(): void {
        SocketIOServer.getInstance().on('connection', client => {
            client.on('computerStats', () => {
                // 建立连接时发送数据
                if (this.stats) {
                    client.emit('data', this.stats);
                }

                const onData = (data: string): void => {
                    client.emit('data', data);
                };

                this.eventEmitter.on('data', onData);

                client.on('disconnect', () => {
                    this.eventEmitter.removeListener('data', onData);
                });
            });
        });
    }
}
