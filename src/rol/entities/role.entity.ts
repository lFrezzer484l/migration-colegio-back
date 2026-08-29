import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { User } from "src/user/entities/user.entity";

@Entity('role')
export class Role {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({
        type: 'varchar',
        length: 50,
        unique: true
    })
    name!: string

    @OneToMany(() => User, (user) => user.role)
    users!: User[];

}