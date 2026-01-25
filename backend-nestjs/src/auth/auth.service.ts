import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    if (clientId) {
      this.googleClient = new OAuth2Client(clientId);
    }
  }

  async register(registerDto: RegisterDto) {
    const { username, email, password } = registerDto;

    // Check if user exists
    const existingUser = await this.usersService.findByUsernameOrEmail(
      username,
      email,
    );
    if (existingUser) {
      throw new ConflictException('Username or email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.usersService.create({
      username,
      email,
      passwordHash,
    });

    // Generate JWT token
    const token = this.generateToken(user.id);

    return {
      success: true,
      message: 'User registered successfully',
      data: {
        user: this.usersService.toDto(user),
        token,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    // Find user
    const user = await this.usersService.findByUsernameOrEmail(username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check password
    if (!user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const token = this.generateToken(user.id);

    return {
      success: true,
      message: 'Login successful',
      data: {
        user: this.usersService.toDto(user),
        token,
      },
    };
  }

  async googleAuth(googleAuthDto: GoogleAuthDto) {
    const { token } = googleAuthDto;

    if (!this.googleClient) {
      throw new BadRequestException('Google OAuth not configured');
    }

    try {
      // Verify Google token
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Invalid Google token');
      }

      const { sub: googleId, email, name, picture } = payload;

      if (!googleId || !email) {
        throw new UnauthorizedException('Invalid Google token');
      }

      // Find or create user
      let user = await this.usersService.findByGoogleId(googleId);

      if (!user) {
        // Check if user exists by email
        user = await this.usersService.findByEmail(email);

        if (user) {
          // Link Google account
          user.googleId = googleId;
          user.profilePicture = picture;
          await this.usersService.update(user.id, user);
        } else {
          // Create new user
          const username = this.generateUsername(name || email);
          user = await this.usersService.create({
            username,
            email,
            googleId,
            profilePicture: picture,
          });
        }
      } else {
        // Update profile picture if changed
        if (picture && user.profilePicture !== picture) {
          user.profilePicture = picture;
          await this.usersService.update(user.id, user);
        }
      }

      // Generate JWT token
      const token = this.generateToken(user.id);

      return {
        success: true,
        message: 'Google authentication successful',
        data: {
          user: this.usersService.toDto(user),
          token,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  private generateToken(userId: number): string {
    const payload = { sub: userId };
    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '7d'),
    });
  }

  private generateUsername(nameOrEmail: string): string {
    let baseUsername = nameOrEmail
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');

    // Ensure it starts with a letter
    if (!/^[a-z]/.test(baseUsername)) {
      baseUsername = 'user_' + baseUsername;
    }

    return baseUsername;
  }
}
