import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { SearchHistory } from '../../search-history/entities/search-history.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 80 })
  username: string;

  @Column({ unique: true, length: 120 })
  email: string;

  @Column({ nullable: true, length: 255 })
  passwordHash: string;

  @Column({ nullable: true, unique: true, length: 255 })
  googleId: string;

  @Column({ nullable: true, length: 500 })
  profilePicture: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => SearchHistory, (searchHistory) => searchHistory.user)
  searchHistory: SearchHistory[];
}
