import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './appointment.entity';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,
  ) {}

  create(appointment: Partial<Appointment>) {
    return this.appointmentRepo.save(appointment);
  }

  findAll() {
    return this.appointmentRepo.find({
      // Removed relations: ['doctor'] since no doctor relation exists
      order: { date: 'ASC', time: 'ASC' },
    });
  }

  findOne(id: number) {
    return this.appointmentRepo.findOne({
      where: { id },
      // Removed relations: ['doctor'] since no doctor relation exists
    });
  }

  update(id: number, updateData: Partial<Appointment>) {
    return this.appointmentRepo.update(id, updateData);
  }

  delete(id: number) {
    return this.appointmentRepo.delete(id);
  }

  /**
   * Search appointments by doctor or patient name
   */
  async search(type: string, value: string) {
    const qb = this.appointmentRepo.createQueryBuilder('appointment');

    if (type === 'doctor') {
      qb.where('appointment.doctorName ILIKE :name', { name: `%${value}%` });
    } else if (type === 'patient') {
      qb.where('appointment.patientName ILIKE :name', { name: `%${value}%` });
    } else {
      return [];
    }

    qb.orderBy('appointment.date', 'ASC').addOrderBy('appointment.time', 'ASC');

    return qb.getMany();
  }
}