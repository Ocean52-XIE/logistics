import { Type } from "class-transformer";
import {
  IsArray,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested
} from "class-validator";

class CreateAdminExamRuleDto {
  @IsInt()
  @Min(0)
  singleCount!: number;

  @IsInt()
  @Min(0)
  multipleCount!: number;

  @IsInt()
  @Min(0)
  booleanCount!: number;

  @IsInt()
  @Min(0)
  caseCount!: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  knowledgeTags?: string[];

  @IsOptional()
  @IsIn(["easy", "medium", "hard"])
  difficulty?: "easy" | "medium" | "hard";
}

export class CreateAdminExamDto {
  @IsString()
  name!: string;

  @IsInt()
  @Min(1)
  durationMinutes!: number;

  @IsString()
  startTime!: string;

  @IsInt()
  @Min(1)
  passScore!: number;

  @IsString()
  instructions!: string;

  @IsArray()
  @IsString({ each: true })
  warnings!: string[];

  @IsArray()
  @IsString({ each: true })
  assigneeUserIds!: string[];

  @IsObject()
  @ValidateNested()
  @Type(() => CreateAdminExamRuleDto)
  rule!: CreateAdminExamRuleDto;
}
