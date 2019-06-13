import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';

@Injectable()
export class ProcessService {
    public existCommand(command: string): Promise<boolean> {
        const process = spawn('which', [command]);

        return new Promise((resolve, reject) => {
            process.stdout.on('data', (data) => {
                process.kill();
                resolve(true);
            });
            process.stderr.on('data', () => {
                process.kill();
                resolve(false);
            });
            process.on('error', () => {
                process.kill();
                resolve(false);
            });
            process.on('exit', () => {
                process.kill();
                resolve(false);
            });
        });
    }
}
