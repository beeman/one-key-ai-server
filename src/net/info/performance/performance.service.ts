import { Injectable } from '@nestjs/common';
import { spawn, ChildProcess } from 'child_process';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { ProcessService } from '../../../core/process/process.service';

@Injectable()
export class PerformanceService {
    private readonly tag = PerformanceService.name;
    private process: ChildProcess = null;
    private message$: Observable<any> = null;

    constructor(private readonly processService: ProcessService) { }

    public getData(): Observable<any> {
        if (!this.process) {
            this.openProcess();
        }
        return this.message$;
    }

    public stopGetData(): void {
        this.closePorcess();
    }

    private closePorcess(): void {
        if (this.process) {
            this.process.kill();
            this.process = null;
        }
    }

    private openProcess(): void {
        this.closePorcess();
        this.process = spawn('top', ['-p 0', '-b', '-d 1', '-i']);

        this.message$ = this.processService.execute(this.process).pipe(
            map((value) => {
                if (value.type === 'stdout') {
                    value.value = this.parseMessage(value.value);
                    return value;
                }
                return value;
            }),
            filter((value) => {
                return value.type !== 'stdout' || (value.type === 'stdout' && value.value !== null);
            }),
        );
    }

    private parseMessage(data: string): {} {
        if (!data.startsWith('\n\n')) {
            return null;
        }
        const lines = data.trim().split('\n');
        const result = {
            top: this.parseTop(lines[0]),
            cpu: this.parseLine(lines[2]),
            mem: this.parseLine(lines[3], new RegExp('[,.]')),    // 数值可能被','或'.'分隔开
            swap: this.parseLine(lines[4], new RegExp('[,.]')),
        };

        return JSON.stringify(result);
    }

    private parseLine(data: string, separator: string | RegExp = ','): {} {
        const values = data.split(':')[1].split(separator);
        const result = {};
        values.forEach(element => {
            element = element.trim();
            const elementValues = element.split(' ');
            result[element.substr(elementValues[0].length).trim()] = elementValues[0].trim();
        });
        return result;
    }

    private parseTop(data: string): {} {
        const values = data.split(' ');
        const t = values[2];
        return { time: t };
    }
}
