import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const databaseUrl = this.configService.get<string>('DATABASE_URL');
    if (databaseUrl) {
      // Use DATABASE_URL (e.g. from Render, Heroku) — parse and merge with defaults
      try {
        const url = new URL(databaseUrl);
        const auth = url.password ? decodeURIComponent(url.password) : '';
        const user = url.username ? decodeURIComponent(url.username) : 'postgres';
        return {
          type: 'postgres',
          host: url.hostname,
          port: parseInt(url.port || '5432', 10),
          username: user,
          password: auth,
          database: url.pathname ? url.pathname.slice(1) : 'book_recommendation',
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          synchronize: this.configService.get<string>('NODE_ENV') !== 'production',
          logging: this.configService.get<string>('NODE_ENV') === 'development',
          ssl: this.configService.get<string>('NODE_ENV') === 'production'
            ? { rejectUnauthorized: false }
            : false,
        };
      } catch {
        // Fall through to individual env vars if URL is invalid
      }
    }
    return {
      type: 'postgres',
      host: this.configService.get<string>('DB_HOST', 'localhost'),
      port: this.configService.get<number>('DB_PORT', 5432),
      username: this.configService.get<string>('DB_USERNAME', 'postgres'),
      password: this.configService.get<string>('DB_PASSWORD', ''),
      database: this.configService.get<string>('DB_DATABASE', 'book_recommendation'),
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: this.configService.get<string>('NODE_ENV') !== 'production',
      logging: this.configService.get<string>('NODE_ENV') === 'development',
      ssl: this.configService.get<string>('NODE_ENV') === 'production'
        ? { rejectUnauthorized: false }
        : false,
    };
  }
}
