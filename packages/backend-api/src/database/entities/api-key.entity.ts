import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User, UserTier } from './user.entity';

@Entity('api_keys')
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  key_hash: string;

  @Column({ type: 'varchar', length: 10 })
  key_prefix: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  name: string;

  @Column({
    type: 'varchar',
    length: 20,
    enum: UserTier,
  })
  tier: UserTier;

  @Column({ type: 'integer', default: 50 })
  rate_limit_rpm: number;

  @Column({ type: 'integer', default: 1000 })
  rate_limit_rpd: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'timestamp', nullable: true })
  last_used_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.api_keys)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
