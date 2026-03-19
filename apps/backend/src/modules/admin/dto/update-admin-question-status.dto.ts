import { IsBoolean } from "class-validator";

export class UpdateAdminQuestionStatusDto {
  @IsBoolean()
  isActive!: boolean;
}
