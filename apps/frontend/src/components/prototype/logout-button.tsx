"use client";

import { useRouter } from "next/navigation";
import { clearAuthState } from "@/lib/auth-token";

interface LogoutButtonProps {
  className: string;
  label?: string;
}

export function LogoutButton({
  className,
  label = "退出登录"
}: LogoutButtonProps) {
  const router = useRouter();

  const onLogout = () => {
    clearAuthState();
    router.replace("/login");
    router.refresh();
  };

  return (
    <button type="button" className={className} onClick={onLogout}>
      {label}
    </button>
  );
}
