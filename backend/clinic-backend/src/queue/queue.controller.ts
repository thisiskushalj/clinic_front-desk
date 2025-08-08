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
  findAll() {
    return this.queueService.findAll();
  }

  @Put(':id')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.queueService.updateStatus(+id, status);
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
