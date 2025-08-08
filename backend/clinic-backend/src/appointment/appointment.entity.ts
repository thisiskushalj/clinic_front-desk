import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  patientName: string;

  @Column()
  doctorName: string;

  @Column()
  date: string; // format: YYYY-MM-DD

  @Column()
  time: string; // format: HH:MM

  @Column({ default: 'Scheduled' })
  status: string; // Scheduled / Completed / Cancelled
}