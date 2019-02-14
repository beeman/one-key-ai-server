import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import { fromEvent } from 'rxjs';
import { ProcessService } from 'src/core/process/process.service';
import { map } from 'rxjs/operators';

@Injectable()
export class DriverService {

    private readonly tag = DriverService.name;

    constructor(private readonly processService: ProcessService) {
    }

    /**
     * 自动安装推荐驱动
     *
     * @returns
     * @memberof DriverService
     */
    public autoinstall() {
        const process = spawn('ubuntu-drivers', ['autoinstall']);
        return this.processService.execute(process);
    }

    /**
     * 获取已安装驱动列表
     *
     * @returns
     * @memberof DriverService
     */
    public getList() {
        const process = spawn('ubuntu-drivers', ['list']);
        return this.processService.execute(process).pipe(
            map((value) => {
                if (value.type === 'stdout') {
                    return { type: value.type, message: value.message.trim().split('\n') };
                }
                return value;
            })
        );;
    }

    /**
     * 获取驱动信息
     *
     * @returns
     * @memberof DriverService
     */
    public getDevices() {
        const process = spawn('ubuntu-drivers', ['devices']);
        return this.processService.execute(process).pipe(
            map(value => {
                if (value.type === 'stdout') {
                    value.message = this.parseDevices(value.message);
                    return value;
                }
                return value;
            })
        );
    }

    /**
     * 解析驱动信息
     *
     * @private
     * @param {string} data
     * @returns {{}}
     * @memberof DriverService
     */
    private parseDevices(data: string): {} {
        const devices = data.split(new RegExp('==.*=='));
        const result = [];

        devices.forEach((value) => {
            value = value.trim();
            if (value) {
                const device = this.parseDevice(value);
                if (device) {
                    result.push(device);
                }
            }
        });
        return result;
    }

    private parseDevice(data: string): {} {
        const lines = data.split('\n');
        const result = [];
        let isNvidia = false;

        lines.forEach((value) => {
            if (value) {
                const valueData = value.split(':');
                const key = valueData[0].trim();
                const name = valueData[1].trim();
                if (key === 'vendor' && name.startsWith('NVIDIA')) {
                    isNvidia = true;
                }
                result.push({ 'key': key, 'value': name });
            }
        });

        if (isNvidia) {
            return result;
        }
        return null;
    }

}
