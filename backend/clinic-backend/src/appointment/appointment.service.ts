import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './appointment.entity';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
  ) {}

  create(appointment: Partial<Appointment>) {
    const newAppointment = this.appointmentRepository.create(appointment);
    return this.appointmentRepository.save(newAppointment);
  }

  findAll() {
    return this.appointmentRepository.find();
  }

  findOne(id: number) {
    return this.appointmentRepository.findOneBy({ id });
  }

  update(id: number, updateData: Partial<Appointment>) {
    return this.appointmentRepository.update(id, updateData);
  }

  delete(id: number) {
    return this.appointmentRepository.delete(id);
  }

  async search(doctorName?: string, date?: string): Promise<Appointment[]> {
    const query = this.appointmentRepository.createQueryBuilder('appointment');

    if (doctorName) {
      query.andWhere('appointment.doctorName = :doctorName', { doctorName });
    }

    if (date) {
      query.andWhere('appointment.date = :date', { date });
    }

    return query.getMany();
  }
}
