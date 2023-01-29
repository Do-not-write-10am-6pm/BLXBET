import { Module } from '@nestjs/common';
import { CoinflipService } from './coinflip.service';
import { CoinflipGateway } from './coinflip.gateway';
import { UsersModule } from 'src/users/users.module';
import { GamesModule } from 'src/games/games.module';

@Module({
  imports: [GamesModule, UsersModule],
  providers: [CoinflipGateway, CoinflipService],
})
export class CoinflipModule {}
