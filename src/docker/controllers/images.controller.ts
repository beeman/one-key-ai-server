import { Controller, Get, Logger, Response, HttpStatus, Body, Post } from '@nestjs/common';
import { DockerService } from '../services/docker.service';
import * as Docker from 'dockerode';
import { FileService } from '../../core/file.service';
import { ConfigService } from '../../core/config.service';

@Controller('images')
export class ImagesController {
    private docker: Docker = null;

    constructor(
        private readonly dockerService: DockerService,
        private readonly fileService: FileService,
        private readonly configService: ConfigService
    ) {
        this.docker = this.dockerService.getDocker();
    }

    @Get('info')
    info(@Response() res) {
        this.docker.listImages((err, images) => {
            if (!err) {
                res.json({ msg: 'ok', data: images });
            } else {
                res.json({ msg: 'err', data: err });
            }
        });
    }

    @Post('remove')
    remove(@Response() res, @Body() body) {
        const image = this.docker.getImage(body['id']);
        image.remove((err, removeInfo) => {
            if (err) {
                res.json(err);
            } else {
                res.json(HttpStatus.OK);
            }
        });
    }

    @Post('create-container')
    createContainer(@Response() res, @Body() body) {
        const name: string = body['name'];
        const isNvidia: boolean = body['isNvidia'];
        const runtime = isNvidia ? 'nvidia' : null;
        const userName = name.split('--')[0];
        const containerName = name.split('--')[1];
        const exposedPorts = {};
        body['ports'].forEach((value: number) => {
            if (value !== null) {
                exposedPorts[`${value}/tcp`] = {};
            }
        });
        if (!userName || !containerName) {
            res.json({ statusCode: HttpStatus.FORBIDDEN, reason: '容器名错误' });
            return;
        }
        const volume = this.fileService.userDirsPath(userName);
        const targetPath = `/home/${userName}`;
        // const volumes = {};
        // volumes[targetPath] = {};

        const options: Docker.ContainerCreateOptions = {
            Image: body['id'],
            Hostname: containerName,
            AttachStdin: false,
            AttachStdout: false,
            AttachStderr: false,
            ExposedPorts: exposedPorts,
            // WorkingDir: targetPath,
            // Env:['NVIDIA_VISIBLE_DEVICES=0'],
            // Volumes: volumes,
            Tty: true,
            HostConfig: {
                PublishAllPorts: true,
                Binds: [`${volume}:${targetPath}`],
                Runtime: runtime,
                Memory: this.configService.getDockerMemoryLimit(),
                MemorySwap: this.configService.getDockerMemorySwap()
            },
        };
        if (body['name']) {
            options.name = body['name'];
        }

        this.docker.createContainer(options, (err, container) => {
            if (err) {
                res.json({ statusCode: err.statusCode, reason: err.reason, json: err.json });
            } else {
                res.json({ statusCode: HttpStatus.OK, containerId: container.id });
            }
        });
    }

    @Post('search')
    search(@Response() res, @Body() body) {
        const name = body['name'];
        this.docker.searchImages({ term: name }, (err, data) => {
            if (err) {
                res.json({ msg: 'error', data: err });
            } else {
                res.json({ msg: 'ok', data: data });
            }
        });
    }
}
