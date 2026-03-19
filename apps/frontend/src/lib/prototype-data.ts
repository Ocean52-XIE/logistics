export type StatusTone = "default" | "info" | "success" | "warning" | "danger";

export interface NavItem {
  href: string;
  label: string;
}

export interface AdminNavGroup {
  label: string;
  items: NavItem[];
}

export interface Metric {
  label: string;
  value: string;
  hint: string;
  tone?: StatusTone;
}

export interface CourseItem {
  id: string;
  title: string;
  category: string;
  duration: string;
  progress: number;
  status: "必修" | "选修";
  dueDate: string;
}

export interface TimelineItem {
  id: string;
  title: string;
  detail: string;
  progress: number;
  status: "进行中" | "未开始" | "已完成";
}

export interface NotificationItem {
  id: string;
  title: string;
  content: string;
  time: string;
  pinned?: boolean;
  unread?: boolean;
}

export const employeeNav: NavItem[] = [
  { href: "/dashboard", label: "首页" },
  { href: "/learning-paths", label: "学习路径" },
  { href: "/courses", label: "课程中心" },
  { href: "/exams", label: "在线考试" },
  { href: "/knowledge-base", label: "知识库" },
  { href: "/certifications", label: "岗位认证" },
  { href: "/my-progress", label: "我的进度" },
  { href: "/notifications", label: "通知中心" },
  { href: "/profile", label: "个人中心" }
];

export const adminNavGroups: AdminNavGroup[] = [
  {
    label: "运营总览",
    items: [{ href: "/admin", label: "仪表盘" }]
  },
  {
    label: "内容",
    items: [
      { href: "/admin/courses", label: "课程管理" },
      { href: "/admin/lessons", label: "章节管理" },
      { href: "/admin/question-bank", label: "题库管理" }
    ]
  },
  {
    label: "计划",
    items: [
      { href: "/admin/learning-paths", label: "学习路径" },
      { href: "/admin/training-plans", label: "培训计划" },
      { href: "/admin/notices", label: "通知发布" }
    ]
  },
  {
    label: "执行",
    items: [
      { href: "/admin/users", label: "员工管理" },
      { href: "/admin/organizations", label: "组织管理" },
      { href: "/admin/exams", label: "考试安排" }
    ]
  },
  {
    label: "分析与治理",
    items: [
      { href: "/admin/reports", label: "报表分析" },
      { href: "/admin/audit-logs", label: "审计日志" },
      { href: "/admin/settings", label: "系统设置" }
    ]
  }
];

export const dashboardMetrics: Metric[] = [
  { label: "本周学习完成率", value: "74%", hint: "较上周 +6%", tone: "success" },
  { label: "待完成课程", value: "4", hint: "2 门即将到期", tone: "warning" },
  { label: "待参加考试", value: "1", hint: "仓储安全规范", tone: "info" },
  { label: "岗位认证进度", value: "2 / 3", hint: "差 1 项可上岗", tone: "default" }
];

export const todayTasks = [
  {
    id: "task-1",
    title: "继续学习《分拣中心标准作业》",
    tag: "课程",
    status: "进行中",
    dueDate: "03-22 18:00"
  },
  {
    id: "task-2",
    title: "参加《仓储安全规范》在线考试",
    tag: "考试",
    status: "待开始",
    dueDate: "03-23 16:30"
  },
  {
    id: "task-3",
    title: "复习 SOP《异常件处理流程》",
    tag: "SOP",
    status: "待开始",
    dueDate: "03-24 20:00"
  }
];

export const requiredCourses: CourseItem[] = [
  {
    id: "C-1001",
    title: "新员工通用入职流程",
    category: "入职必修",
    duration: "45 分钟",
    progress: 100,
    status: "必修",
    dueDate: "已完成"
  },
  {
    id: "C-1024",
    title: "仓配一体全链路基础",
    category: "岗位核心",
    duration: "90 分钟",
    progress: 62,
    status: "必修",
    dueDate: "截止 03-24"
  },
  {
    id: "C-1088",
    title: "异常件识别与处置 SOP",
    category: "风险控制",
    duration: "55 分钟",
    progress: 20,
    status: "必修",
    dueDate: "截止 03-27"
  },
  {
    id: "C-1203",
    title: "装卸设备操作规范",
    category: "设备安全",
    duration: "40 分钟",
    progress: 0,
    status: "选修",
    dueDate: "建议本月完成"
  }
];

export const learningPaths: TimelineItem[] = [
  {
    id: "LP-01",
    title: "新员工 7 天上岗路径",
    detail: "入职制度 -> SOP 基础 -> 安全规范 -> 上岗考核",
    progress: 68,
    status: "进行中"
  },
  {
    id: "LP-02",
    title: "分拣岗位强化路径",
    detail: "高频异常件 -> 条码规则 -> 质量抽检",
    progress: 30,
    status: "进行中"
  },
  {
    id: "LP-03",
    title: "班组长管理路径",
    detail: "排班协同 -> 指标看板 -> 风险复盘",
    progress: 0,
    status: "未开始"
  }
];

export const examList = [
  {
    id: "EX-301",
    name: "仓储安全规范考试",
    duration: "40 分钟",
    questions: 35,
    time: "03-23 16:30",
    status: "待参加"
  },
  {
    id: "EX-284",
    name: "订单履约流程考试",
    duration: "30 分钟",
    questions: 25,
    time: "03-16 10:00",
    status: "已完成 88 分"
  }
];

export const knowledgeCategories = [
  "全部",
  "收货入库",
  "分拣出库",
  "异常处理",
  "客服协同",
  "安全生产"
];

export const hotSops = [
  "到仓异常件闭环处理",
  "生鲜温控巡检规范",
  "签收争议工单处理指引",
  "分拨中心扫码失败处理"
];

export const notifications: NotificationItem[] = [
  {
    id: "N-1",
    title: "【重要】仓储安全规范考试安排",
    content: "3 月 23 日 16:30 开考，请提前 10 分钟进入考试页面。",
    time: "今天 09:20",
    pinned: true,
    unread: true
  },
  {
    id: "N-2",
    title: "培训计划更新：分拣岗位补充课程",
    content: "新增《异常件识别与处置 SOP》必修要求，请在本周完成。",
    time: "昨天 18:40",
    unread: true
  },
  {
    id: "N-3",
    title: "系统提示：你的学习进度已同步",
    content: "最近一次学习记录保存成功，可在“我的进度”查看明细。",
    time: "昨天 11:03"
  }
];

export const adminDashboardMetrics: Metric[] = [
  { label: "总员工数", value: "1,286", hint: "本月新增 37 人" },
  { label: "在训员工数", value: "642", hint: "覆盖率 49.9%" },
  { label: "本周完成率", value: "78%", hint: "较上周 +4%", tone: "success" },
  { label: "首考通过率", value: "84%", hint: "目标 85%", tone: "warning" },
  { label: "逾期未完成人数", value: "19", hint: "需重点跟进", tone: "danger" },
  { label: "风险组织", value: "3", hint: "超阈值预警", tone: "danger" }
];

export interface AdminSectionConfig {
  title: string;
  subtitle: string;
  filters: string[];
  actions: string[];
  tableColumns: string[];
  tableRows: string[][];
}

export const adminSections: Record<string, AdminSectionConfig> = {
  users: {
    title: "员工管理",
    subtitle: "查看账号状态、学习完成度和考试安排。",
    filters: ["组织", "岗位", "学习状态"],
    actions: ["批量导入", "分配培训计划", "导出名单"],
    tableColumns: ["姓名", "工号", "组织", "岗位", "课程完成率", "状态"],
    tableRows: [
      ["李晨", "EMP-10029", "华东仓", "分拣员", "88%", "在训"],
      ["王萌", "EMP-10311", "华南仓", "质检员", "61%", "在训"],
      ["赵楠", "EMP-10278", "华北仓", "班组长", "100%", "已达标"]
    ]
  },
  organizations: {
    title: "组织管理",
    subtitle: "组织架构、培训覆盖率与风险组织识别。",
    filters: ["区域", "组织层级", "风险等级"],
    actions: ["新增组织", "批量调整负责人", "导出组织画像"],
    tableColumns: ["组织名称", "负责人", "员工数", "在训人数", "完成率", "风险等级"],
    tableRows: [
      ["华东仓", "周航", "382", "196", "81%", "低"],
      ["华南仓", "吴昕", "341", "188", "76%", "中"],
      ["华北仓", "郭峰", "275", "154", "69%", "高"]
    ]
  },
  courses: {
    title: "课程管理",
    subtitle: "课程目录、章节结构与发布状态管理。",
    filters: ["课程类型", "适用岗位", "发布状态"],
    actions: ["新建课程", "导入内容", "版本对比"],
    tableColumns: ["课程名称", "类型", "适用岗位", "章节数", "最近更新", "状态"],
    tableRows: [
      ["仓配一体全链路基础", "必修", "新员工", "8", "03-18", "已发布"],
      ["异常件识别与处置 SOP", "必修", "分拣员", "6", "03-17", "待审核"],
      ["客服协同处理流程", "选修", "客服", "5", "03-14", "已发布"]
    ]
  },
  lessons: {
    title: "章节管理",
    subtitle: "统一管理视频、图文、PDF 章节及完成打点。",
    filters: ["内容类型", "所属课程", "是否必修"],
    actions: ["创建章节", "批量排序", "复制到课程"],
    tableColumns: ["章节名称", "所属课程", "类型", "预计时长", "完成条件", "状态"],
    tableRows: [
      ["分拣流程总览", "仓配一体全链路基础", "视频", "12 分钟", "观看 90%", "启用"],
      ["异常件判定标准", "异常件识别与处置 SOP", "图文", "8 分钟", "阅读到底", "启用"],
      ["仓储安全检查清单", "仓储安全规范", "PDF", "10 分钟", "下载确认", "草稿"]
    ]
  },
  "question-bank": {
    title: "题库管理",
    subtitle: "按知识点维护题目并监控失分情况。",
    filters: ["题型", "难度", "知识点"],
    actions: ["新增题目", "批量导入", "失分分析"],
    tableColumns: ["题目", "题型", "知识点", "难度", "最近答对率", "状态"],
    tableRows: [
      ["异常件处理第一步是什么？", "单选", "异常处理", "中", "72%", "启用"],
      ["以下哪些属于安全隐患？", "多选", "安全生产", "中", "66%", "启用"],
      ["判断题：装卸可不佩戴护具。", "判断", "安全生产", "低", "91%", "启用"]
    ]
  },
  exams: {
    title: "考试安排",
    subtitle: "管理考试场次、对象和交卷结果。",
    filters: ["考试状态", "组织", "时间范围"],
    actions: ["发布考试", "调整对象", "导出成绩"],
    tableColumns: ["考试名称", "对象范围", "开考时间", "时长", "参考人数", "通过率"],
    tableRows: [
      ["仓储安全规范考试", "华东仓-分拣员", "03-23 16:30", "40 分钟", "126", "84%"],
      ["订单履约流程考试", "客服中心", "03-20 10:00", "30 分钟", "89", "87%"],
      ["班组长管理测评", "全国班组长", "03-26 14:00", "45 分钟", "62", "79%"]
    ]
  },
  "learning-paths": {
    title: "学习路径管理",
    subtitle: "设计岗位成长路径并配置分阶段能力目标。",
    filters: ["岗位", "路径状态", "版本"],
    actions: ["新建路径", "复制版本", "查看覆盖率"],
    tableColumns: ["路径名称", "岗位", "阶段数", "关联课程", "启用版本", "状态"],
    tableRows: [
      ["新员工 7 天上岗路径", "新员工", "4", "12", "v3", "启用"],
      ["分拣岗位强化路径", "分拣员", "3", "8", "v2", "启用"],
      ["班组长管理路径", "班组长", "5", "15", "v1", "灰度"]
    ]
  },
  "training-plans": {
    title: "培训计划管理",
    subtitle: "按季度和组织下发培训计划并跟踪执行。",
    filters: ["季度", "组织", "计划状态"],
    actions: ["新建计划", "批量下发", "执行复盘"],
    tableColumns: ["计划名称", "周期", "覆盖组织", "必修课程数", "当前完成率", "状态"],
    tableRows: [
      ["2026Q1 新员工入职计划", "2026Q1", "8 个组织", "6", "78%", "进行中"],
      ["2026Q1 安全专项计划", "2026Q1", "12 个组织", "4", "69%", "进行中"],
      ["2025Q4 班组长提升计划", "2025Q4", "全国", "5", "96%", "已完成"]
    ]
  },
  reports: {
    title: "报表分析",
    subtitle: "查看完成率、首考通过率和高频失分趋势。",
    filters: ["组织", "岗位", "时间范围"],
    actions: ["生成周报", "导出明细", "订阅邮件"],
    tableColumns: ["指标", "当前值", "环比", "同比", "风险提示", "建议动作"],
    tableRows: [
      ["课程完课率", "78%", "+4%", "+11%", "华北仓低于均值", "追加复训"],
      ["首考通过率", "84%", "+2%", "+8%", "安全题型偏低", "补充专项题库"],
      ["逾期率", "3.1%", "-0.6%", "-1.2%", "夜班组偏高", "优化排班学习窗口"]
    ]
  },
  notices: {
    title: "通知发布",
    subtitle: "按组织、岗位投放培训通知并追踪阅读率。",
    filters: ["发布状态", "接收范围", "优先级"],
    actions: ["新建通知", "置顶设置", "查看阅读数据"],
    tableColumns: ["标题", "范围", "优先级", "发布时间", "阅读率", "状态"],
    tableRows: [
      ["仓储安全规范考试安排", "华东仓-分拣员", "高", "03-19 09:00", "63%", "发布中"],
      ["分拣岗位补充课程通知", "全国分拣员", "中", "03-18 14:20", "71%", "发布中"],
      ["系统升级维护通知", "全员", "中", "03-15 17:00", "92%", "已结束"]
    ]
  },
  "audit-logs": {
    title: "审计日志",
    subtitle: "记录关键配置与发布行为，支持追溯。",
    filters: ["操作类型", "操作人", "时间范围"],
    actions: ["导出日志", "异常告警订阅", "查看详情"],
    tableColumns: ["时间", "操作人", "模块", "动作", "对象", "结果"],
    tableRows: [
      ["03-19 09:42", "周航", "课程管理", "发布课程", "C-1088", "成功"],
      ["03-19 09:15", "吴昕", "考试安排", "调整考试时间", "EX-301", "成功"],
      ["03-18 20:31", "郭峰", "通知发布", "置顶通知", "N-102", "成功"]
    ]
  },
  settings: {
    title: "系统设置",
    subtitle: "权限、通知策略、埋点和基础配置管理。",
    filters: ["配置类型", "环境", "更新时间"],
    actions: ["新建配置", "查看版本", "发布变更"],
    tableColumns: ["配置项", "当前值", "作用域", "最近修改人", "更新时间", "状态"],
    tableRows: [
      ["考试自动暂存间隔", "30 秒", "全局", "系统管理员", "03-10", "生效中"],
      ["课程逾期提醒阈值", "48 小时", "培训计划", "李思思", "03-12", "生效中"],
      ["首页任务埋点开关", "开启", "员工端", "系统管理员", "03-08", "生效中"]
    ]
  }
};
