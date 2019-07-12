import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import * as md5 from 'js-md5';
import { FileService } from '../../core/file.service';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private fileService: FileService
    ) {
        // 若存储库为空，则插入默认值
        this.userRepository.count().then((value) => {
            if (value <= 0) {
                // this.addUser('admin', md5('robot'), true);
                this.userRepository.insert(new User('admin', md5('admin'), true));
            }
        });
    }

    async addUser(name: string, password: string, isAdmin: boolean) {
        const user = await this.findOne(name);
        if (user) {
            return '用户已存在';
        } else {
            this.userRepository.save(new User(name, md5(password), isAdmin));   //保存用户信息到数据库
            return this.fileService.mkUserDirs(name);  // 创建用户目录
        }
    }

    async updateUser(name: string, password: string, isAdmin: boolean) {
        const user = await this.findOne(name);
        if (!user) {
            return '不存在该用户';
        } else {
            user.isAdmin = isAdmin;
            if (password) {
                user.password = md5(password);
            }
            this.userRepository.save(user);
            return null;
        }
    }

    async deleteUser(name: string) {
        this.fileService.removeUserDirs(name);
        return this.userRepository.delete({ name: name });
    }

    async checkAdmin(userName: string): Promise<boolean> {
        const user = await this.userRepository.findOne({ where: { name: userName } });
        if (user) {
            return user.isAdmin;
        } else {
            return false;
        }
    }

    async getAllUsers(): Promise<User[]> {
        return this.userRepository.find({});
    }

    async validUser(name: string, password: string): Promise<string> {
        const user = await this.userRepository.findOne({ where: { name: name, password: md5(password) } });
        if (user) {
            return this.sign(user);
        } else {
            return '';
        }
    }

    async findOneByToken(token: string): Promise<any> {
        const name = this.unsign(token);
        return this.findOne(name);
    }

    private findOne(name: string): Promise<User> {
        return this.userRepository.findOne({ where: { name: name } });
    }

    private sign(user: User): string {
        return user.name;
    }

    private unsign(token: string): string {
        return token;
    }

}