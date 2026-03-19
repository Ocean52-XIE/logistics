import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsString,
  MinLength
} from "class-validator";

export class CreateAdminQuestionDto {
  @IsString()
  @MinLength(5)
  stem!: string;

  @IsIn(["single", "multiple", "boolean", "case"])
  type!: "single" | "multiple" | "boolean" | "case";

  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  options!: string[];

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  correctOptionIds!: string[];

  @IsString()
  knowledgeTag!: string;

  @IsIn(["easy", "medium", "hard"])
  difficulty!: "easy" | "medium" | "hard";
}
