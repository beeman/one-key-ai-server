import { Controller, Post, Body, Logger, Response } from '@nestjs/common';
import { UsersService } from '../data/users/users.service';
import { async } from 'rxjs/internal/scheduler/async';
import { repeat } from 'rxjs/operators';

@Controller('auth')
export class AuthController {
    constructor(private readonly usersService: UsersService) { }

    @Post('login')
    async login(@Body() body) {
        const token = await this.usersService.validUser(body['userName'], body['password']);
        if (token) {
            return { msg: 'ok', token: token };
        } else {
            return { msg: '用户或密码错误' };
        }
    }

    @Post('check-admin')
    async checkAdmin(@Body() body) {
        return this.usersService.checkAdmin(body['userName']);
    }
}
