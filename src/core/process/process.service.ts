import { Injectable, Logger } from '@nestjs/common';
import { Observable, fromEvent } from 'rxjs';
import { ChildProcess } from 'child_process';

@Injectable()
export class ProcessService {

    private readonly tag = ProcessService.name;

    public execute(process: ChildProcess): Observable<any> {
        return new Observable(observer => {
            process.stdout.on('data', (value) => {
                observer.next({ type: 'stdout', message: '' + value });
            });
            process.stderr.on('data', (value) => {
                observer.next({ type: 'stderr', message: '' + value });
                observer.complete();
                process.kill();
                Logger.error('stderr: ' + value, this.tag);
            });
            process.on('exit', (code: number, signal: string) => {
                observer.next({ type: 'exit', code: code, message: signal });
                observer.complete();
            });
        });

    }
}
