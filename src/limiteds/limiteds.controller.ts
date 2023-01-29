import {
  Controller,
  Get,
  UseGuards,
  Request,
  Post,
  Param,
  Patch,
  Delete,
  Response,
} from '@nestjs/common';
import { getProductInfo, LoggedInUserData } from 'noblox.js';
import { CookieGuard } from 'src/auth/cookie.guard';
import { AssetIdsPipe } from 'src/pipes/assetIds.pipe';
import { LimitedsService } from './limiteds.service';

@Controller('limiteds')
export class LimitedsController {
  constructor(private readonly limitedsService: LimitedsService) {}

  @UseGuards(CookieGuard)
  @Get('/data/:assetId')
  async getItemData(
    @Param('assetId')
    assetId: string,
  ) {
    return await getProductInfo(parseInt(assetId));
  }

  @UseGuards(CookieGuard)
  @Get('/user')
  async getUserInventory(@Request() req) {
    return await this.limitedsService.getUserInventory(req.user.UserID);
  }

  @UseGuards(CookieGuard)
  @Get('/blx')
  async getBlxInventory(@Request() req) {
    return await this.limitedsService.getBlxInventory(req.user.UserID);
  }

  @UseGuards(CookieGuard)
  @Post('/:assetIds')
  async deposit(
    @Request() req,
    @Param('assetIds', new AssetIdsPipe()) assetIds: number[],
  ) {
    return await this.limitedsService.deposit(
      req.user.UserID,
      req.cookie,
      assetIds,
    );
  }

  @UseGuards(CookieGuard)
  @Delete('/:assetIds')
  async withdraw(
    @Request() req,
    @Param('assetIds', new AssetIdsPipe()) assetIds: number[],
  ) {
    return await this.limitedsService.withdraw(
      req.user.UserID,
      req.cookie,
      assetIds,
    );
  }

  @UseGuards(CookieGuard)
  @Get('/price/:assetIds')
  async getPrice(
    @Request() req,
    @Param('assetIds', new AssetIdsPipe()) assetIds: number[],
  ) {
    return await this.limitedsService.getPrice(assetIds);
  }
}
