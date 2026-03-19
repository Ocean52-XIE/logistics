import { IsBoolean, IsNumber, IsOptional, Min } from "class-validator";

export class SaveLessonProgressDto {
  @IsNumber()
  @Min(0)
  positionSeconds!: number;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
