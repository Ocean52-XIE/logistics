import {
  Inject,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { LoginResponse, UserProfile } from "@logistics/shared";
import { compare } from "bcryptjs";
import { PrismaService } from "../database/prisma.service";
import { LoginDto } from "./dto/login.dto";
import type { JwtPayload } from "./types/jwt-payload";

@Injectable()
export class AuthService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
    @Inject(JwtService)
    private readonly jwtService: JwtService
  ) {}

  async login(payload: LoginDto): Promise<LoginResponse> {
    const user = await this.prisma.user.findUnique({
      where: { username: payload.username }
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await compare(payload.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const jwtPayload: JwtPayload = {
      sub: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      organizationName: user.organizationName
    };

    return {
      accessToken: await this.jwtService.signAsync(jwtPayload),
      tokenType: "Bearer",
      expiresIn: 12 * 60 * 60,
      user: this.toUserProfile(user)
    };
  }

  async getProfile(userId: string): Promise<UserProfile> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException("User not found or inactive");
    }

    return this.toUserProfile(user);
  }

  private toUserProfile(user: {
    id: string;
    name: string;
    role: UserProfile["role"];
    organizationName: string;
  }): UserProfile {
    return {
      id: user.id,
      name: user.name,
      role: user.role,
      organizationName: user.organizationName
    };
  }
}
