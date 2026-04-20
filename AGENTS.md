# PetTrust - 人宠互信交流系统

## 项目概览
- **项目名称**: PetTrust
- **项目类型**: 基于Next.js的全栈Web应用
- **核心功能**: 人宠互信交流系统，为流浪动物领养提供全周期信任建立与监护服务

## 技术栈
- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **Database**: Supabase (PostgreSQL)
- **UI Components**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **AI Integration**: coze-coding-dev-sdk

## 目录结构
```
├── src/
│   ├── app/                    # 页面路由与布局
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # 认证相关API
│   │   │   ├── pets/          # 宠物管理API
│   │   │   ├── contracts/      # 合同管理API
│   │   │   ├── followups/      # 回访任务API
│   │   │   ├── checkins/       # 互动打卡API
│   │   │   └── ai/            # AI分析API
│   │   ├── dashboard/          # 仪表盘页面
│   │   ├── login/             # 登录页面
│   │   └── page.tsx           # 首页
│   ├── components/ui/          # Shadcn UI 组件库
│   ├── hooks/                  # 自定义 Hooks
│   ├── lib/                    # 工具库
│   └── storage/database/       # 数据库相关
│       ├── shared/schema.ts   # 数据库Schema定义
│       └── supabase-client.ts # Supabase客户端
├── scripts/                    # 构建与启动脚本
└── drizzle.config.ts          # Drizzle ORM配置
```

## 数据库表结构
1. **users** - 用户表（领养人、机构管理员）
2. **pets** - 宠物表
3. **pet_medical_records** - 宠物医疗记录表
4. **interaction_plans** - 互动计划表
5. **checkins** - 互动打卡表
6. **contracts** - 领养合同表
7. **followup_tasks** - 回访任务表
8. **followup_feedbacks** - 回访反馈表
9. **ai_analysis_records** - AI分析记录表
10. **favorites** - 收藏表
11. **messages** - 消息表

## API接口清单

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/me` - 获取当前用户信息

### 宠物管理
- `GET /api/pets` - 获取宠物列表
- `GET /api/pets/[id]` - 获取宠物详情
- `POST /api/pets` - 创建宠物
- `PUT /api/pets/[id]` - 更新宠物信息

### 合同管理
- `GET /api/contracts` - 获取合同列表
- `GET /api/contracts/[id]` - 获取合同详情
- `POST /api/contracts` - 创建合同
- `PUT /api/contracts/[id]` - 更新合同状态

### 回访管理
- `GET /api/followups` - 获取回访任务列表
- `POST /api/followups` - 提交回访反馈
- `GET /api/followups/pending` - 获取待回访任务

### 互动打卡
- `GET /api/checkins` - 获取打卡记录
- `POST /api/checkins` - 创建打卡记录

### AI分析
- `POST /api/ai/analyze` - AI健康检测
- `POST /api/ai/abuse-detection` - 虐待检测

## 开发命令
```bash
# 安装依赖
pnpm install

# 开发环境启动
pnpm dev

# 构建生产版本
pnpm build

# 启动生产环境
pnpm start

# 代码检查
pnpm lint
pnpm ts-check
```

## 环境变量
- `DEPLOY_RUN_PORT` - 服务监听端口（默认5000）
- `COZE_PROJECT_DOMAIN_DEFAULT` - 对外访问域名
- 数据库连接通过 Supabase 集成

## 数据库同步
数据库表通过以下SQL脚本创建，位于 `/workspace/projects/src/storage/database/shared/schema.ts`

如需手动同步数据库，使用：
```bash
pnpm exec drizzle-kit push --force --config=./src/storage/database/drizzle.config.ts
```
