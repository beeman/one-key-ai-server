import { Injectable, Logger } from '@nestjs/common';
import { ProcessService } from '../../core/process.service';
import { exec } from 'child_process';

@Injectable()
export class DriverService {
    constructor(private readonly processService: ProcessService) { }

    /**
     * 获取已安装驱动列表
     *
     * @returns
     * @memberof DriverService
     */
    public async getList(): Promise<string[]> {
        const exists = await this.processService.existCommand('ubuntu-drivers');
        if (!exists) {
            return null;
        }

        return new Promise((resolve, reject) => {
            exec('ubuntu-drivers list', (error, stdout, stderr) => {
                if (error || stderr) {
                    resolve(null);
                } else {
                    resolve(stdout.trim().split('\n'));
                }
            });
        });
    }



    /**
     * 获取驱动信息
     *
     * @returns
     * @memberof DriverService
     */
    public async getDevices(): Promise<any> {
        const exists = await this.processService.existCommand('ubuntu-drivers');
        if (!exists) {
            return null;
        }

        return new Promise((resolve, reject) => {
            exec('ubuntu-drivers devices', (error, stdout, stderr) => {
                if (error || stderr) {
                    resolve(null);
                } else {
                    resolve(this.parseDevices(stdout));
                }
            });
        });
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
