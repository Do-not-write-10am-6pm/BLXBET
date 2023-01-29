import { Limited } from 'src/limiteds/entity/limited.entity';
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Bot extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    width: 900,
    type: 'text',
  })
  cookie: string;

  @Column({ width: 12, type: 'bigint', unsigned: true })
  userId: number;

  @Column({
    type: 'datetime',
  })
  tradeblockCheck: Date;

  @OneToMany(() => Limited, (limited) => limited.bot)
  limiteds: Limited[];
}
