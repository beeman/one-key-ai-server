import { Controller, Post, Body, HttpException, HttpStatus, UseInterceptors, FileInterceptor, UploadedFile, Response } from '@nestjs/common';
import { FileService } from '../../core/file.service';
import * as path from 'path';
import { async } from 'rxjs/internal/scheduler/async';

@Controller('file')
export class FileController {
    constructor(private readonly fileService: FileService) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async upload(@UploadedFile() file, @Body() body) {
        console.log(file);
        console.log(body);
        if (file.length === 0 || (!body.userName && (!body.dirPath || !body.fileName))) {
            throw new HttpException('请求参数错误.', HttpStatus.FORBIDDEN)
        }

        try {
            if (body.dirPath && body.fileName) {
                if (body.webkitRelativePath) {
                    this.fileService.saveAbsoluteFile(path.join(body.dirPath, body.webkitRelativePath), file);
                } else {
                    this.fileService.saveAbsoluteFile(path.join(body.dirPath, body.fileName), file);
                }
            } else if (body.userName && body.webkitRelativePath) {
                this.fileService.saveFile(body.userName, body.webkitRelativePath, file);
            }
            return { msg: 'ok', data: file.originalname };
        } catch (err) {
            return { msg: 'error', data: err };
        }
    }

    @Post('list-recursive')
    async listRecursive(@Response() rep, @Body() body) {
        try {
            const files = this.fileService.readFilesRecursive(body.path)
            rep.json({ msg: 'ok', data: files });
        } catch (err) {
            rep.json({ msg: 'err', data: err });

        }
    }

    @Post('list')
    async list(@Response() rep, @Body() body) {
        try {
            const files = this.fileService.readFiles(body.path)
            rep.json({ msg: 'ok', data: files });
        } catch (err) {
            rep.json({ msg: 'err', data: err });
        }
    }

    @Post('projects-recursive')
    async projectsRecursive(@Response() rep, @Body() body) {
        try {
            const value = this.fileService.readUserProjectRecursive(body.userName)
            rep.json({ msg: 'ok', data: value });

        } catch (err) {
            rep.json({ msg: 'err', data: err });

        }
    }

    @Post('projects')
    async projects(@Response() rep, @Body() body) {
        try {
            const files = this.fileService.readUserProjects(body.userName)
            rep.json({ msg: 'ok', data: files });
        } catch (err) {
            rep.json({ msg: 'err', data: err });
        }
    }

    @Post('remove-file')
    async removeFile(@Response() rep, @Body() body) {
        try {
            this.fileService.removeFile(body.path);
            rep.json({ msg: 'ok' });
        } catch (err) {
            rep.json({ msg: 'err', data: err });
        }
    }

    @Post('remove-dir')
    async removeDir(@Response() rep, @Body() body) {
        try {
            this.fileService.removeDir(body.path);
            rep.json({ msg: 'ok' });
        } catch (err) {
            rep.json({ msg: 'err', data: err });
        }
    }
}
