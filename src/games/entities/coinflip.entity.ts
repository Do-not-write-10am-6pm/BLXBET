import { Bot } from 'src/bots/entity/bot.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Bool } from 'types/enums/Bool';
import { Coin } from 'types/enums/Coin';

@Entity()
export class Coinflip extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ width: 12, type: 'bigint', unsigned: true })
  hostId: number;

  @Column({ type: 'text', width: 255 })
  hostSocketId: string;

  @Column({ width: 12, type: 'bigint', unsigned: true, nullable: true })
  playerId: number | null;

  @Column({ type: 'text', width: 255, nullable: true })
  playerSocketId: string | null;

  @Column('simple-array')
  hostLimiteds: number[];

  @Column('simple-array', { nullable: true })
  playerLimiteds: number[];

  @Column({
    type: 'enum',
    enum: Coin,
    nullable: true,
  })
  hostBet: Coin;

  @Column({
    type: 'enum',
    enum: Bool,
    default: Bool.false,
  })
  hostReady: Bool;

  @Column({
    type: 'enum',
    enum: Bool,
    default: Bool.false,
  })
  playerReady: Bool;

  @Column({
    type: 'enum',
    enum: Bool,
    nullable: true,
  })
  result: Bool;

  @Column({
    type: 'datetime',
    nullable: true,
  })
  settledAt: Date | null;
}
