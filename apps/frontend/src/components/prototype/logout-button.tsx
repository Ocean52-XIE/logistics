"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { clearAuthState } from "@/lib/auth-token";

interface LogoutButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  label?: string;
  redirectTo?: Route;
}

export function LogoutButton({
  label = "退出登录",
  className,
  disabled,
  redirectTo = "/login",
  ...rest
}: LogoutButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const isDisabled = Boolean(disabled) || isPending;

  const handleLogout = () => {
    if (isDisabled) {
      return;
    }

    setIsPending(true);
    clearAuthState();
    router.replace(redirectTo);
    router.refresh();
  };

  return (
    <button
      {...rest}
      type="button"
      className={className}
      disabled={isDisabled}
      aria-busy={isPending}
      onClick={handleLogout}
    >
      {isPending ? "正在退出..." : label}
    </button>
  );
}
