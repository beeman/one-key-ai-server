import { Injectable, Logger } from '@nestjs/common';
import { Container } from './container.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ContainersDataService {
    constructor(
        @InjectRepository(Container)
        private readonly containerRepository: Repository<Container>
    ) { }

    async save(containerId: string, user: string) {
        return this.containerRepository.save(new Container(containerId, user));
    }

    async remove(containerId: string, user: string) {
        return this.containerRepository.remove(new Container(containerId, user));
    }
}
