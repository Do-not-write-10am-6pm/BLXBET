import { Module } from '@nestjs/common';
import { LimitedsService } from './limiteds.service';
import { LimitedsController } from './limiteds.controller';
import { Limited } from './entity/limited.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BotsModule } from 'src/bots/bots.module';

@Module({
  imports: [TypeOrmModule.forFeature([Limited]), BotsModule],
  controllers: [LimitedsController],
  providers: [LimitedsService],
  exports: [LimitedsService],
})
export class LimitedsModule {}
