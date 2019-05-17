import { Injectable, Logger } from '@nestjs/common';
import { ProcessService } from '../../../core/process/process.service';
import { map } from 'rxjs/operators';
import { ProcessResultType } from '../../../core/process/process-result-type';

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
        // const process = spawn('ubuntu-drivers', ['autoinstall']);
        return this.processService.executeWithCheck('ubuntu-drivers', ['autoinstall']);
    }

    /**
     * 获取已安装驱动列表
     *
     * @returns
     * @memberof DriverService
     */
    public getList() {
        // const process = spawn('ubuntu-drivers', ['list']);
        return this.processService.executeWithCheck('ubuntu-drivers', ['list']).pipe(
            map((value): ProcessResultType => {
                if (value.type === 'stdout') {
                    return { type: value.type, value: value.value.trim().split('\n') };
                }
                return value;
            }),
        );
    }

    /**
     * 获取驱动信息
     *
     * @returns
     * @memberof DriverService
     */
    public getDevices() {
        // const process = spawn('ubuntu-drivers', ['devices']);
        return this.processService.executeWithCheck('ubuntu-drivers', ['devices']).pipe(
            map(value => {
                if (value.type === 'stdout') {
                    value.value = this.parseDevices(value.value);
                    return value;
                }
                return value;
            }),
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
                const k = valueData[0].trim();
                const name = valueData[1].trim();
                if (k === 'vendor' && name.startsWith('NVIDIA')) {
                    isNvidia = true;
                }
                result.push({ key: k, value: name });
            }
        });

        if (isNvidia) {
            return result;
        }
        return null;
    }

}
