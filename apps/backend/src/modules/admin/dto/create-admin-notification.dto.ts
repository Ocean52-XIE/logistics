import { IsArray, IsBoolean, IsOptional, IsString, MinLength } from "class-validator";

export class CreateAdminNotificationDto {
  @IsString()
  @MinLength(2)
  title!: string;

  @IsString()
  @MinLength(2)
  content!: string;

  @IsOptional()
  @IsBoolean()
  pinned?: boolean;

  @IsArray()
  @IsString({ each: true })
  userIds!: string[];
}
