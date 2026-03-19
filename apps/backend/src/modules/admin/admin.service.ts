import { Inject, Injectable } from "@nestjs/common";
import type { UserProfile } from "@logistics/shared";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class AdminService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService
  ) {}

  async getUsers(): Promise<UserProfile[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: "asc" }
    });

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      role: user.role,
      organizationName: user.organizationName
    }));
  }
}
