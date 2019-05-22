import { Controller, Get, Response, HttpStatus, Logger, Post, Body } from '@nestjs/common';
import { DockerService } from '../services/docker.service';
import * as Docker from 'dockerode';
import { UsersService } from '../../data/users/users.service';

@Controller('containers')
export class ContainersController {
    private docker: Docker = null;

    constructor(
        private readonly dockerService: DockerService,
        private readonly userService: UsersService,
    ) {
        this.docker = this.dockerService.getDocker();
    }

    @Post('info')
    async info(@Response() res, @Body() body) {
        const userName = body['userName'];
        const isAdmin = await this.userService.checkAdmin(userName);

        this.docker.listContainers({ all: true, size: true }, (err, containers: Docker.ContainerInfo[]) => {
            if (!err) {
                let result: Docker.ContainerInfo[] = [];

                if (isAdmin) {
                    result = containers;
                } else {
                    containers.forEach(container => {
                        if (container.Names[0] && container.Names[0].startsWith('/' + userName + '--')) {
                            result.push(container);
                        }
                    });
                }

                res.status(HttpStatus.OK).json(result);
            } else {
                res.json(err);
            }
        });
    }

    @Post('stop')
    async stop(@Response() res, @Body() body) {
        this.docker.getContainer(body['id']).stop((err) => {
            if (err) {
                res.json(err);
            } else {
                res.json(HttpStatus.OK);
            }
        })
    }

    @Post('kill')
    async kill(@Response() res, @Body() body) {
        this.docker.getContainer(body['id']).kill((err) => {
            if (err) {
                res.json(err);
            } else {
                res.json(HttpStatus.OK);
            }
        })
    }

    @Post('start')
    async start(@Response() res, @Body() body) {
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
    async restart(@Response() res, @Body() body) {
        this.docker.getContainer(body['id']).restart((err) => {
            if (err) {
                res.json(err);
            } else {
                res.json(HttpStatus.OK);
            }
        })
    }

    @Post('remove')
    async remove(@Response() res, @Body() body) {
        this.docker.getContainer(body['id']).remove((err) => {
            if (err) {
                res.json(err);
            } else {
                res.json(HttpStatus.OK);
            }
        })
    }

    @Post('rename')
    async rename(@Response() res, @Body() body) {
        this.docker.getContainer(body['id']).rename({ name: body['name'] }, (err) => {
            if (err) {
                res.json(err);
            } else {
                res.json(HttpStatus.OK);
            }
        })
    }

    // @Post('save-data')
    // async saveData(@Body() body) {
    //     this.containersDataService.save(body.id, body.user);
    // }

    // @Post('remove-data')
    // async removeData(@Body() body) {
    //     this.containersDataService.remove(body.id, body.user);
    // }
}
