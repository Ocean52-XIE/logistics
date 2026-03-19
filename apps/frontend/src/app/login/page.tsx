"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { LoginResponse, UserProfile } from "@logistics/shared";
import {
  API_BASE_URL,
  clearAuthState,
  getBrowserAccessToken,
  saveAccessToken,
  saveUserProfile
} from "@/lib/auth-token";

export default function LoginPage() {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [username, setUsername] = useState("employee1");
  const [password, setPassword] = useState("123456");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const canSubmit = useMemo(
    () => isHydrated && !isSubmitting,
    [isHydrated, isSubmitting]
  );

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const token = getBrowserAccessToken();
    if (!token) {
      setIsCheckingSession(false);
      return;
    }

    void (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          },
          cache: "no-store"
        });

        if (!response.ok) {
          clearAuthState();
          return;
        }

        const user = (await response.json()) as UserProfile;
        if (cancelled) {
          return;
        }

        saveUserProfile(user);
        router.replace(
          resolvePostLoginRoute(user.role, getNextPathFromLocation()) as Route
        );
        router.refresh();
      } catch {
        clearAuthState();
      } finally {
        if (!cancelled) {
          setIsCheckingSession(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          password
        }),
        cache: "no-store"
      });

      if (!response.ok) {
        setErrorMessage(await readErrorMessage(response));
        return;
      }

      const payload = (await response.json()) as LoginResponse;
      saveAccessToken(payload.accessToken, payload.expiresIn);
      saveUserProfile(payload.user);
      router.replace(
        resolvePostLoginRoute(payload.user.role, getNextPathFromLocation()) as Route
      );
      router.refresh();
    } catch {
      setErrorMessage("登录失败，请检查网络后重试。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flow-bg flex min-h-screen items-center justify-center px-6 py-10">
      <div className="grid w-full max-w-5xl gap-6 rounded-[34px] border border-[color:var(--line)] bg-white/95 p-6 shadow-panel md:grid-cols-[1.1fr_0.9fr] md:p-8">
        <section className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-500 p-8 text-white">
          <p className="text-sm uppercase tracking-[0.24em] text-white/70">
            Employee Login
          </p>
          <h1 className="mt-3 text-4xl font-semibold">欢迎回到培训中枢</h1>
          <p className="mt-4 max-w-md leading-7 text-white/85">
            登录后会自动恢复你的学习进度、考试草稿和任务状态。
          </p>
          <div className="mt-7 space-y-2 text-sm text-white/85">
            <p>1. 员工账号：employee1 / 123456</p>
            <p>2. 管理员账号：admin1 / 123456</p>
            <p>3. 登录成功后会自动保存 token 并跳转</p>
          </div>
        </section>

        <section className="rounded-3xl border border-[color:var(--line)] bg-white p-6">
          <h2 className="text-2xl font-semibold text-slate-800">账号登录</h2>
          <p className="mt-2 text-sm text-slate-500">
            使用后端真实账号鉴权，登录态会自动持久化到浏览器。
          </p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-600">用户名</span>
              <input
                data-testid="login-username"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-brand-500"
                placeholder="例如 employee1"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                disabled={!isHydrated || isSubmitting}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-600">密码</span>
              <input
                data-testid="login-password"
                type="password"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-brand-500"
                placeholder="请输入密码"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                disabled={!isHydrated || isSubmitting}
              />
            </label>
            {errorMessage ? (
              <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">
                {errorMessage}
              </p>
            ) : null}
            <button
              data-testid="login-submit"
              type="submit"
              className="w-full rounded-xl bg-brand-500 px-4 py-3 font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!canSubmit}
            >
              {isCheckingSession
                ? "登录平台"
                : isSubmitting
                  ? "登录中..."
                  : "登录平台"}
            </button>
          </form>

          <div className="mt-5 flex gap-3 text-sm">
            <Link
              className="font-medium text-brand-600 hover:text-brand-700"
              href="/dashboard"
            >
              员工端预览
            </Link>
            <Link
              className="font-medium text-brand-600 hover:text-brand-700"
              href="/admin"
            >
              管理端预览
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function resolveHomeRoute(role: UserProfile["role"]) {
  if (role === "admin") {
    return "/admin";
  }
  return "/dashboard";
}

function resolvePostLoginRoute(
  role: UserProfile["role"],
  nextPath: string | null
) {
  const normalizedNextPath = normalizeNextPath(nextPath);
  if (!normalizedNextPath) {
    return resolveHomeRoute(role);
  }

  if (normalizedNextPath.startsWith("/admin") && role !== "admin") {
    return "/dashboard";
  }

  return normalizedNextPath;
}

function normalizeNextPath(nextPath: string | null): string | null {
  if (!nextPath) {
    return null;
  }

  if (!nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return null;
  }

  if (nextPath === "/login" || nextPath.startsWith("/login?")) {
    return null;
  }

  return nextPath;
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { message?: string };
    if (payload.message) {
      return payload.message;
    }
  } catch {
    return "登录失败，请确认用户名和密码。";
  }
  return "登录失败，请确认用户名和密码。";
}

function getNextPathFromLocation(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return new URL(window.location.href).searchParams.get("next");
}
