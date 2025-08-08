import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Queue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  patientName: string;

  @Column()
  doctorName: string;

  @Column()
  position: number;

  @Column({ default: 'Waiting' })
  status: string; // Waiting, In Consultation, Completed
}