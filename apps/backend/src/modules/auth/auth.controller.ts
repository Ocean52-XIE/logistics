import { Body, Controller, Get, Inject, Post, UseGuards } from "@nestjs/common";
import type { LoginResponse, UserProfile } from "@logistics/shared";
import { CurrentUser } from "./decorators/current-user.decorator";
import { LoginDto } from "./dto/login.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService
  ) {}

  @Post("login")
  async login(@Body() body: LoginDto): Promise<LoginResponse> {
    return this.authService.login(body);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser("id") userId: string | null): Promise<UserProfile> {
    return this.authService.getProfile(userId ?? "");
  }
}
