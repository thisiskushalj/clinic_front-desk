import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { QueueService } from './queue.service';
import { Queue } from './queue.entity';

@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post()
  addToQueue(@Body() queueEntry: Partial<Queue>) {
    return this.queueService.addToQueue(queueEntry);
  }

  @Get()
  async findAll() {
    const queue = await this.queueService.findAll();
    return queue ?? []; // return [] if null or undefined
  }

  @Put(':id')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; position?: number },
  ) {
    return this.queueService.updateStatus(+id, body.status);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.queueService.remove(+id);
  }

  @Delete()
  clearAll() {
    return this.queueService.clearAll();
  }
}
