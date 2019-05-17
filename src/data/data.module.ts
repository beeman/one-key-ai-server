import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Container } from './containers/container.entity';
import { ContainersDataService } from './containers/containers.service';
import { User } from './users/user.entity';
import { UsersService } from './users/users.service';
import { UsersController } from './users/users.controller';

@Module({
    imports: [TypeOrmModule.forFeature([User, Container])],
    providers: [UsersService, ContainersDataService],
    exports: [UsersService, ContainersDataService],
    controllers: [UsersController]
})
export class DataModule { }
