import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { UsersService } from './users/users.service';
import { UsersController } from './users/users.controller';
import { CoreModule } from '../core/core.module';

@Module({
    imports: [CoreModule, TypeOrmModule.forFeature([User])],
    providers: [UsersService],
    exports: [UsersService],
    controllers: [UsersController]
})
export class DataModule { }
