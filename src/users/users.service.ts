import { BadRequestException, Get, Injectable } from '@nestjs/common';
import { setCookie } from 'noblox.js';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async getUser(cookie: string) {
    try {
      return await setCookie(cookie);
    } catch {
      throw new BadRequestException();
    }
  }

  findAll() {
    return `This action returns all users`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
