import { Controller, Get, Response, HttpStatus, Logger, Post, Body } from '@nestjs/common';
import { DockerService } from '../services/docker.service';
import * as Docker from 'dockerode';
import { UsersService } from '../../data/users/users.service';
import { DockerTerminalService } from '../services/docker-terminal.service';

@Controller('containers')
export class ContainersController {
    private docker: Docker = null;

    constructor(
        private readonly dockerService: DockerService,
        private readonly userService: UsersService,
        private readonly dockerTerminalService: DockerTerminalService
    ) {
        this.docker = this.dockerService.getDocker();
    }

    @Post('host-config-binds')
    async configVolumes(@Response() res, @Body() body) {
        this.docker.getContainer(body['id']).inspect((err, info: Docker.ContainerInspectInfo) => {
            if (err) {
                res.json({ msg: 'err', data: err });
            } else {
                res.json({ msg: 'ok', data: info.HostConfig.Binds });
            }
        });
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

                res.json({ msg: 'ok', data: result });
                // res.status(HttpStatus.OK).json(result);
            } else {
                res.json({ msg: 'err', data: err });
            }
        });
    }

    @Post('inspect')
    async inspect(@Response() res, @Body() body) {
        this.docker.getContainer(body['id']).inspect((err, info: Docker.ContainerInspectInfo) => {
            if (err) {
                res.json({ msg: 'err', data: err });
            } else {
                res.json({ msg: 'ok', data: info });
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
        this.docker.getContainer(body['id']).rename({ name: body['userName'] + '--' + body['name'] }, (err) => {
            if (err) {
                res.json(err);
            } else {
                res.json(HttpStatus.OK);
            }
        })
    }

    @Post('shell-length')
    async shellLength(@Response() res, @Body() body) {
        if (body['id']) {
            res.json({ msg: 'ok', data: this.dockerTerminalService.shellLength(body['id']) });
        } else {
            res.json(HttpStatus.BAD_REQUEST);
        }
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
