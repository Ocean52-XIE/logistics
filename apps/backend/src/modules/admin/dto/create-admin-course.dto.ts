import {
  IsIn,
  IsInt,
  IsString,
  Max,
  Min
} from "class-validator";

export class CreateAdminCourseDto {
  @IsString()
  title!: string;

  @IsString()
  category!: string;

  @IsInt()
  @Min(1)
  @Max(600)
  durationMinutes!: number;

  @IsIn(["required", "optional"])
  requirement!: "required" | "optional";

  @IsString()
  dueDate!: string;

  @IsString()
  description!: string;
}
