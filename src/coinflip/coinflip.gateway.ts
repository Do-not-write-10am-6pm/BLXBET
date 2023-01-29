import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { CoinflipService } from './coinflip.service';
import { Socket, Server } from 'socket.io';
import { GamesService } from 'src/games/games.service';
import { UsersService } from 'src/users/users.service';
import { Coin } from 'types/enums/Coin';
import { GameAction } from 'types/enums/GameAction';
@WebSocketGateway({
  cors: {
    origin: `*`,
  },
})
export class CoinflipGateway {
  @WebSocketServer()
  server: Server;
  constructor(
    private readonly coinflipService: CoinflipService,
    private readonly gamesService: GamesService,
  ) {}

  async handleDisconnect(client: Socket) {
    const res = await this.gamesService.handleDisconnect(client, this.server);
    if (res >= 1) {
      this.server.emit('/coinflip', {
        hostSocketId: client.id,
        gameAction: GameAction.delete,
      });
    }
  }
  @SubscribeMessage('/disconnect')
  async disconnect(@ConnectedSocket() client: Socket) {
    const res = await this.gamesService.handleDisconnect(client, this.server);
    if (res >= 1) {
      this.server.emit('/coinflip', {
        hostSocketId: client.id,
        gameAction: GameAction.delete,
      });
    }
  }
  @SubscribeMessage('/confirm')
  async confirm(
    @ConnectedSocket() client: Socket,
    @MessageBody('cookie') cookie: string,
  ) {
    return await this.coinflipService.confirm(cookie, client, this.server);
  }

  @SubscribeMessage('/cancel')
  async cancel(
    @ConnectedSocket() client: Socket,
    @MessageBody('cookie') cookie: string,
  ) {
    return await this.coinflipService.cancel(cookie, client);
  }
  @SubscribeMessage('/create')
  async create(
    @ConnectedSocket() client: Socket,
    @MessageBody('cookie') cookie: string,
    @MessageBody('assetIds') assetIds: number[],
    @MessageBody('coin') coin: Coin,
  ) {
    if (assetIds.length === 0) {
      return { error: 'Select limiteds to play' };
    }
    if (coin !== Coin.green && coin !== Coin.orange) {
      return { error: 'Select coin to play' };
    }
    try {
      const coinflip = await this.coinflipService.create(
        cookie,
        assetIds,
        coin,
        client,
      );
      this.server.emit('/coinflip', {
        game: coinflip,
        gameAction: GameAction.add,
      });
      return coinflip;
    } catch (err) {
      return { error: 'Something went wrong, try again later' };
    }
  }

  @SubscribeMessage('/join')
  async join(
    @ConnectedSocket() client: Socket,
    @MessageBody('gameId') gameId: string,
    @MessageBody('cookie') cookie: string,
    @MessageBody('assetIds') assetIds: number[],
  ) {
    if (assetIds.length === 0) {
      return { error: 'Select limiteds to play' };
    }
    try {
      const coinflip = await this.coinflipService.join(
        gameId,
        cookie,
        assetIds,
        client,
      );
      client.to(coinflip.hostSocketId).emit('/coinflipJoin', coinflip);
      return coinflip;
    } catch (err) {
      return { error: 'Something went wrong, try again later' };
    }
  }

  @SubscribeMessage('/findAllGames')
  async findAllGames(@MessageBody('cookie') cookie: string) {
    try {
      const coinflips = await this.coinflipService.findAllGames(cookie);
      return coinflips;
    } catch (err) {
      return { error: 'Something went wrong, try again later' };
    }
  }
  // @SubscribeMessage('join')
  // async joinRoom(
  //   @MessageBody('gameId') gameId: string,
  //   @ConnectedSocket() client: Socket,
  // ) {
  //   return await this.coinflipService.joinGame(gameId, client, this.server);
  // }
}
