import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Queue } from './queue.entity';
import { MoreThan } from 'typeorm';

@Injectable()
export class QueueService {
  constructor(
    @InjectRepository(Queue)
    private queueRepository: Repository<Queue>,
  ) {}

  async addToQueue(queueEntry: Partial<Queue>) {
    const lastPosition = await this.queueRepository
      .createQueryBuilder('queue')
      .select('MAX(queue.position)', 'max')
      .getRawOne();

    const position = (lastPosition.max || 0) + 1;
    const newEntry = this.queueRepository.create({ ...queueEntry, position });
    return this.queueRepository.save(newEntry);
  }

  findAll() {
    return this.queueRepository.find({ order: { position: 'ASC' } });
  }

  async updateStatus(id: number, newStatus: string) {
    const patient = await this.queueRepository.findOne({ where: { id } });
    if (!patient) return;

    const currentStatus = patient.status;
    const currentPosition = patient.position;

    // Case 1: Moving Waiting → In Consultation
    if (currentStatus === 'Waiting' && newStatus === 'In Consultation') {
      patient.status = newStatus;
      patient.position = 0; // Show as "being attended"
      await this.queueRepository.save(patient);

      // Shift everyone behind forward
      await this.shiftQueuePositions(currentPosition);
      return { message: 'Moved to consultation, queue updated' };
    }

    // Case 2: Moving In Consultation → Completed
    if (currentStatus === 'In Consultation' && newStatus === 'Completed') {
      patient.status = newStatus;
      await this.queueRepository.save(patient);

      // Automatically assign next waiting patient to "In Consultation"
      const nextPatient = await this.queueRepository.findOne({
        where: { position: 1, status: 'Waiting' },
      });

      if (nextPatient) {
        nextPatient.status = 'In Consultation';
        nextPatient.position = 0;
        await this.queueRepository.save(nextPatient);

        // Shift rest forward
        await this.shiftQueuePositions(1);
      }

      return { message: 'Completed and moved next patient in' };
    }

    // Default: Just update status
    patient.status = newStatus;
    await this.queueRepository.save(patient);
    return { message: 'Status updated' };
  }

  private async shiftQueuePositions(startFrom: number) {
    const behind = await this.queueRepository.find({
      where: {
        position: MoreThan(startFrom),
        status: 'Waiting',
      },
      order: { position: 'ASC' },
    });

    for (const person of behind) {
      person.position -= 1;
      await this.queueRepository.save(person);
    }
  }

  async remove(id: number) {
    // Step 1: Get the entry that is being deleted
    const toDelete = await this.queueRepository.findOne({ where: { id } });

    if (!toDelete) return;

    const deletedPosition = toDelete.position;

    // Step 2: Delete the entry
    await this.queueRepository.delete(id);

    // Step 3: Find all entries behind the deleted one
    const behindEntries = await this.queueRepository.find({
      where: { position: MoreThan(deletedPosition) },
      order: { position: 'ASC' },
    });

    // Step 4: Shift their positions up by 1
    for (const entry of behindEntries) {
      entry.position -= 1;
      await this.queueRepository.save(entry);
    }
  }

  clearAll() {
    return this.queueRepository.clear();
  }
}
