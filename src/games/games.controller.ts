import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import async from 'async';
import { CookieGuard } from 'src/auth/cookie.guard';
import { IsNull } from 'typeorm';
import { Bool } from 'types/enums/Bool';
import { Coin } from 'types/enums/Coin';
import { Coinflip } from './entities/coinflip.entity';
import { GamesService } from './games.service';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}
  @UseGuards(CookieGuard)
  @Get('/coinflip/:gameId')
  async getCoinflip(
    @Param('gameId')
    id: string,
  ) {
    return await Coinflip.findOneBy({ id });
  }

  @UseGuards(CookieGuard)
  @Get('/coinflip')
  async getCoinflipHistory() {
    return await Coinflip.find({
      where: [{ result: Bool.true }, { result: Bool.false }],
    });
  }

  @UseGuards(CookieGuard)
  @Get('/stats')
  async getCoinflipStats() {
    const green = (
      await Coinflip.find({
        where: [
          { result: Bool.true, hostBet: Coin.green },
          { result: Bool.false, hostBet: Coin.orange },
        ],
        take: 100,
      })
    )?.length;
    const orange = (
      await Coinflip.find({
        where: [
          { result: Bool.true, hostBet: Coin.orange },
          { result: Bool.false, hostBet: Coin.green },
        ],
        take: 100,
      })
    )?.length;
    const active = (
      await Coinflip.find({
        where: [{ result: IsNull() }],
      })
    )?.map((e) => e.hostLimiteds);
    const getPrice = async (assetIds: number[]) => {
      const fetchu = await (
        await fetch('https://www.rolimons.com/itemapi/itemdetails')
      ).json();
      const prices = assetIds.map((e) => fetchu.items[e][2]);
      return prices.reduce(function (acc, val) {
        return acc + val;
      }, 0);
    };
    const values = await async.map(active, async (e) => {
      return await getPrice(e);
    });
    const value = values.reduce(function (acc, val) {
      return acc + val;
    }, 0);
    return { green, orange, value };
  }
}
