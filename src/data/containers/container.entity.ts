import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn } from "typeorm";

@Entity()
export class Container {
    constructor(containerId: string, user: string) {
        this.containerId = containerId;
        this.user = user;
    }

    @PrimaryColumn({ length: 255 })
    containerId: string;

    @Column({ length: 255 })
    user: string;
}