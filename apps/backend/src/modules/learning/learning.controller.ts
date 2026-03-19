import { Body, Controller, Get, Inject, Param, Post } from "@nestjs/common";
import type {
  CourseDetail,
  CourseListItem,
  ExamDetail,
  ExamListItem,
  SaveExamDraftResponse,
  SaveLessonProgressResponse,
  SubmitExamResponse
} from "@logistics/shared";
import { SaveExamDraftDto } from "./dto/save-exam-draft.dto";
import { SaveLessonProgressDto } from "./dto/save-lesson-progress.dto";
import { SubmitExamDto } from "./dto/submit-exam.dto";
import { LearningService } from "./learning.service";

@Controller()
export class LearningController {
  constructor(
    @Inject(LearningService)
    private readonly learningService: LearningService
  ) {}

  @Get("courses")
  getCourses(): CourseListItem[] {
    return this.learningService.getCourses();
  }

  @Get("courses/:courseId")
  getCourse(@Param("courseId") courseId: string): CourseDetail {
    return this.learningService.getCourse(courseId);
  }

  @Get("lessons/:lessonId")
  getLesson(@Param("lessonId") lessonId: string) {
    return this.learningService.getLesson(lessonId);
  }

  @Post("lessons/:lessonId/progress")
  saveLessonProgress(
    @Param("lessonId") lessonId: string,
    @Body() body: SaveLessonProgressDto
  ): SaveLessonProgressResponse {
    return this.learningService.saveLessonProgress(lessonId, body);
  }

  @Get("exams")
  getExams(): ExamListItem[] {
    return this.learningService.getExams();
  }

  @Get("exams/:examId")
  getExam(@Param("examId") examId: string): ExamDetail {
    return this.learningService.getExam(examId);
  }

  @Post("exams/:examId/draft")
  saveExamDraft(
    @Param("examId") examId: string,
    @Body() body: SaveExamDraftDto
  ): SaveExamDraftResponse {
    return this.learningService.saveExamDraft(examId, body);
  }

  @Post("exams/:examId/submit")
  submitExam(
    @Param("examId") examId: string,
    @Body() body: SubmitExamDto
  ): SubmitExamResponse {
    return this.learningService.submitExam(examId, body);
  }
}
