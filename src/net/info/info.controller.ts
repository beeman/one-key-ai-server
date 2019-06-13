import { Controller, Logger, Post } from '@nestjs/common';
import * as io from 'socket.io';
import { DriverService } from './driver.service';
import { async } from 'rxjs/internal/scheduler/async';


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
    constructor(private readonly driverService: DriverService) { }

    @Post('driver-list')
    async  driverList() {
        const drivers = await this.driverService.getList();
        if (drivers) {
            return { msg: 'ok', data: drivers };
        } else {
            return { msg: '未能找到驱动信息' };
        }
    }

    @Post('driver-devices')
    async  driverDevices() {
        const drivers = await this.driverService.getDevices();
        if (drivers) {
            return { msg: 'ok', data: drivers };
        } else {
            return { msg: '未能找到驱动信息' };
        }
    }
}
