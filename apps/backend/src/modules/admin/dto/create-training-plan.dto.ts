import {
  ArrayMinSize,
  IsArray,
  IsString
} from "class-validator";

export class CreateTrainingPlanDto {
  @IsString()
  name!: string;

  @IsString()
  startAt!: string;

  @IsString()
  endAt!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  courseIds!: string[];

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  assigneeUserIds!: string[];
}
