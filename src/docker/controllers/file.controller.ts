import { Controller, Post, Body, HttpException, HttpStatus, UseInterceptors, FileInterceptor, UploadedFile, Response } from '@nestjs/common';
import { FileService } from 'src/core/file.service';

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

    @Post('list')
    async list(@Response() rep, @Body() body) {
        this.fileService.readUserProject(body.userName)
            .then(value => {
                rep.json({ msg: 'ok', data: value });
            })
            .catch(reason => {
                rep.json({ msg: 'err', data: reason });
            });
    }

}
