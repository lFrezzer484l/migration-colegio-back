import { ManyToMany, ManyToOne, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, JoinColumn, OneToOne } from "typeorm";
import { DocumentType } from '../../document-type/entities/document-type.entity';
import { User } from "src/user/entities/user.entity";

@Entity('person')
export class Person {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({
        name: 'document_number',
        type: 'varchar',
        unique: true,
        length: 20,
    })
    documentNumber!: string;

    @ManyToOne(() => DocumentType, (documentType) => documentType.people, {
        nullable: false
    })
    @JoinColumn({
        name: 'document_type_id',
    })
    documentType!: DocumentType;

    @OneToOne(() => User, (user) => user.person)
    user!: User;

    @Column({
        name: 'first_name',
        type: 'varchar',
        length: 100,
    })
    firstName!: string;

    @Column({
        name: 'last_name',
        type: 'varchar',
        length: 100,
    })
    lastName!: string;

    @Column({
        name: 'personal_email',
        type: 'varchar',
        length: 100,
        unique: true,
    })
    personalEmail!: string;

    @Column({
        type: 'varchar',
        length: 20,
    })
    phone!: string;

    @Column({
        name: 'birth_date',
        type: 'date',
    })
    birthDate!: Date;

    @CreateDateColumn({
        name: 'created_at',
        type: 'date',
    })
    createdAt!: Date;

    @UpdateDateColumn({
        name: 'updated_at',
        type: 'date',
    })
    updatedAt!: Date;
}