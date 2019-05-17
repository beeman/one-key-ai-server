import { Controller, Get, Logger, Response, HttpStatus, Body, Post } from '@nestjs/common';
import { DockerService } from '../services/docker.service';
import * as Docker from 'dockerode';

@Controller('images')
export class ImagesController {
    private docker: Docker = null;

    constructor(private readonly dockerService: DockerService) {
        this.docker = this.dockerService.getDocker();
    }

    @Get('info')
    info(@Response() res) {
        this.docker.listImages((err, images) => {
            if (!err) {
                res.json(images);
            } else {
                res.json(err);
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
        const options: Docker.ContainerCreateOptions = {
            Image: body['id'],
            AttachStdin: false,
            AttachStdout: false,
            AttachStderr: false,
            Tty: true,
            HostConfig: {
                PortBindings: {},
                PublishAllPorts: true,
                Binds: []
            },
        };
        if (body['name']) {
            options.name = body['name'];
        }

        this.docker.createContainer(options, (err, container) => {
            if (err) {
                res.json(err);
            } else {
                res.json({ statusCode: HttpStatus.OK, containerId: container.id });
            }
        });
    }
}
