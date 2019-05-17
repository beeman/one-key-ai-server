import { Controller, Post, Body } from '@nestjs/common';
import { TerminalManager } from './terminal-manager.service';

@Controller('terminals')
export class TerminalsController {
    private terminalManager: TerminalManager = new TerminalManager();

    constructor() {
        this.terminalManager.createServer();
    }

    @Post()
    create(@Body() body) {
        const cols = parseInt(body.cols, 10);
        const rows = parseInt(body.rows, 10);

        return { processId: this.terminalManager.createTerminal(rows, cols) };
    }
}
