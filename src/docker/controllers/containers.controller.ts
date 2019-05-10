import { Controller, Get, Response, HttpStatus, Logger, Post, Body } from '@nestjs/common';
import { DockerService } from 'src/docker/services/docker.service';
import * as Docker from 'dockerode';
import { rename } from 'fs';

@Controller('containers')
export class ContainersController {
    private docker: Docker = null;

    constructor(private readonly dockerService: DockerService) {
        this.docker = this.dockerService.getDocker();
    }

    @Get('info')
    info(@Response() res) {
        this.docker.listContainers({ all: true, size: true }, (err, containers: Docker.ContainerInfo[]) => {
            if (!err) {
                res.status(HttpStatus.OK).json(containers);
            } else {
                res.json(err);
            }
        });
    }

    @Post('stop')
    stop(@Response() res, @Body() body) {
        this.docker.getContainer(body['id']).stop((err) => {
            if (err) {
                res.json(err);
            } else {
                res.json(HttpStatus.OK);
            }
        })
    }

    @Post('kill')
    kill(@Response() res, @Body() body) {
        this.docker.getContainer(body['id']).kill((err) => {
            if (err) {
                res.json(err);
            } else {
                res.json(HttpStatus.OK);
            }
        })
    }

    @Post('start')
    start(@Response() res, @Body() body) {
        const container = this.docker.getContainer(body['id']);
        container.start((err) => {
            if (err) {
                res.json(err);
            } else {
                res.json(HttpStatus.OK);
            }
        });
    }

    @Post('restart')
    restart(@Response() res, @Body() body) {
        this.docker.getContainer(body['id']).restart((err) => {
            if (err) {
                res.json(err);
            } else {
                res.json(HttpStatus.OK);
            }
        })
    }

    @Post('remove')
    remove(@Response() res, @Body() body) {
        this.docker.getContainer(body['id']).remove((err) => {
            if (err) {
                res.json(err);
            } else {
                res.json(HttpStatus.OK);
            }
        })
    }

    @Post('rename')
    rename(@Response() res, @Body() body) {
        this.docker.getContainer(body['id']).rename({ name: body['name'] }, (err) => {
            if (err) {
                res.json(err);
            } else {
                res.json(HttpStatus.OK);
            }
        })
    }
}
