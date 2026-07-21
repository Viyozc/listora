# Listora MVP — Next.js scaffold

Listora 的 MVP 骨架（Next.js App Router + TypeScript + Tailwind + Supabase + LLM）。
落地页静态站见上级目录 `../index.html`；本目录是 "AI 生成 + 订阅 + 用量" 的产品级实现，
在流量验证门槛（≥200 审计 + ≥50 订阅）达成后替代静态站。

## 目录结构
```
mvp/
├─ app/
│  ├─ layout.tsx          根布局 + SEO meta
│  ├─ page.tsx            落地页（英文，CTA 到审计/生成）
│  ├─ audit/page.tsx      免费 SEO 审计（客户端，lib/audit.ts 评分）
│  ├─ generate/page.tsx   AI Listing 生成（客户端表单）
│  └─ api/
│     ├─ generate/route.ts  服务端调 LLM，密钥不进浏览器
│     └─ audit-log/route.ts 匿名审计埋点（audit_logs）
├─ lib/
│  ├─ audit.ts            审计评分引擎（移植自静态站，纯函数）
│  ├─ llm.ts              LLM 封装（OpenAI 兼容，默认 DeepSeek）
│  └─ supabase.ts         浏览器匿名客户端（受 RLS 保护）
├─ supabase/schema.sql    表结构 + RLS 策略
└─ .env.example           环境变量模板
```

## 快速开始
```bash
npm install
cp .env.example .env.local   # 填 Supabase URL/KEY + DeepSeek API key
# 初始化数据库：Supabase SQL Editor 运行 supabase/schema.sql
npm run dev                  # http://localhost:3000
```

## 关键决策（假设）
- **免费审计**保留为获客钩子，审计分沿用静态站权重（标题25/标签25/关键词20/描述15/完整性15）。
- **LLM 调用放服务端**（`/api/generate`），避免把 key 暴露给浏览器；默认 DeepSeek（单生成 <$0.02）。
- **Supabase 匿名可写** audit_logs / subscribers / listings（user_email 空），SELECT 受限——支撑"免费→付费"漏斗且能客观统计审计次数（修复此前无集中度量的缺口）。
- **freemium 配额**表 `usage_quota` 预留，免费档每月 N 次生成，达阈值引导 $9/月。
- 部署：Vercel（zc 授权，见 TASK.md WAITING_FOR_USER）。

## 尚未做（留给验证后）
- 用户登录 / 付费墙（Stripe）
- 多平台分发（Pinterest/eBay）— 工程重，暂缓
- 真实审计次数看板（接 audit_logs 统计）
