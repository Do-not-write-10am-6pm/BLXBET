import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bot } from './entity/bot.entity';

@Injectable()
export class BotsService {
  constructor(@InjectRepository(Bot) private botRepository: Repository<Bot>) {}
}
