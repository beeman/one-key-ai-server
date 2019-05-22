import { Controller, Post, Logger, UploadedFiles, Body, HttpException, HttpStatus, UseInterceptors, FilesInterceptor, FileInterceptor, UploadedFile } from '@nestjs/common';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { FileService } from 'src/core/file.service';
import { async } from 'rxjs/internal/scheduler/async';

@Controller('file')
export class FileController {
    constructor(private readonly fileService: FileService) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async upload(@UploadedFile() file, @Body() body) {
        if (!body.webkitRelativePath || !body.userName || file.length === 0) {
            throw new HttpException('请求参数错误.', HttpStatus.FORBIDDEN)
        }

        try {
            await this.fileService.saveProject(body.userName, body.webkitRelativePath, file);
            return { msg: 'ok', data: file.originalname };
        } catch (err) {
            return { msg: 'error', data: err };
        }
    }

}
