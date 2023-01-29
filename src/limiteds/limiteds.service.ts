import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  acceptTrade,
  getIdFromUsername,
  getInventory,
  getInventoryById,
  getProductInfo,
  getUAIDs,
  sendTrade,
  setCookie,
} from 'noblox.js';
import async from 'async';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Like, Repository } from 'typeorm';
import { Limited } from './entity/limited.entity';
import { Bot } from 'src/bots/entity/bot.entity';
import { areEqual } from 'src/utils/areEqual';
import { Coinflip } from 'src/games/entities/coinflip.entity';

@Injectable()
export class LimitedsService {
  constructor(
    @InjectRepository(Limited) private limitedRepository: Repository<Limited>,
  ) {}
  async getBlxInventory(id: number) {
    return (await Limited.findBy({ userId: id })).map((e) => {
      return { assetId: e.assetId };
    });
  }
  async getUserInventory(id: number, getProjected = false, assetIds = []) {
    let inventory = assetIds.map((e) => ({ assetId: e }));
    if (assetIds.length === 0) {
      inventory = (await getInventory(
        id,
        [
          'Hat',
          'Face',
          'Gear',
          'HairAccessory',
          'FaceAccessory',
          'NeckAccessory',
          'ShoulderAccessory',
          'FrontAccessory',
          'BackAccessory',
          'WaistAccessory',
        ],
        'Asc',
      )) as any;
    }
    const fetchu = await (
      await fetch('https://www.rolimons.com/itemapi/itemdetails')
    ).json();
    // const checkIfLimited = async (item) => {
    //   try {
    //     const productInfo = await getProductInfo(item.assetId);
    //     return productInfo.IsLimited || productInfo.IsLimitedUnique;
    //   } catch (err) {}
    // };
    // const limiteds = await async.filter([...inventory], checkIfLimited);
    const limiteds = inventory;
    const checkIfProjected = async (item) => {
      const indexes = [];
      const projected = Object.values(fetchu.items).forEach((item, i) => {
        if (item[7] === (getProjected ? 1 : -1)) {
          indexes.push(i);
        } else {
          indexes.push(false);
        }
      });
      const projectedIds = Object.keys(fetchu.items).filter(
        (item, i) => i === indexes[i],
      );
      let check = false;
      projectedIds.forEach((id) => {
        if (item.assetId === parseInt(id)) {
          check = true;
        }
      });
      return check;
    };
    const verifiedLimiteds = await async.filter(limiteds, checkIfProjected);
    if (verifiedLimiteds.length) {
      return verifiedLimiteds;
    } else if (inventory) {
      throw new HttpException(
        {
          status: HttpStatus.TOO_MANY_REQUESTS,
          error: 'Too many requests. Try again in a moment',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return [];
  }

  async deposit(id: number, cookie: string, assetIds: number[]) {
    const getBot = await Bot.findOneBy({ id: Like('%%') });
    const bot = await setCookie(getBot.cookie);
    const projected = await this.getUserInventory(bot.UserID, true);
    if (projected.length === 0) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          error: 'Something went wrong, please try again',
        },
        HttpStatus.CONFLICT,
      );
    }
    // await new Promise((resolve) => setTimeout(resolve, 61000));
    const nonProjected = (await this.getUserInventory(id, false, assetIds)).map(
      (e) => e.assetId,
    );
    console.log(nonProjected.sort(), assetIds.sort());
    if (!areEqual(nonProjected.sort(), assetIds.sort())) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          error: 'Invalid limiteds',
        },
        HttpStatus.CONFLICT,
      );
    }
    const botUIADS = await getUAIDs(bot.UserID, [projected[0].assetId]);
    const userUIADS = await getUAIDs(id, [...assetIds]);
    try {
      const trade = await sendTrade(
        id,
        { userAssetIds: botUIADS.uaids, robux: 0 },
        { userAssetIds: userUIADS.uaids, robux: 0 },
      );
      await setCookie(cookie);
      await acceptTrade(trade.id);
      await async.forEach(assetIds, async (e) => {
        const limited = new Limited();
        limited.userId = id;
        limited.assetId = e;
        const botDB = await Bot.findOneBy({ userId: bot.UserID });
        limited.bot = botDB;
        await Limited.save(limited);
      });
      return { status: 200 };
    } catch (err) {
      console.log(err);
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          error: 'Something went wrong, please try again',
        },
        HttpStatus.CONFLICT,
      );
    }
  }

  async withdraw(id: number, cookie: string, assetIds: number[]) {
    const coinflip = await Coinflip.findOne({
      where: [
        { hostId: id, result: IsNull() },
        { playerId: id, result: IsNull() },
      ],
    });
    if (coinflip) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          error: 'You have a pending game',
        },
        HttpStatus.CONFLICT,
      );
    }
    const getBot = await Bot.findOneBy({ id: Like('%%') });
    const bot = await setCookie(getBot.cookie);
    const projected = await this.getUserInventory(id, true);
    if (projected.length === 0) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          error:
            'You need to have one projected limited in your inventory to withdraw',
        },
        HttpStatus.CONFLICT,
      );
    }
    const actualUsersLimiteds = await async.filter(assetIds, async (e) => {
      if (await Limited.findOneBy({ userId: id, assetId: e })) {
        return true;
      }
      return false;
    });
    console.log(actualUsersLimiteds.length, assetIds.length);
    if (actualUsersLimiteds.length !== assetIds.length) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          error: 'Something went wrong, please try again',
        },
        HttpStatus.CONFLICT,
      );
    }
    const botUIADS = await getUAIDs(bot.UserID, [...assetIds]);
    const userUIADS = await getUAIDs(id, [projected[0].assetId]);
    try {
      const trade = await sendTrade(
        id,
        { userAssetIds: botUIADS.uaids, robux: 0 },
        { userAssetIds: userUIADS.uaids, robux: 0 },
      );
      await setCookie(cookie);
      await acceptTrade(trade.id);
      await async.forEach(assetIds, async (e) => {
        const limited = await Limited.findOneBy({ userId: id, assetId: e });
        limited.remove();
      });
      return { status: 200 };
    } catch (err) {
      console.log(err);
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          error: 'Something went wrong, please try again',
        },
        HttpStatus.CONFLICT,
      );
    }
  }

  async getPrice(assetIds: number[]) {
    const fetchu = await (
      await fetch('https://www.rolimons.com/itemapi/itemdetails')
    ).json();
    const prices = assetIds.map((e) => fetchu.items[e][2]);
    return {
      price: prices.reduce(function (acc, val) {
        return acc + val;
      }, 0),
    };
  }
}
