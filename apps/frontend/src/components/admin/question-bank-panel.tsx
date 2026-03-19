"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { AdminQuestionBankItem } from "@logistics/shared";
import {
  createAdminQuestion,
  getAdminQuestionBank,
  updateAdminQuestionStatus
} from "@/lib/api";

interface QuestionBankPanelProps {
  initialQuestions: AdminQuestionBankItem[];
}

type QuestionTypeFilter = "single" | "multiple" | "boolean" | "case" | "";
type QuestionDifficultyFilter = "easy" | "medium" | "hard" | "";

export function QuestionBankPanel({ initialQuestions }: QuestionBankPanelProps) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [statusUpdatingQuestionId, setStatusUpdatingQuestionId] = useState<string | null>(
    null
  );
  const [message, setMessage] = useState<string | null>(null);

  const [typeFilter, setTypeFilter] = useState<QuestionTypeFilter>("");
  const [difficultyFilter, setDifficultyFilter] =
    useState<QuestionDifficultyFilter>("");
  const [knowledgeTagFilter, setKnowledgeTagFilter] = useState("");

  const [stem, setStem] = useState("");
  const [type, setType] = useState<"single" | "multiple" | "boolean" | "case">("single");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [knowledgeTag, setKnowledgeTag] = useState("");
  const [optionsText, setOptionsText] = useState("选项 A\n选项 B");
  const [correctOptionIdsText, setCorrectOptionIdsText] = useState("A");

  const knowledgeTagOptions = useMemo(() => {
    return Array.from(new Set(questions.map((item) => item.knowledgeTag))).sort();
  }, [questions]);

  const onFilter = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) {
      return;
    }

    setMessage(null);
    setIsLoading(true);
    const response = await getAdminQuestionBank({
      type: typeFilter || undefined,
      difficulty: difficultyFilter || undefined,
      knowledgeTag: knowledgeTagFilter || undefined
    });
    setIsLoading(false);

    if (!response) {
      setMessage("题库查询失败，请稍后重试。");
      return;
    }

    setQuestions(response);
    setMessage(`已加载 ${response.length} 道题目。`);
  };

  const onCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isCreating) {
      return;
    }

    const options = optionsText
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    const correctOptionIds = correctOptionIdsText
      .split(",")
      .map((item) => item.trim().toUpperCase())
      .filter((item) => item.length > 0);

    if (options.length < 2) {
      setMessage("至少需要 2 个选项。");
      return;
    }
    if (knowledgeTag.trim().length === 0) {
      setMessage("知识点不能为空。");
      return;
    }

    setMessage(null);
    setIsCreating(true);
    const created = await createAdminQuestion({
      stem: stem.trim(),
      type,
      options,
      correctOptionIds,
      knowledgeTag: knowledgeTag.trim(),
      difficulty
    });
    setIsCreating(false);

    if (!created) {
      setMessage("题目创建失败，请检查输入。");
      return;
    }

    setQuestions((prev) => [created, ...prev]);
    setStem("");
    setKnowledgeTag("");
    setOptionsText("选项 A\n选项 B");
    setCorrectOptionIdsText("A");
    setMessage(`题目 ${created.id} 创建成功。`);
  };

  const onToggleStatus = async (question: AdminQuestionBankItem) => {
    if (statusUpdatingQuestionId) {
      return;
    }
    setStatusUpdatingQuestionId(question.id);
    setMessage(null);
    const updated = await updateAdminQuestionStatus(question.id, {
      isActive: !question.isActive
    });
    setStatusUpdatingQuestionId(null);

    if (!updated) {
      setMessage("题目状态更新失败，请重试。");
      return;
    }

    setQuestions((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
    setMessage(`题目 ${updated.id} 已${updated.isActive ? "启用" : "停用"}。`);
  };

  return (
    <section className="space-y-5">
      <article className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
        <h2 className="text-2xl font-semibold text-white">新建题目</h2>
        <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={onCreate}>
          <label className="block md:col-span-2">
            <span className="mb-1 block text-xs text-slate-400">题干</span>
            <textarea
              data-testid="admin-question-stem"
              rows={3}
              className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
              value={stem}
              onChange={(event) => setStem(event.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-400">题型</span>
            <select
              data-testid="admin-question-type"
              className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
              value={type}
              onChange={(event) =>
                setType(event.target.value as "single" | "multiple" | "boolean" | "case")
              }
            >
              <option value="single">单选</option>
              <option value="multiple">多选</option>
              <option value="boolean">判断</option>
              <option value="case">案例</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-400">难度</span>
            <select
              data-testid="admin-question-difficulty"
              className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
              value={difficulty}
              onChange={(event) =>
                setDifficulty(event.target.value as "easy" | "medium" | "hard")
              }
            >
              <option value="easy">简单</option>
              <option value="medium">中等</option>
              <option value="hard">困难</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-400">知识点</span>
            <input
              data-testid="admin-question-knowledge-tag"
              className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
              value={knowledgeTag}
              onChange={(event) => setKnowledgeTag(event.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-400">
              选项（每行一个，按 A/B/C... 自动编号）
            </span>
            <textarea
              data-testid="admin-question-options"
              rows={4}
              className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
              value={optionsText}
              onChange={(event) => setOptionsText(event.target.value)}
              required
            />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-1 block text-xs text-slate-400">
              正确选项 ID（逗号分隔，如 A,B）
            </span>
            <input
              data-testid="admin-question-correct-option-ids"
              className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
              value={correctOptionIdsText}
              onChange={(event) => setCorrectOptionIdsText(event.target.value)}
              required
            />
          </label>
          <div className="md:col-span-2">
            <button
              data-testid="admin-question-create"
              type="submit"
              disabled={isCreating}
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-60"
            >
              {isCreating ? "创建中..." : "创建题目"}
            </button>
            {message ? <p className="mt-2 text-sm text-slate-300">{message}</p> : null}
          </div>
        </form>
      </article>

      <article className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
        <h3 className="text-xl font-semibold text-white">题库筛选</h3>
        <form className="mt-4 grid gap-3 md:grid-cols-4" onSubmit={onFilter}>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-400">题型</span>
            <select
              data-testid="admin-question-filter-type"
              className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value as QuestionTypeFilter)}
            >
              <option value="">全部</option>
              <option value="single">单选</option>
              <option value="multiple">多选</option>
              <option value="boolean">判断</option>
              <option value="case">案例</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-400">难度</span>
            <select
              data-testid="admin-question-filter-difficulty"
              className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
              value={difficultyFilter}
              onChange={(event) =>
                setDifficultyFilter(event.target.value as QuestionDifficultyFilter)
              }
            >
              <option value="">全部</option>
              <option value="easy">简单</option>
              <option value="medium">中等</option>
              <option value="hard">困难</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-400">知识点</span>
            <input
              data-testid="admin-question-filter-knowledge-tag"
              list="knowledge-tag-options"
              className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
              value={knowledgeTagFilter}
              onChange={(event) => setKnowledgeTagFilter(event.target.value)}
            />
            <datalist id="knowledge-tag-options">
              {knowledgeTagOptions.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </label>
          <div className="flex items-end">
            <button
              data-testid="admin-question-filter-submit"
              type="submit"
              disabled={isLoading}
              className="rounded-xl border border-brand-400 px-4 py-2 text-sm font-semibold text-brand-300 hover:bg-brand-500/20 disabled:opacity-60"
            >
              {isLoading ? "查询中..." : "筛选"}
            </button>
          </div>
        </form>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm text-slate-300">
            <thead className="text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="pb-2">题目</th>
                <th className="pb-2">题型</th>
                <th className="pb-2">知识点</th>
                <th className="pb-2">难度</th>
                <th className="pb-2">选项数</th>
                <th className="pb-2">状态</th>
                <th className="pb-2">创建时间</th>
                <th className="pb-2">操作</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((question) => (
                <tr key={question.id} className="border-t border-white/10">
                  <td className="py-2">
                    <p className="font-medium text-white">{question.stem}</p>
                    <p className="text-xs text-slate-400">{question.id}</p>
                  </td>
                  <td className="py-2">{typeLabel(question.type)}</td>
                  <td className="py-2">{question.knowledgeTag}</td>
                  <td className="py-2">{difficultyLabel(question.difficulty)}</td>
                  <td className="py-2">{question.optionCount}</td>
                  <td className="py-2">{question.isActive ? "启用" : "停用"}</td>
                  <td className="py-2">
                    {new Date(question.createdAt).toLocaleString("zh-CN")}
                  </td>
                  <td className="py-2">
                    <button
                      data-testid={`admin-question-toggle-status-${question.id}`}
                      type="button"
                      disabled={statusUpdatingQuestionId === question.id}
                      className="rounded-lg border border-brand-400 px-2.5 py-1 text-xs text-brand-300 hover:bg-brand-500/20 disabled:opacity-60"
                      onClick={() => void onToggleStatus(question)}
                    >
                      {statusUpdatingQuestionId === question.id
                        ? "更新中..."
                        : question.isActive
                          ? "停用"
                          : "启用"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {questions.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">当前筛选条件下暂无题目。</p>
          ) : null}
        </div>
      </article>
    </section>
  );
}

function typeLabel(type: "single" | "multiple" | "boolean" | "case") {
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

function difficultyLabel(difficulty: "easy" | "medium" | "hard") {
  if (difficulty === "easy") {
    return "简单";
  }
  if (difficulty === "medium") {
    return "中等";
  }
  return "困难";
}
