import { OneToOne, Column, Entity, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from "typeorm";
import { Person } from '../../person/entities/person.entity';
import { Role } from '../../rol/entities/role.entity';

@Entity('user')
export class User {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @OneToOne(() => Person, (person) => person.user)
    @JoinColumn({
        name: 'person_id',
    })
    person!: Person;

    @Column({
        name: 'institutional_email',
        type: 'varchar',
        length: 255,
        unique: true,
    })
    institutionalEmail!: string;

    @Column({
        type: 'varchar',
        length: 255,
    })
    password!: string;

    @Column({
        type: 'boolean',
        default: true,
    })
    isActive!: boolean;

    @ManyToOne(() => Role, (role) => role.users)
    @JoinColumn({
        name: 'role_id',
    })
    role!: Role;
}