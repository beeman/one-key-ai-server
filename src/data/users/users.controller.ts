import { Controller, Post, All, Body } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
    ) { }

    @Post('all')
    async all() {
        const users = await this.usersService.getAllUsers();
        const userArray: any[] = [];
        users.forEach(user => {
            userArray.push({ name: user.name, isAdmin: user.isAdmin, id: user.id });
        });

        return { msg: 'ok', data: userArray };
    }

    @Post('add')
    async add(@Body() body) {
        const result = await this.usersService.addUser(body['name'], body['password'], body['isAdmin']);
        if (!result) {
            return { msg: 'ok' };
        } else {
            return { msg: 'error', data: result };
        }
    }

    @Post('update')
    async update(@Body() body) {
        const result = await this.usersService.updateUser(body['name'], body['password'], body['isAdmin']);
        if (!result) {
            return { msg: 'ok' };
        } else {
            return { msg: 'error', data: result };
        }
    }

    @Post('delete')
    async delete(@Body() body) {
        const result = await this.usersService.deleteUser(body['name']);
        return { msg: 'ok' };
    }
}
