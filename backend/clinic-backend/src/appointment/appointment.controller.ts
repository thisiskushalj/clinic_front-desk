import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { Appointment } from './appointment.entity';

@Controller('appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  create(@Body() appointment: Partial<Appointment>) {
    return this.appointmentService.create(appointment);
  }

  @Get()
  findAll() {
    return this.appointmentService.findAll();
  }

  // 🔥 Moved this up
  @Get('search')
  searchAppointments(
    @Query('doctorName') doctorName: string,
    @Query('date') date: string,
  ) {
    return this.appointmentService.search(doctorName, date);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      throw new BadRequestException('Invalid appointment ID');
    }
    return this.appointmentService.findOne(numericId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateData: Partial<Appointment>) {
    return this.appointmentService.update(+id, updateData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentService.delete(+id);
  }
}