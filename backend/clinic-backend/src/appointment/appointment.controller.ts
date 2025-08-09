// appointment.controller.ts
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
  NotFoundException,
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

  /**
   * Search Appointments by Doctor or Patient Name
   * Query Params:
   *   type = 'doctor' | 'patient'
   *   value = search term
   */
  @Get('search')
  async searchAppointments(
    @Query('type') type: string,
    @Query('value') value: string,
  ) {
    if (!type || !value) {
      throw new BadRequestException('Search type and value are required');
    }

    if (type !== 'doctor' && type !== 'patient') {
      throw new BadRequestException(
        "Invalid search type. Must be 'doctor' or 'patient'",
      );
    }

    const results = await this.appointmentService.search(type, value);

    if (!results.length) {
      return []; // let frontend handle "No appointments" message
    }

    return results;
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