import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CookieGuard } from 'src/auth/cookie.guard';
import { getUsernameFromId } from 'noblox.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(CookieGuard)
  @Get('/')
  async getUser(@Request() req) {
    return await this.usersService.getUser(req.cookie);
  }

  @UseGuards(CookieGuard)
  @Get('/username/:id')
  async getUsername(@Param('id') id: string) {
    const name = await getUsernameFromId(parseInt(id));
    return { name };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
