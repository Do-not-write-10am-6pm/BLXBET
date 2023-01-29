import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { GamesService } from 'src/games/games.service';
import { UsersService } from 'src/users/users.service';
import { Coin } from 'types/enums/Coin';
import { Socket, Server } from 'socket.io';
@Injectable()
export class CoinflipService {
  constructor(
    private gamesService: GamesService,
    private readonly usersService: UsersService,
  ) {}

  async confirm(cookie: string, socket: Socket, server: Server) {
    try {
      const user = await this.usersService.getUser(cookie);
      return await this.gamesService.confirm(user.UserID, socket, server);
    } catch (err) {
      throw new WsException({
        error: 'Something went wrong, try again later',
      });
    }
  }

  async cancel(cookie: string, socket: Socket) {
    try {
      const user = await this.usersService.getUser(cookie);
      return await this.gamesService.cancel(user.UserID, socket);
    } catch (err) {
      throw new WsException({
        error: 'Something went wrong, try again later',
      });
    }
  }

  async create(cookie: string, assetIds: number[], coin: Coin, socket: Socket) {
    try {
      const user = await this.usersService.getUser(cookie);
      return await this.gamesService.createCoinflip(
        user.UserID,
        assetIds,
        coin,
        socket,
      );
    } catch (err) {
      throw new WsException({
        error: 'Something went wrong, try again later',
      });
    }
  }

  async join(
    gameId: string,
    cookie: string,
    assetIds: number[],
    socket: Socket,
  ) {
    try {
      const user = await this.usersService.getUser(cookie);
      return await this.gamesService.joinCoinflip(
        gameId,
        user.UserID,
        assetIds,
        socket,
      );
    } catch (err) {
      throw new WsException({
        error: 'Something went wrong, try again later',
      });
    }
  }

  async findAllGames(cookie: string) {
    try {
      const user = await this.usersService.getUser(cookie);
      return await this.gamesService.getCoinflipGames();
    } catch (err) {
      throw new WsException({
        error: 'Something went wrong, try again later',
      });
    }
  }
}
