import { IsInt, IsObject, Min } from "class-validator";

export class SaveExamDraftDto {
  @IsObject()
  answers!: Record<string, string[]>;

  @IsInt()
  @Min(1)
  currentQuestion!: number;

  @IsInt()
  @Min(0)
  remainingSeconds!: number;
}
