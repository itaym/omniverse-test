import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm'

@Entity()
export class Todo {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string

    @Index()
    @Column({ nullable: true })
    after: number

    @Index()
    @Column({ nullable: true })
    before: number

    @Index()
    @Column({ nullable: true })
    order: number
}