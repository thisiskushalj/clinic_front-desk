import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from './doctor.entity';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
  ) {}

  create(doctor: Partial<Doctor>) {
    const newDoctor = this.doctorRepository.create(doctor);
    return this.doctorRepository.save(newDoctor);
  }

  findAll() {
    return this.doctorRepository.find();
  }

  findOne(id: number) {
    return this.doctorRepository.findOne({ where: { id } });
  }

  update(id: number, updateData: Partial<Doctor>) {
    return this.doctorRepository.update(id, updateData);
  }

  delete(id: number) {
    return this.doctorRepository.delete(id);
  }
}