# 后端设计方案

## 1. 设计目标

后端需要支撑三件事：

1. 稳定承载员工学习、考试、内容访问和管理操作。
2. 清晰管理组织、岗位、课程、题库、学习记录之间的复杂关系。
3. 为后续扩展移动端、AI 助教、更多组织形态保留能力。

## 2. 技术选型

推荐方案：

- 应用框架：`NestJS`
- 语言：`TypeScript`
- 数据库：`PostgreSQL`
- 缓存与队列：`Redis`
- 文件存储：`MinIO` 或云厂商 `OSS/COS`
- 搜索：首版可用 PostgreSQL 全文检索，后续可扩展 `Elasticsearch`
- 文档：`Swagger / OpenAPI`
- 定时任务：`BullMQ` 或 `@nestjs/schedule`

选择原因：

- `NestJS` 模块化强，适合中后台系统和权限体系建设。
- `PostgreSQL` 适合关系型数据、统计分析和 JSON 扩展场景。
- `Redis` 可用于登录会话、缓存热点内容、考试暂存和异步任务。

## 3. 后端架构

首版建议采用模块化单体架构，而不是一开始拆微服务。

原因：

- 当前业务仍处于探索和快速迭代阶段。
- 培训、课程、考试、组织和报表之间关系紧密。
- 单体架构更便于团队快速交付与调试。

后端模块建议如下：

- 认证与用户模块
- 组织与岗位模块
- 权限与角色模块
- 课程模块
- 内容资源模块
- 知识库模块
- 题库与考试模块
- 学习路径模块
- 培训计划模块
- 学习记录模块
- 通知模块
- 报表模块
- 审计日志模块

## 4. 领域模型设计

### 4.1 核心实体

- `User`
- `Organization`
- `Position`
- `Role`
- `Permission`
- `Course`
- `Lesson`
- `LearningPath`
- `TrainingPlan`
- `Question`
- `QuestionOption`
- `Exam`
- `ExamAttempt`
- `LearningProgress`
- `KnowledgeArticle`
- `Notification`
- `Certificate`
- `AuditLog`

### 4.2 核心关系

- 一个用户属于一个组织，可兼任一个或多个岗位。
- 一个学习路径可关联多个课程。
- 一个培训计划可面向多个组织、岗位或用户。
- 一个考试可绑定一个课程或学习路径。
- 一个用户可有多次考试记录，但只保留最新成绩和最佳成绩用于不同报表。
- 一篇知识库文章可关联多个课程和岗位。

## 5. 核心模块设计

## 5.1 认证与用户模块

功能：

- 账号登录
- 单点登录预留
- 用户信息同步
- 账号启停
- 密码与登录安全

建议：

- 首版支持账号密码登录 + 短信或邮箱验证码可选能力。
- 若公司已有 HR 或 OA 系统，预留 SSO 对接能力。
- 使用 JWT Access Token + Refresh Token。

## 5.2 组织与岗位模块

功能：

- 组织架构维护
- 岗位字典维护
- 用户组织归属
- 岗位培训映射

建议：

- 组织支持树形结构，例如总部 > 区域 > 城市 > 仓库/站点。
- 培训计划可以按组织树向下继承。

## 5.3 课程模块

功能：

- 课程创建与编辑
- 章节管理
- 课程版本控制
- 发布与下线
- 岗位适用范围设置

课程内容类型建议支持：

- 富文本
- 视频
- PDF
- 图片图解
- 流程图
- 附件下载

完成规则建议支持：

- 仅浏览完成
- 学满时长完成
- 通过章节测验完成
- 全部章节完成

## 5.4 知识库模块

功能：

- SOP 文档管理
- 分类标签管理
- 全文搜索
- 内容版本追踪

知识库和课程既能独立存在，也应互相引用。

## 5.5 题库与考试模块

功能：

- 题库管理
- 试卷组卷
- 在线考试
- 自动判分
- 人工批改案例题
- 错题分析

题型建议支持：

- 单选题
- 多选题
- 判断题
- 填空题
- 简答题
- 案例题

考试能力建议：

- 固定试卷
- 随机抽题
- 限时考试
- 及格线设置
- 防重复提交
- 自动暂存
- 补考设置

## 5.6 学习路径模块

功能：

- 将多个课程、考试、知识库条目组织成一个学习计划
- 支持按顺序学习
- 支持前置条件
- 支持必修和选修

适用场景：

- 新员工 7 天培训路径
- 仓储岗位认证路径
- 调度员晋升路径

## 5.7 培训计划模块

功能：

- 按组织、岗位、员工定向发布培训任务
- 配置开始时间、截止时间、完成规则
- 自动提醒
- 逾期追踪

这是连接“内容”和“执行”的关键模块。

## 5.8 学习记录模块

功能：

- 记录课程学习时长
- 记录章节完成状态
- 记录考试结果
- 生成学习档案

需要特别注意：

- 学习进度记录不能只靠前端，需要服务端校验与归档。
- 视频学习时长应做合理防刷限制，例如最小播放时长和活跃检测。

## 5.9 报表模块

功能：

- 完成率统计
- 通过率统计
- 组织对比
- 岗位对比
- 课程效果分析
- 失分点分析

首版建议采用离线汇总 + 实时查询混合模式：

- 日常统计指标通过定时任务生成汇总表。
- 单个员工或单个课程的明细通过实时查询获取。

## 5.10 通知模块

功能：

- 系统通知
- 培训提醒
- 考试提醒
- 逾期通知
- 公告发布

发送渠道首版建议：

- 站内信
- 邮件

后续可扩展：

- 企业微信
- 钉钉
- 短信

## 5.11 审计日志模块

需要记录：

- 登录行为
- 课程发布与修改
- 题库编辑
- 权限变更
- 培训计划发布
- 人工改分操作

这样有助于内部追溯与管理合规。

## 6. 数据库设计

## 6.1 核心表建议

### 用户与权限

- `users`
- `organizations`
- `positions`
- `roles`
- `permissions`
- `user_roles`
- `role_permissions`
- `user_positions`

### 培训内容

- `courses`
- `course_versions`
- `lessons`
- `lesson_resources`
- `knowledge_articles`
- `knowledge_article_tags`
- `course_article_relations`

### 题库与考试

- `questions`
- `question_options`
- `question_tags`
- `exams`
- `exam_questions`
- `exam_attempts`
- `exam_answers`

### 执行与记录

- `learning_paths`
- `learning_path_items`
- `training_plans`
- `training_plan_assignments`
- `learning_progress`
- `lesson_progress`
- `certificates`
- `notifications`
- `user_notifications`

### 运营与审计

- `report_snapshots`
- `audit_logs`
- `operation_logs`

## 6.2 关键字段建议

### `courses`

- `id`
- `title`
- `summary`
- `cover_url`
- `status`
- `difficulty`
- `estimated_minutes`
- `version_no`
- `published_at`
- `created_by`
- `updated_by`

### `training_plans`

- `id`
- `name`
- `plan_type`
- `target_scope_type`
- `start_at`
- `end_at`
- `completion_rule`
- `status`

### `exam_attempts`

- `id`
- `exam_id`
- `user_id`
- `attempt_no`
- `score`
- `passed`
- `submitted_at`
- `duration_seconds`
- `status`

### `learning_progress`

- `id`
- `user_id`
- `course_id`
- `progress_percent`
- `completed`
- `last_lesson_id`
- `last_learned_at`

## 7. API 设计原则

- 使用 REST API，路径语义清晰。
- 统一返回结构和错误码。
- 所有列表接口支持分页、筛选、排序。
- 对管理操作保留审计信息。
- 使用 OpenAPI 自动生成接口文档。

统一响应示例：

```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

错误响应示例：

```json
{
  "code": 40001,
  "message": "exam already submitted",
  "data": null
}
```

## 8. API 示例

## 8.1 认证

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

## 8.2 员工端

- `GET /api/v1/dashboard/summary`
- `GET /api/v1/courses`
- `GET /api/v1/courses/:id`
- `POST /api/v1/lessons/:id/progress`
- `GET /api/v1/exams`
- `GET /api/v1/exams/:id`
- `POST /api/v1/exams/:id/start`
- `POST /api/v1/exam-attempts/:id/answers`
- `POST /api/v1/exam-attempts/:id/submit`
- `GET /api/v1/knowledge-articles`
- `GET /api/v1/my-progress`
- `GET /api/v1/notifications`

## 8.3 管理端

- `GET /api/v1/admin/users`
- `POST /api/v1/admin/users`
- `GET /api/v1/admin/courses`
- `POST /api/v1/admin/courses`
- `PUT /api/v1/admin/courses/:id`
- `POST /api/v1/admin/courses/:id/publish`
- `GET /api/v1/admin/questions`
- `POST /api/v1/admin/exams`
- `POST /api/v1/admin/training-plans`
- `GET /api/v1/admin/reports/overview`
- `GET /api/v1/admin/reports/course-effectiveness`

## 9. 权限设计

建议采用 `RBAC + 数据范围` 的双层权限模型。

### 9.1 角色示例

- 超级管理员
- 培训管理员
- 组织主管
- 普通员工
- 审核员

### 9.2 数据范围示例

- 全公司
- 所属组织
- 所属组织及下级
- 仅本人

例如：

- 培训管理员可查看全公司培训数据。
- 站点主管只能查看本站点员工记录。
- 员工只能查看自己的学习与考试数据。

## 10. 安全设计

- 密码加密存储，使用 `bcrypt` 或 `argon2`
- 登录限流与异常登录告警
- 上传文件类型与大小校验
- 防止越权访问
- 审计敏感操作
- Token 黑名单或失效策略
- 考试提交幂等控制
- 防重复答卷与数据篡改

## 11. 性能设计

- 热门课程、知识库文章走 Redis 缓存。
- 报表使用汇总表减少实时聚合压力。
- 题库查询与考试提交做好索引优化。
- 大文件分离存储，应用层只保存元数据。
- 长任务如通知批量发送、报表生成走异步队列。

## 12. 文件与媒体管理

建议文件中心统一管理：

- 视频文件
- PDF 手册
- 课程封面
- 试题附件
- 文章插图

元数据字段建议：

- 文件名
- 存储路径
- 文件大小
- MIME 类型
- 上传人
- 引用模块
- 病毒扫描状态

## 13. 日志与监控

建议接入以下可观测能力：

- 应用日志
- API 耗时监控
- 错误率监控
- 登录失败监控
- 队列积压监控
- 数据库慢查询监控

关键告警场景：

- 登录接口异常升高
- 考试提交失败率升高
- 存储服务异常
- 报表任务连续失败

## 14. 部署建议

环境划分：

- 开发环境
- 测试环境
- 预发环境
- 生产环境

部署组件：

- `frontend`
- `backend-api`
- `postgresql`
- `redis`
- `object-storage`
- `nginx`

生产建议：

- 使用 Docker 容器化部署
- 应用和数据库分机部署
- 定期备份数据库与文件
- 预留 CDN 和 WAF 能力

## 15. 扩展方向

平台稳定后可进一步扩展：

- AI 培训助教
- 智能错题推荐
- 语音讲解课程
- 小程序学习端
- 线下培训签到联动
- 与 HR 系统打通自动入转调离
