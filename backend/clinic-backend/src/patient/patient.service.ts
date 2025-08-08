import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './patient.entity';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
  ) {}

  create(patient: Partial<Patient>) {
    const newPatient = this.patientRepository.create(patient);
    return this.patientRepository.save(newPatient);
  }

  findAll() {
    return this.patientRepository.find();
  }

  findOne(id: number) {
    return this.patientRepository.findOneBy({ id });
  }

  update(id: number, updateData: Partial<Patient>) {
    return this.patientRepository.update(id, updateData);
  }

  delete(id: number) {
    return this.patientRepository.delete(id);
  }
}