import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('search_history')
export class SearchHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.searchHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'text', nullable: true })
  query: string;

  @Column({ length: 50, nullable: true })
  category: string;

  @Column({ length: 50, nullable: true })
  tone: string;

  @Column({ default: 0 })
  resultsCount: number;

  @CreateDateColumn()
  createdAt: Date;
}
