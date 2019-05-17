import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class User {
    constructor(name: string, password: string, isAdmin: boolean = false) {
        this.name = name;
        this.password = password;
        this.isAdmin = isAdmin;
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 255 })
    name: string;

    @Column({ length: 255 })
    password: string;

    @Column()
    isAdmin: boolean;
}