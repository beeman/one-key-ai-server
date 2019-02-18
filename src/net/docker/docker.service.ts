import { Injectable, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ProcessService } from '../../core/process/process.service';
import { spawn, ChildProcess } from 'child_process';
import { ProcessResultType } from '../../core/process/process-result-type';

@Injectable()
export class DockerService {

    private readonly tag = DockerService.name;
    private shellProcess: ChildProcess = null;

    constructor(private readonly processService: ProcessService) { }

    public getDockerImages(): Observable<ProcessResultType> {
        return this.processService.executeWithCheck('docker', ['images']);
    }

    public installDockerCE(): Observable<ProcessResultType> {
        return null;
    }

    public runDocker(params) {
        this.shellProcess = spawn(`docker`, [`run`, '-i', '--runtime=nvidia', `${params}`, 'bash']);
        this.shellProcess.stdin.write('ls');
        return this.processService.execute(this.shellProcess);
    }
}
