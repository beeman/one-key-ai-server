import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ConfigService {
    private config: any;

    constructor() {
        const data = fs.readFileSync(path.join(__dirname, '../assets/config.json'));
        this.config = JSON.parse(data.toString());
    }

    public getDockerMemoryLimit(): number {
        return this.config.docker['memory-limit'];
    }

    public getDockerMemorySwap(): number {
        return this.config.docker['memory-swap'];
    }
}
