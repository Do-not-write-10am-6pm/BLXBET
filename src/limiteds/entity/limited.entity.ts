import { Bot } from 'src/bots/entity/bot.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Limited extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ width: 12, type: 'bigint', unsigned: true })
  userId: number;

  @Column({ width: 12, type: 'bigint', unsigned: true })
  assetId: number;

  @CreateDateColumn({
    type: 'datetime',
  })
  depositDate: Date;

  @ManyToOne(() => Bot, (bot) => bot.limiteds)
  bot: Bot;
}
