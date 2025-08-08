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

    // 🔁 If changing from "Waiting" → "In Consultation"
    if (currentStatus === 'Waiting' && newStatus === 'In Consultation') {
      const currentPosition = patient.position;

      // Update this patient first
      patient.status = newStatus;
      patient.position = 0; // Optional: mark as no longer in queue
      await this.queueRepository.save(patient);

      // Now shift everyone behind up by 1
      const behind = await this.queueRepository.find({
        where: {
          position: MoreThan(currentPosition),
          status: 'Waiting',
        },
        order: { position: 'ASC' },
      });

      for (const person of behind) {
        person.position -= 1;
        await this.queueRepository.save(person);
      }

      return { message: 'Status updated and queue reordered' };
    }

    // If it's just a normal status update (no effect on queue)
    patient.status = newStatus;
    await this.queueRepository.save(patient);
    return { message: 'Status updated' };
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
