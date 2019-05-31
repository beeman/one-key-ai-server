import { Injectable, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ChildProcess, spawn, SpawnOptions } from 'child_process';
import { ProcessResultType } from './process-result-type';

@Injectable()
export class ProcessService {

    private readonly tag = ProcessService.name;

    public executeWithCheck(command: string, args?: ReadonlyArray<string>, options?: SpawnOptions): Observable<ProcessResultType> {
        return new Observable(observer => {
            this.existCommand(command).then(value => {
                if (!value) {
                    observer.next({ type: 'not exist', value: command });
                    observer.complete();
                } else {
                    this.execute(spawn(command, args, options)).subscribe(v => {
                        observer.next(v);
                    }, error => {
                        observer.error(error);
                    }, () => {
                        observer.complete();
                    });
                }
            });
        });
    }

    public execute(process: ChildProcess): Observable<ProcessResultType> {
        return new Observable(observer => {
            process.stdout.on('data', (value) => {
                observer.next({ type: 'stdout', value: '' + value });
            });
            process.stderr.on('data', (value) => {
                observer.next({ type: 'stderr', value: '' + value });
                observer.complete();
                process.kill();
                Logger.error('stderr: ' + value, this.tag);
            });
            process.on('exit', (c: number, s: string) => {
                observer.next({ type: 'exit', value: { code: c, signal: s } });
                observer.complete();
            });
        });
    }

    // private existCommand(command: string): Observable<boolean> {
    //     const process = spawn('which', [command]);

    //     return new Observable(observer => {
    //         this.execute(process).subscribe(
    //             value => {
    //                 if (value.type === 'stdout') {
    //                     observer.next(true);
    //                 } else {
    //                     observer.next(false);
    //                 }
    //                 observer.complete();
    //             },
    //         );
    //     });
    // }

    public existCommand(command: string): Promise<boolean> {
        const process = spawn('which', [command]);

        return new Promise((resolve, reject) => {
            process.stdout.on('data', () => {
                process.kill();
                resolve(true);
            });
            process.stderr.on('data', () => {
                process.kill();
                resolve(false);
            });
        });
    }
}
