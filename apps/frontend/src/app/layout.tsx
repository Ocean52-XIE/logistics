import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "物流培训平台原型",
    template: "%s | 物流培训平台原型"
  },
  description: "基于前端设计文档实现的员工端与管理端界面原型"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
