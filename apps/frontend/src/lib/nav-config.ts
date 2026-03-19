export interface ShellNavItem {
  href: string;
  label: string;
  upcoming?: boolean;
}

export interface ShellNavGroup {
  label: string;
  items: ShellNavItem[];
}

export const employeeNav: ShellNavItem[] = [
  { href: "/dashboard", label: "首页" },
  { href: "/courses", label: "课程中心" },
  { href: "/exams", label: "在线考试" },
  { href: "/knowledge-base", label: "知识库" },
  { href: "/notifications", label: "通知中心" },
  { href: "/my-progress", label: "我的进度" }
];

export const adminNavGroups: ShellNavGroup[] = [
  {
    label: "运营总览",
    items: [{ href: "/admin", label: "仪表盘" }]
  },
  {
    label: "MVP 闭环",
    items: [
      { href: "/admin/courses", label: "课程管理" },
      { href: "/admin/training-plans", label: "培训计划" },
      { href: "/admin/reports", label: "报表概览" },
      { href: "/admin/users", label: "人员查看" }
    ]
  }
];
