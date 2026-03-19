"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ExamDetail, SubmitExamResponse } from "@logistics/shared";
import { saveExamDraft, submitExam } from "@/lib/api";
import { StatusBadge } from "./ui";

export function ExamSessionPanel({ exam }: { exam: ExamDetail }) {
  const [answers, setAnswers] = useState<Record<string, string[]>>(exam.attempt.answers);
  const [currentQuestion, setCurrentQuestion] = useState(exam.attempt.currentQuestion || 1);
  const [remainingSeconds, setRemainingSeconds] = useState(exam.attempt.remainingSeconds);
  const [savedAt, setSavedAt] = useState<string | null>(exam.attempt.savedAt);
  const [submittedAt, setSubmittedAt] = useState<string | null>(exam.attempt.submittedAt);
  const [submitResult, setSubmitResult] = useState<SubmitExamResponse | null>(null);
  const [actionMessage, setActionMessage] = useState("自动暂存已开启");
  const [isSaving, setIsSaving] = useState(false);

  const answersRef = useRef(answers);
  const currentQuestionRef = useRef(currentQuestion);
  const remainingRef = useRef(remainingSeconds);
  const submittedRef = useRef(submittedAt);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    currentQuestionRef.current = currentQuestion;
  }, [currentQuestion]);

  useEffect(() => {
    remainingRef.current = remainingSeconds;
  }, [remainingSeconds]);

  useEffect(() => {
    submittedRef.current = submittedAt;
  }, [submittedAt]);

  useEffect(() => {
    if (submittedAt) {
      return;
    }

    const timer = window.setInterval(() => {
      setRemainingSeconds((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [submittedAt]);

  const persistDraft = useCallback(
    async (force = false) => {
      if (submittedRef.current) {
        return;
      }
      if (!force && remainingRef.current <= 0) {
        return;
      }

      setIsSaving(true);
      const response = await saveExamDraft(exam.id, {
        answers: answersRef.current,
        currentQuestion: currentQuestionRef.current,
        remainingSeconds: remainingRef.current
      });
      setIsSaving(false);

      if (!response) {
        setActionMessage("暂存失败，请检查网络");
        return;
      }

      setSavedAt(response.savedAt);
      setActionMessage(`暂存成功：${new Date(response.savedAt).toLocaleTimeString("zh-CN")}`);
    },
    [exam.id]
  );

  useEffect(() => {
    if (submittedAt) {
      return;
    }

    const timer = window.setInterval(() => {
      void persistDraft();
    }, 30_000);

    return () => {
      window.clearInterval(timer);
    };
  }, [persistDraft, submittedAt]);

  useEffect(() => {
    const onBeforeUnload = () => {
      void persistDraft(true);
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        void persistDraft(true);
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [persistDraft]);

  const questions = exam.questions;
  const activeIndex = Math.max(
    0,
    Math.min(questions.length - 1, currentQuestion - 1)
  );
  const activeQuestion = questions[activeIndex];

  const answeredCount = useMemo(
    () => questions.filter((item) => (answers[item.id] ?? []).length > 0).length,
    [answers, questions]
  );

  const onPickOption = (questionId: string, optionId: string) => {
    if (submittedAt) {
      return;
    }

    setAnswers((prev) => {
      const current = prev[questionId] ?? [];
      const question = questions.find((item) => item.id === questionId);
      if (!question) {
        return prev;
      }

      if (question.type === "single" || question.type === "boolean" || question.type === "case") {
        return { ...prev, [questionId]: [optionId] };
      }

      const next = current.includes(optionId)
        ? current.filter((item) => item !== optionId)
        : [...current, optionId];
      return { ...prev, [questionId]: next };
    });
  };

  const onSubmit = async () => {
    if (submittedAt) {
      return;
    }

    setIsSaving(true);
    const response = await submitExam(exam.id, { answers });
    setIsSaving(false);

    if (!response) {
      setActionMessage("交卷失败，请重试");
      return;
    }

    setSubmittedAt(response.submittedAt);
    setSubmitResult(response);
    setActionMessage("交卷成功，结果已生成");
  };

  return (
    <section className="grid gap-5 xl:grid-cols-[1.4fr_0.6fr]">
      <article className="rounded-3xl border border-[color:var(--line)] bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-2xl font-semibold text-slate-800">{exam.name}</h2>
          <StatusBadge text={submittedAt ? "已交卷" : "自动暂存：已开启"} tone={submittedAt ? "success" : "info"} />
        </div>
        <p className="mt-2 text-sm text-slate-600">{exam.instructions}</p>
        <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {submittedAt
            ? `已于 ${new Date(submittedAt).toLocaleString("zh-CN")} 提交`
            : `距离交卷还有 ${formatDuration(remainingSeconds)}。建议先完成未答题目，再统一复查。`}
        </div>

        {submitResult ? (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-lg font-semibold text-emerald-700">
              得分 {submitResult.score} 分（{submitResult.passed ? "通过" : "未通过"}）
            </p>
            <p className="mt-2 text-sm text-emerald-700">
              正确 {submitResult.correctCount} / {submitResult.totalQuestions}
            </p>
            <div className="mt-3 text-sm text-emerald-700">
              建议复习：{submitResult.suggestedReviews.length > 0 ? submitResult.suggestedReviews.join("、") : "无"}
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-slate-200 p-5">
            <p className="text-sm text-slate-500">
              第 {activeIndex + 1} 题（{questionTypeLabel(activeQuestion.type)}）
            </p>
            <p className="mt-2 font-medium text-slate-800">{activeQuestion.stem}</p>
            <div className="mt-4 space-y-2 text-sm">
              {activeQuestion.options.map((option) => {
                const checked = (answers[activeQuestion.id] ?? []).includes(option.id);
                return (
                  <label
                    key={option.id}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 ${
                      checked
                        ? "border-brand-200 bg-brand-50"
                        : "border-slate-200"
                    }`}
                  >
                    <input
                      type={activeQuestion.type === "multiple" ? "checkbox" : "radio"}
                      name={activeQuestion.id}
                      checked={checked}
                      onChange={() => onPickOption(activeQuestion.id, option.id)}
                      disabled={Boolean(submittedAt)}
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </article>

      <article className="rounded-3xl border border-[color:var(--line)] bg-white p-6">
        <h3 className="text-xl font-semibold text-slate-800">题号导航</h3>
        <div className="mt-4 grid grid-cols-5 gap-2">
          {questions.map((question, index) => {
            const answered = (answers[question.id] ?? []).length > 0;
            const active = currentQuestion === index + 1;
            return (
              <button
                key={question.id}
                type="button"
                onClick={() => setCurrentQuestion(index + 1)}
                className={`rounded-lg px-2 py-1.5 text-sm font-medium ${
                  active
                    ? "bg-brand-500 text-white"
                    : answered
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                }`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
        <div className="mt-5 space-y-2 text-sm text-slate-600">
          <p>已作答：{answeredCount} 题</p>
          <p>未作答：{questions.length - answeredCount} 题</p>
          <p>暂存状态：{savedAt ? new Date(savedAt).toLocaleTimeString("zh-CN") : "暂无"}</p>
          <p>{actionMessage}</p>
        </div>
        <div className="mt-5 grid gap-2">
          <button
            type="button"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={() => void persistDraft(true)}
            disabled={isSaving || Boolean(submittedAt)}
          >
            手动暂存
          </button>
          <button
            type="button"
            className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
            onClick={() => void onSubmit()}
            disabled={isSaving || Boolean(submittedAt)}
          >
            {submittedAt ? "已交卷" : "交卷确认"}
          </button>
        </div>
      </article>
    </section>
  );
}

function questionTypeLabel(type: ExamDetail["questions"][number]["type"]) {
  if (type === "single") {
    return "单选";
  }
  if (type === "multiple") {
    return "多选";
  }
  if (type === "boolean") {
    return "判断";
  }
  return "案例";
}

function formatDuration(totalSeconds: number) {
  const mm = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const ss = (totalSeconds % 60).toString().padStart(2, "0");
  return `00:${mm}:${ss}`;
}
