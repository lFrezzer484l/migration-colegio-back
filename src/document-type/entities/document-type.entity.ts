import { OneToMany, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Person } from '../../person/entities/person.entity';

@Entity('document_type')
export class DocumentType {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({
        type: 'varchar',
        length: 50,
        unique: true,
    })
    name!: string;

    @Column({
        type: 'varchar',
        length: 5,
        unique: true,
    })
    abbreviation!: string;

    @CreateDateColumn({
        name: 'created_at',
    })
    created_at!: Date;
    
    @UpdateDateColumn({
        name: 'updated_at',
    })
    updatedAt!: Date;

    @OneToMany(() => Person, (person) => person.documentType)
    people!: Person[];
}