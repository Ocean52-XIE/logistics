import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getMeta() {
    return {
      name: "logistics-training-backend",
      description: "NestJS API skeleton for the logistics training platform"
    };
  }
}
