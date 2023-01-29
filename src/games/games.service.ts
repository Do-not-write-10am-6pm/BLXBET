import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WsException } from '@nestjs/websockets';
import async from 'async';
import { Server, Socket } from 'socket.io';
import { Bot } from 'src/bots/entity/bot.entity';
import { Limited } from 'src/limiteds/entity/limited.entity';
import { IsNull, Like, Repository } from 'typeorm';
import { Bool } from 'types/enums/Bool';
import { Coin } from 'types/enums/Coin';
import { GameAction } from 'types/enums/GameAction';
import { Coinflip } from './entities/coinflip.entity';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(Coinflip) private limitedRepository: Repository<Coinflip>,
  ) {}
  async confirm(id: number, socket: Socket, server: Server) {
    const coinflip = await Coinflip.findOne({
      where: [
        { hostId: id, result: IsNull() },
        { playerId: id, result: IsNull() },
      ],
    });
    if (!coinflip) {
      throw new WsException({
        error: "You don't have a pending coinflip game",
      });
    }
    if (id === coinflip.hostId && socket.id === coinflip.hostSocketId) {
      if (coinflip.hostReady === Bool.true) {
        throw new WsException({
          error: "You're already ready",
        });
      }
      if (
        coinflip.hostReady === Bool.false &&
        coinflip.playerReady === Bool.true
      ) {
        coinflip.hostReady = Bool.true;
        const result = Math.random() < 0.5;
        coinflip.result = result ? Bool.true : Bool.false;
        server.emit('/coinflip', {
          hostSocketId: coinflip.hostSocketId,
          gameAction: GameAction.delete,
        });
        if (result) {
          const hostLimiteds = await Limited.findBy({ userId: id });
          const playerLimiteds = (
            await Limited.findBy({
              userId: coinflip.playerId,
            })
          ).map((e) => e.assetId);
          async.map(coinflip.playerLimiteds, async (e) => {
            const toDelete = await Limited.findOneBy({
              userId: coinflip.playerId,
              assetId: e,
            });
            const bot = await Bot.findOneBy({ id: Like('%%') });
            const toAdd = new Limited();
            toAdd.userId = id;
            toAdd.assetId = e;
            toAdd.bot = bot;
            await toDelete.remove();
            await toAdd.save();
          });
        } else {
          const playerLimiteds = await Limited.findBy({
            userId: coinflip.playerId,
          });
          const hostLimiteds = (
            await Limited.findBy({
              userId: id,
            })
          ).map((e) => e.assetId);
          async.map(coinflip.hostLimiteds, async (e) => {
            const toDelete = await Limited.findOneBy({
              userId: id,
              assetId: e,
            });
            const bot = await Bot.findOneBy({ id: Like('%%') });
            const toAdd = new Limited();
            toAdd.userId = coinflip.playerId;
            toAdd.assetId = e;
            toAdd.bot = bot;
            await toDelete.remove();
            await toAdd.save();
          });
        }
      } else if (
        coinflip.hostReady === Bool.false &&
        coinflip.playerReady === Bool.false
      ) {
        coinflip.hostReady = Bool.true;
      }
      socket.to(coinflip.playerSocketId).emit('/update', coinflip);
    } else if (
      //PLAYER SCRIPT
      id === coinflip.playerId &&
      socket.id === coinflip.playerSocketId
    ) {
      if (coinflip.playerReady === Bool.true) {
        throw new WsException({
          error: "You're already ready",
        });
      }
      if (
        coinflip.playerReady === Bool.false &&
        coinflip.hostReady === Bool.true
      ) {
        coinflip.playerReady = Bool.true;
        const result = Math.random() < 0.5;
        coinflip.result = result ? Bool.true : Bool.false;
        server.emit('/coinflip', {
          hostSocketId: coinflip.hostSocketId,
          gameAction: GameAction.delete,
        });
        if (result) {
          const hostLimiteds = await Limited.findBy({
            userId: coinflip.hostId,
          });
          const playerLimiteds = (
            await Limited.findBy({
              userId: id,
            })
          ).map((e) => e.assetId);
          async.map(coinflip.playerLimiteds, async (e) => {
            const toDelete = await Limited.findOneBy({
              userId: id,
              assetId: e,
            });
            const bot = await Bot.findOneBy({ id: Like('%%') });
            const toAdd = new Limited();
            toAdd.userId = coinflip.hostId;
            toAdd.assetId = e;
            toAdd.bot = bot;
            await toDelete.remove();
            await toAdd.save();
          });
        } else {
          const playerLimiteds = await Limited.findBy({
            userId: id,
          });
          const hostLimiteds = (
            await Limited.findBy({
              userId: coinflip.hostId,
            })
          ).map((e) => e.assetId);
          async.map(coinflip.hostLimiteds, async (e) => {
            const toDelete = await Limited.findOneBy({
              userId: coinflip.hostId,
              assetId: e,
            });
            const bot = await Bot.findOneBy({ id: Like('%%') });
            const toAdd = new Limited();
            toAdd.userId = id;
            toAdd.assetId = e;
            toAdd.bot = bot;
            await toDelete.remove();
            await toAdd.save();
          });
        }
      } else if (
        coinflip.hostReady === Bool.false &&
        coinflip.playerReady === Bool.false
      ) {
        coinflip.playerReady = Bool.true;
      }
      socket.to(coinflip.hostSocketId).emit('/update', coinflip);
    }
    if (coinflip.result) {
      coinflip.settledAt = new Date();
    }
    return await coinflip.save();
  }

  async cancel(id: number, socket: Socket) {
    const coinflip = await Coinflip.findOne({
      where: [
        { hostId: id, result: IsNull() },
        { playerId: id, result: IsNull() },
      ],
    });
    if (!coinflip) {
      throw new WsException({
        error: "You don't have a pending coinflip game",
      });
    }
    if (id === coinflip.hostId && socket.id === coinflip.hostSocketId) {
      coinflip.playerId = null;
      coinflip.playerLimiteds = null;
      coinflip.playerSocketId = null;
      coinflip.playerReady = Bool.false;
      coinflip.hostReady = Bool.false;
      socket.to(coinflip.playerSocketId).emit('/update', false);
      return await coinflip.save();
    }
    if (
      //PLAYER SCRIPT
      id === coinflip.playerId &&
      socket.id === coinflip.playerSocketId
    ) {
      coinflip.playerId = null;
      coinflip.playerLimiteds = null;
      coinflip.playerSocketId = null;
      coinflip.playerReady = Bool.false;
      coinflip.hostReady = Bool.false;
      socket.to(coinflip.hostSocketId).emit('/update', coinflip);
      await coinflip.save();
    }
  }
  async createCoinflip(
    id: number,
    assetIds: number[],
    coin: Coin,
    socket: Socket,
  ) {
    const check = await Coinflip.findOne({
      where: [
        { hostId: id, result: IsNull() },
        { playerId: id, result: IsNull() },
      ],
    });
    if (check) {
      throw new WsException({
        error: 'You already have a pending coinflip game',
      });
    }
    let itemCheck = false;
    await async.map(assetIds, async (e) => {
      const item = await Limited.findOneBy({ userId: id, assetId: e });
      if (!item) {
        itemCheck = true;
      }
    });
    if (itemCheck) {
      throw new WsException({
        error: "You don't posses some of the items",
      });
    }
    const coinflip = new Coinflip();
    coinflip.hostId = id;
    coinflip.hostLimiteds = assetIds;
    coinflip.hostBet = coin;
    coinflip.hostSocketId = socket.id;
    return await coinflip.save();
  }

  async joinCoinflip(
    gameId: string,
    id: number,
    assetIds: number[],
    socket: Socket,
  ) {
    const check = await Coinflip.findOne({
      where: [
        { hostId: id, result: IsNull() },
        { playerId: id, result: IsNull() },
      ],
    });
    if (check) {
      throw new WsException({
        error: 'You already have a pending coinflip game',
      });
    }
    let itemCheck = false;
    await async.map(assetIds, async (e) => {
      const item = await Limited.findOneBy({ userId: id, assetId: e });
      if (!item) {
        itemCheck = true;
      }
    });
    if (itemCheck) {
      throw new WsException({
        error: "You don't posses some of the items",
      });
    }
    const coinflip = await Coinflip.findOneBy({ id: gameId });
    if (!coinflip) {
      throw new WsException({
        error: 'Invalid game id',
      });
    }
    if (coinflip?.playerId || coinflip?.result) {
      throw new WsException({
        error: 'This game is already taken',
      });
    }
    coinflip.playerId = id;
    coinflip.playerLimiteds = assetIds;
    coinflip.playerSocketId = socket.id;
    return await coinflip.save();
  }

  async getCoinflipGames() {
    const res = await Coinflip.findBy({ result: IsNull() });
    console.log(res);
    return res;
  }

  async handleDisconnect(client: Socket, server: Server) {
    try {
      const res = await Coinflip.delete({
        hostSocketId: client.id,
        result: IsNull(),
      });
      if (res.affected) {
        return res.affected;
      }
      const coinflip = await Coinflip.findOneBy({
        playerSocketId: client.id,
        result: IsNull(),
      });
      if (coinflip) {
        coinflip.playerId = null;
        coinflip.playerSocketId = null;
        coinflip.playerLimiteds = null;
        return await coinflip.save();
      }
    } catch (err) {
      throw new WsException({
        error: 'Something went wrong, try again later',
      });
    }
  }
}
