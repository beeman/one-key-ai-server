import { Controller, Logger } from '@nestjs/common';
import * as io from 'socket.io';
import { PerformanceService } from './performance/performance.service';
import { DriverService } from './driver/driver.service';


/**
 * 与客户端进行信息通信
 * 长连接部分采用socket.io实现
 * 不采用WebSocketGateway的原因是：通过pkg打包后的程序无法与客户端进行正常通信，原因不明
 *
 * @export
 * @class InfoController
 */
@Controller('info')
export class InfoController {
    constructor(private readonly performanceService: PerformanceService,
        private readonly driverService: DriverService) {
        const server = io(3001);

        // 发送top信息至客户端
        this.performanceService.getData().subscribe((data) => {
            server.emit('topInfo', data);
        });

        // 监听连接事件
        server.on('connection', (socket: io.Socket) => {
            socket.on('autoinstall', () => {
                this.driverService.autoinstall().subscribe(value => {
                    socket.emit('autoinstall', value);
                });
            });
            socket.on('driverDevices', () => {
                this.driverService.getDevices().subscribe(value => {
                    socket.emit('driverDevices', value);
                });
            });
            socket.on('driverList', () => {
                this.driverService.getList().subscribe(value => {
                    socket.emit('driverList', value);
                });
            });
        });
    }
}
