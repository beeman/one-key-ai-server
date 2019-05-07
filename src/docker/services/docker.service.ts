import { Injectable } from '@nestjs/common';
import * as Docker from 'dockerode';


@Injectable()
export class DockerService {
    private docker: Docker = null;

    constructor() {
        this.docker = new Docker();
    }

    public getDocker(): Docker {
        return this.docker;
    }
}
