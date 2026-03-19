# Logistics Training Platform

物流公司员工培训平台项目骨架，采用 `npm workspaces` 管理前后端工程。

## 目录结构

```txt
apps/
  frontend/   Next.js 员工端/管理端前端
  backend/    NestJS API 服务
packages/
  shared/     前后端共享类型定义
docs/         产品与技术设计文档
```

## 快速开始

1. 安装依赖

```bash
npm install
```

2. 启动前后端

```bash
npm run dev
```

默认地址：

- 前端：`http://localhost:3000`
- 后端：`http://localhost:4000/api/v1`

## 常用命令

- `npm run dev`
- `npm run dev:frontend`
- `npm run dev:backend`
- `npm run build`
- `npm run typecheck`

