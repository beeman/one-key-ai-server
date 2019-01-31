import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import { fromEvent } from 'rxjs';

@Injectable()
export class DriverService {

    private readonly tag = DriverService.name;

    public async autoinstall() {
        const process = spawn('ubuntu-drivers', ['autoinstall']);
        fromEvent(process.stdout, 'data').subscribe((value) => {
            Logger.log('' + value, this.tag);
        });
        fromEvent(process.stderr, 'data').subscribe((value) => {
            Logger.error('' + value, this.tag);
            process.kill();
        });

    }

    public async getList() {
        const process = spawn('ubuntu-drivers', ['list']);
        return new Promise((resolve, reject) => {
            process.stdout.on('data', (data) => {
                resolve(('' + data).trim().split('\n'));
            });
            process.stderr.on('data', (data) => {
                reject('' + data);
                process.kill();
            });
        });
    }

    public async getDevices() {
        const process = spawn('ubuntu-drivers', ['devices']);
        return new Promise((resolve, reject) => {
            process.stdout.on('data', (data) => {
                resolve(this.parseDevices('' + data));
            });
            process.stderr.on('data', (data) => {
                reject('' + data);
                process.kill();
            });
        });
    }

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
