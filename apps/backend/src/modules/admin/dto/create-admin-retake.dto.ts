import { ArrayMinSize, IsArray, IsInt, IsOptional, IsString, Min } from "class-validator";

export class CreateAdminRetakeDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  userIds!: string[];

  @IsString()
  startTime!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  passScore?: number;
}
