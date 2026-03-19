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

2. 配置环境变量

```bash
cp .env.example .env
cp apps/backend/.env.example apps/backend/.env
```

3. 初始化数据库（首次）

```bash
npm run prisma:migrate -w @logistics/backend -- --name init
npm run db:seed -w @logistics/backend
```

4. 启动前后端

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
- `npm run prisma:migrate -w @logistics/backend -- --name <migration-name>`
- `npm run db:seed -w @logistics/backend`

## 默认账号（seed）

- 员工：`employee1 / 123456`
- 管理员：`admin1 / 123456`

## 鉴权调试

1. 获取 access token：

```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"employee1","password":"123456"}'
```

2. 如果希望前端直接读取真实后端数据，可把返回的 token 填到 `.env`：

```bash
NEXT_PUBLIC_API_ACCESS_TOKEN=<your-access-token>
```
