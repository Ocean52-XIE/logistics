"use client";

import Link from "next/link";
import type { Route } from "next";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LessonDetail } from "@logistics/shared";
import { saveLessonProgress } from "@/lib/api";
import { StatusBadge } from "./ui";

export function LessonLearningPanel({ lesson }: { lesson: LessonDetail }) {
  const [positionSeconds, setPositionSeconds] = useState(lesson.positionSeconds);
  const [completed, setCompleted] = useState(lesson.completed);
  const [courseProgress, setCourseProgress] = useState<number | null>(null);
  const [saveMessage, setSaveMessage] = useState("等待保存");
  const [isSaving, setIsSaving] = useState(false);

  const positionRef = useRef(positionSeconds);
  const completedRef = useRef(completed);
  const lastSavedPositionRef = useRef(lesson.positionSeconds);
  const lastSavedCompletedRef = useRef(lesson.completed);

  useEffect(() => {
    positionRef.current = positionSeconds;
  }, [positionSeconds]);

  useEffect(() => {
    completedRef.current = completed;
  }, [completed]);

  const progressPercent = useMemo(() => {
    if (lesson.totalSeconds <= 0) {
      return 0;
    }
    return Math.min(
      100,
      Math.round((positionSeconds / lesson.totalSeconds) * 100)
    );
  }, [lesson.totalSeconds, positionSeconds]);

  const persistProgress = useCallback(
    async (options?: { force?: boolean; markCompleted?: boolean }) => {
      const currentPosition = options?.markCompleted
        ? lesson.totalSeconds
        : positionRef.current;
      const nextCompleted =
        options?.markCompleted === true
          ? true
          : completedRef.current || currentPosition >= lesson.totalSeconds;
      const isUnchanged =
        currentPosition === lastSavedPositionRef.current &&
        nextCompleted === lastSavedCompletedRef.current;

      if (!options?.force && isUnchanged) {
        return;
      }

      setIsSaving(true);
      const response = await saveLessonProgress(lesson.id, {
        positionSeconds: currentPosition,
        completed: nextCompleted
      });

      if (!response) {
        setSaveMessage("保存失败，请重试");
        setIsSaving(false);
        return;
      }

      setPositionSeconds(response.positionSeconds);
      setCompleted(response.completed);
      setCourseProgress(response.courseProgress);
      setSaveMessage(`最近保存：${new Date(response.savedAt).toLocaleTimeString("zh-CN")}`);
      setIsSaving(false);
      lastSavedPositionRef.current = response.positionSeconds;
      lastSavedCompletedRef.current = response.completed;
    },
    [lesson.id, lesson.totalSeconds]
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      void persistProgress();
    }, lesson.autoSaveIntervalSeconds * 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [lesson.autoSaveIntervalSeconds, persistProgress]);

  useEffect(() => {
    const onBeforeUnload = () => {
      void persistProgress({ force: true });
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        void persistProgress({ force: true });
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [persistProgress]);

  return (
    <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
      <article className="rounded-3xl border border-[color:var(--line)] bg-white p-6">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge text={`${contentTypeLabel(lesson.contentType)}章节`} tone="info" />
          <StatusBadge text={completed ? "已完成" : "自动保存开启"} tone={completed ? "success" : "default"} />
        </div>
        <h2 className="mt-3 text-2xl font-semibold text-slate-800">{lesson.title}</h2>
        <div className="mt-4 flex aspect-video items-center justify-center rounded-2xl bg-slate-900 text-slate-200">
          {lesson.content}
        </div>
        <div className="mt-4 rounded-2xl bg-[color:var(--surface-muted)] p-4 text-sm text-slate-600">
          学习记录每 {lesson.autoSaveIntervalSeconds} 秒自动保存一次。离开页面时会触发额外保存。
        </div>
        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-teal-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
          <span>
            当前进度：{Math.round(positionSeconds)} / {lesson.totalSeconds} 秒（{progressPercent}%）
          </span>
          <span>{isSaving ? "保存中..." : saveMessage}</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            onClick={() => setPositionSeconds((prev) => Math.max(0, prev - 30))}
          >
            后退 30 秒
          </button>
          <button
            type="button"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            onClick={() =>
              setPositionSeconds((prev) => Math.min(lesson.totalSeconds, prev + 30))
            }
          >
            前进 30 秒
          </button>
          <button
            type="button"
            className="rounded-xl bg-brand-500 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-600"
            onClick={() => void persistProgress({ force: true })}
          >
            立即保存
          </button>
          <button
            type="button"
            className="rounded-xl bg-accent-500 px-3 py-2 text-sm font-semibold text-white hover:bg-accent-600"
            onClick={() => void persistProgress({ force: true, markCompleted: true })}
          >
            标记本节完成
          </button>
        </div>
      </article>

      <article className="rounded-3xl border border-[color:var(--line)] bg-white p-6">
        <h3 className="text-xl font-semibold text-slate-800">章节导航</h3>
        <ul className="mt-4 space-y-2 text-sm text-slate-600">
          <li className="rounded-xl bg-brand-50 px-3 py-2 text-brand-700">{lesson.title}</li>
        </ul>
        <div className="mt-4 grid gap-2">
          {lesson.previousLessonId ? (
            <Link
              href={`/lessons/${lesson.previousLessonId}` as Route}
              className="rounded-xl border border-slate-200 px-3 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              上一节
            </Link>
          ) : null}
          {lesson.nextLessonId ? (
            <Link
              href={`/lessons/${lesson.nextLessonId}` as Route}
              className="rounded-xl bg-brand-500 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-brand-600"
            >
              下一节
            </Link>
          ) : null}
          <Link
            href={`/courses/${lesson.courseId}` as Route}
            className="rounded-xl border border-brand-200 px-3 py-2 text-center text-sm font-medium text-brand-700 hover:bg-brand-50"
          >
            返回课程
          </Link>
        </div>
        <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
          {courseProgress !== null
            ? `课程总进度：${courseProgress}%`
            : "完成打点后可在这里看到课程总进度变化。"}
        </div>
      </article>
    </section>
  );
}

function contentTypeLabel(type: LessonDetail["contentType"]) {
  if (type === "video") {
    return "视频";
  }
  if (type === "article") {
    return "图文";
  }
  if (type === "pdf") {
    return "PDF";
  }
  return "测验";
}
