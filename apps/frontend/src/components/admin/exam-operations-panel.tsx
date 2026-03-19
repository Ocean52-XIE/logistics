"use client";

import { useMemo, useState, type FormEvent } from "react";
import type {
  AdminExamListItem,
  AdminQuestionBankItem,
  UserProfile
} from "@logistics/shared";
import { createAdminExam, createAdminRetakeExam, getAdminExams } from "@/lib/api";

interface ExamOperationsPanelProps {
  initialExams: AdminExamListItem[];
  users: UserProfile[];
  questions: AdminQuestionBankItem[];
}

export function ExamOperationsPanel({
  initialExams,
  users,
  questions
}: ExamOperationsPanelProps) {
  const [exams, setExams] = useState(initialExams);
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingRetake, setIsCreatingRetake] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("45");
  const [startTime, setStartTime] = useState("");
  const [passScore, setPassScore] = useState("80");
  const [instructions, setInstructions] = useState("请认真作答，提交后不可修改。");
  const [warningsText, setWarningsText] = useState("网络波动会自动暂存\n距离结束 5 分钟会提示");
  const [singleCount, setSingleCount] = useState("2");
  const [multipleCount, setMultipleCount] = useState("1");
  const [booleanCount, setBooleanCount] = useState("1");
  const [caseCount, setCaseCount] = useState("0");
  const [difficulty, setDifficulty] = useState<"" | "easy" | "medium" | "hard">("");
  const [knowledgeTagsText, setKnowledgeTagsText] = useState("");
  const [selectedAssigneeUserIds, setSelectedAssigneeUserIds] = useState<string[]>([]);

  const [retakeSourceExamId, setRetakeSourceExamId] = useState("");
  const [retakeStartTime, setRetakeStartTime] = useState("");
  const [retakeDuration, setRetakeDuration] = useState("");
  const [retakePassScore, setRetakePassScore] = useState("");
  const [retakeUserIds, setRetakeUserIds] = useState<string[]>([]);

  const nonAdminUsers = useMemo(() => {
    return users.filter((user) => user.role !== "admin");
  }, [users]);

  const nonRetakeExams = useMemo(() => {
    return exams.filter((exam) => !exam.isRetake);
  }, [exams]);

  const availableKnowledgeTags = useMemo(() => {
    return Array.from(new Set(questions.map((question) => question.knowledgeTag))).sort();
  }, [questions]);

  const refreshExams = async () => {
    const latest = await getAdminExams();
    if (latest) {
      setExams(latest);
    }
  };

  const onCreateExam = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isCreating) {
      return;
    }

    if (!startTime) {
      setMessage("请填写开考时间。");
      return;
    }

    const warnings = warningsText
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    const knowledgeTags = knowledgeTagsText
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    setIsCreating(true);
    setMessage(null);
    const created = await createAdminExam({
      name: name.trim(),
      durationMinutes: Number(durationMinutes),
      startTime: new Date(startTime).toISOString(),
      passScore: Number(passScore),
      instructions: instructions.trim(),
      warnings,
      assigneeUserIds: selectedAssigneeUserIds,
      rule: {
        singleCount: Number(singleCount),
        multipleCount: Number(multipleCount),
        booleanCount: Number(booleanCount),
        caseCount: Number(caseCount),
        difficulty: difficulty || undefined,
        knowledgeTags: knowledgeTags.length > 0 ? knowledgeTags : undefined
      }
    });
    setIsCreating(false);

    if (!created) {
      setMessage("组卷失败，请检查题库数量与规则。");
      return;
    }

    setExams((prev) => [created, ...prev]);
    setName("");
    setSelectedAssigneeUserIds([]);
    setKnowledgeTagsText("");
    setMessage(`考试 ${created.id} 创建成功。`);
  };

  const onCreateRetake = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isCreatingRetake) {
      return;
    }
    if (!retakeSourceExamId || !retakeStartTime || retakeUserIds.length === 0) {
      setMessage("请完整填写补考来源、时间和人员。");
      return;
    }

    setIsCreatingRetake(true);
    setMessage(null);
    const created = await createAdminRetakeExam(retakeSourceExamId, {
      userIds: retakeUserIds,
      startTime: new Date(retakeStartTime).toISOString(),
      durationMinutes: retakeDuration ? Number(retakeDuration) : undefined,
      passScore: retakePassScore ? Number(retakePassScore) : undefined
    });
    setIsCreatingRetake(false);

    if (!created) {
      setMessage("补考创建失败，请重试。");
      return;
    }

    await refreshExams();
    setRetakeUserIds([]);
    setRetakeDuration("");
    setRetakePassScore("");
    setMessage(`补考 ${created.examId} 已创建并指派 ${created.assigneeCount} 人。`);
  };

  return (
    <section className="space-y-5">
      <article className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
        <h2 className="text-2xl font-semibold text-white">随机组卷并发布考试</h2>
        <form className="mt-4 space-y-4" onSubmit={onCreateExam}>
          <div className="grid gap-3 md:grid-cols-4">
            <label className="block md:col-span-2">
              <span className="mb-1 block text-xs text-slate-400">考试名称</span>
              <input
                data-testid="admin-exam-name"
                className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-slate-400">时长（分钟）</span>
              <input
                data-testid="admin-exam-duration"
                type="number"
                min={1}
                className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
                value={durationMinutes}
                onChange={(event) => setDurationMinutes(event.target.value)}
                required
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-slate-400">及格分</span>
              <input
                data-testid="admin-exam-pass-score"
                type="number"
                min={1}
                className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
                value={passScore}
                onChange={(event) => setPassScore(event.target.value)}
                required
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-slate-400">开考时间</span>
              <input
                data-testid="admin-exam-start-time"
                type="datetime-local"
                className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                required
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-slate-400">难度</span>
              <select
                data-testid="admin-exam-difficulty"
                className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
                value={difficulty}
                onChange={(event) =>
                  setDifficulty(event.target.value as "" | "easy" | "medium" | "hard")
                }
              >
                <option value="">不限制</option>
                <option value="easy">简单</option>
                <option value="medium">中等</option>
                <option value="hard">困难</option>
              </select>
            </label>
            <label className="block md:col-span-2">
              <span className="mb-1 block text-xs text-slate-400">
                知识点（逗号分隔，可选）
              </span>
              <input
                data-testid="admin-exam-knowledge-tags"
                list="admin-exam-knowledge-tags-list"
                className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
                value={knowledgeTagsText}
                onChange={(event) => setKnowledgeTagsText(event.target.value)}
                placeholder="例如：异常处理,安全生产"
              />
              <datalist id="admin-exam-knowledge-tags-list">
                {availableKnowledgeTags.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </label>
            <label className="block md:col-span-4">
              <span className="mb-1 block text-xs text-slate-400">考试说明</span>
              <textarea
                data-testid="admin-exam-instructions"
                rows={2}
                className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
                value={instructions}
                onChange={(event) => setInstructions(event.target.value)}
                required
              />
            </label>
            <label className="block md:col-span-4">
              <span className="mb-1 block text-xs text-slate-400">
                风险提醒（每行一条）
              </span>
              <textarea
                data-testid="admin-exam-warnings"
                rows={2}
                className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
                value={warningsText}
                onChange={(event) => setWarningsText(event.target.value)}
                required
              />
            </label>
          </div>

          <div className="rounded-2xl border border-white/10 p-4">
            <p className="text-sm font-medium text-slate-200">题型配比</p>
            <div className="mt-3 grid gap-3 md:grid-cols-4">
              <NumberInput
                label="单选"
                value={singleCount}
                onChange={setSingleCount}
                testId="admin-exam-rule-single"
              />
              <NumberInput
                label="多选"
                value={multipleCount}
                onChange={setMultipleCount}
                testId="admin-exam-rule-multiple"
              />
              <NumberInput
                label="判断"
                value={booleanCount}
                onChange={setBooleanCount}
                testId="admin-exam-rule-boolean"
              />
              <NumberInput
                label="案例"
                value={caseCount}
                onChange={setCaseCount}
                testId="admin-exam-rule-case"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 p-4">
            <p className="text-sm font-medium text-slate-200">指派人员（可多选，不选则全员可见）</p>
            <div className="mt-2 max-h-40 space-y-2 overflow-auto pr-2 text-sm text-slate-300">
              {nonAdminUsers.map((user) => (
                <label key={user.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedAssigneeUserIds.includes(user.id)}
                    onChange={(event) => {
                      setSelectedAssigneeUserIds((prev) =>
                        event.target.checked
                          ? [...prev, user.id]
                          : prev.filter((id) => id !== user.id)
                      );
                    }}
                  />
                  <span>
                    {user.name} · {user.organizationName} · {user.role}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button
            data-testid="admin-exam-create"
            type="submit"
            disabled={isCreating}
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-60"
          >
            {isCreating ? "组卷中..." : "生成考试"}
          </button>
        </form>
      </article>

      <article className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
        <h3 className="text-xl font-semibold text-white">补考发起</h3>
        <form className="mt-4 space-y-4" onSubmit={onCreateRetake}>
          <div className="grid gap-3 md:grid-cols-4">
            <label className="block md:col-span-2">
              <span className="mb-1 block text-xs text-slate-400">来源考试</span>
              <select
                data-testid="admin-retake-source-exam"
                className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
                value={retakeSourceExamId}
                onChange={(event) => setRetakeSourceExamId(event.target.value)}
                required
              >
                <option value="">请选择</option>
                {nonRetakeExams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name} ({exam.id})
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-slate-400">补考时间</span>
              <input
                data-testid="admin-retake-start-time"
                type="datetime-local"
                className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
                value={retakeStartTime}
                onChange={(event) => setRetakeStartTime(event.target.value)}
                required
              />
            </label>
            <NumberInput
              label="补考时长（可选）"
              value={retakeDuration}
              onChange={setRetakeDuration}
              testId="admin-retake-duration"
              optional
            />
            <NumberInput
              label="补考及格分（可选）"
              value={retakePassScore}
              onChange={setRetakePassScore}
              testId="admin-retake-pass-score"
              optional
            />
          </div>

          <div className="rounded-2xl border border-white/10 p-4">
            <p className="text-sm font-medium text-slate-200">补考人员（必选）</p>
            <div className="mt-2 max-h-40 space-y-2 overflow-auto pr-2 text-sm text-slate-300">
              {nonAdminUsers.map((user) => (
                <label key={user.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={retakeUserIds.includes(user.id)}
                    onChange={(event) => {
                      setRetakeUserIds((prev) =>
                        event.target.checked
                          ? [...prev, user.id]
                          : prev.filter((id) => id !== user.id)
                      );
                    }}
                  />
                  <span>
                    {user.name} · {user.organizationName} · {user.role}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button
            data-testid="admin-retake-create"
            type="submit"
            disabled={isCreatingRetake}
            className="rounded-xl border border-brand-400 px-4 py-2 text-sm font-semibold text-brand-300 hover:bg-brand-500/20 disabled:opacity-60"
          >
            {isCreatingRetake ? "发起中..." : "发起补考"}
          </button>
        </form>

        {message ? <p className="mt-3 text-sm text-slate-300">{message}</p> : null}
      </article>

      <article className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
        <h3 className="text-xl font-semibold text-white">考试列表</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[940px] text-left text-sm text-slate-300">
            <thead className="text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="pb-2">考试</th>
                <th className="pb-2">开考时间</th>
                <th className="pb-2">题量</th>
                <th className="pb-2">及格分</th>
                <th className="pb-2">时长</th>
                <th className="pb-2">指派人数</th>
                <th className="pb-2">类型</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam.id} className="border-t border-white/10">
                  <td className="py-2">
                    <p className="font-medium text-white">{exam.name}</p>
                    <p className="text-xs text-slate-400">{exam.id}</p>
                  </td>
                  <td className="py-2">{new Date(exam.startTime).toLocaleString("zh-CN")}</td>
                  <td className="py-2">{exam.questionCount}</td>
                  <td className="py-2">{exam.passScore}</td>
                  <td className="py-2">{exam.durationMinutes} 分钟</td>
                  <td className="py-2">{exam.assigneeCount}</td>
                  <td className="py-2">
                    {exam.isRetake
                      ? `补考${exam.sourceExamId ? `（来源 ${exam.sourceExamId}）` : ""}`
                      : "常规"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {exams.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">暂无考试。</p>
          ) : null}
        </div>
      </article>
    </section>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  testId,
  optional = false
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  testId: string;
  optional?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-slate-400">{label}</span>
      <input
        data-testid={testId}
        type="number"
        min={0}
        className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={!optional}
      />
    </label>
  );
}
