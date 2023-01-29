import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coinflip } from './entities/coinflip.entity';
import { LimitedsModule } from 'src/limiteds/limiteds.module';

@Module({
  imports: [TypeOrmModule.forFeature([Coinflip]), LimitedsModule],
  controllers: [GamesController],
  providers: [GamesService],
  exports: [GamesService],
})
export class GamesModule {}
