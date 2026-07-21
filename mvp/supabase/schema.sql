-- ============================================================
-- Listora MVP — Supabase schema (Postgres)
-- 用途：订阅线索、免费审计埋点、AI 生成记录、freemium 用量配额。
-- 执行：Supabase SQL Editor 粘贴运行；或 supabase db push（需 CLI 登录）。
-- ============================================================

-- 1) 订阅线索（落地页邮件捕获，可替代 Web3Forms 收真实邮件）
create table if not exists subscribers (
  id          bigint generated always as identity primary key,
  email       text not null unique,
  source      text default 'landing',
  created_at  timestamptz default now()
);
create index if not exists subscribers_email_idx on subscribers (email);

-- 2) 免费审计埋点（修复此前"审计次数无集中度量"的缺口；用于判断是否达 ≥200）
create table if not exists audit_logs (
  id           bigint generated always as identity primary key,
  email        text,                      -- 匿名也允许（未订阅时为空）
  score        int not null,              -- 0-100 审计分
  grade        text,
  created_at   timestamptz default now()
);
create index if not exists audit_logs_created_idx on audit_logs (created_at);

-- 3) AI 生成记录（MVP 核心：每次生成存一条，便于复盘与配额）
create table if not exists listings (
  id           bigint generated always as identity primary key,
  user_email   text,                      -- 登录用户；匿名试用可空
  product_type text not null,
  input_tags   text[] not null,
  title        text,
  tags         text[],
  description  text,
  seo_summary  text,
  created_at   timestamptz default now()
);
create index if not exists listings_user_idx on listings (user_email);

-- 4) freemium 用量配额（免费档每月 N 次生成；达到后进付费）
create table if not exists usage_quota (
  email        text primary key,
  free_used    int default 0,
  plan         text default 'free',       -- free | pro
  updated_at   timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- 策略原则：浏览器匿名只可 INSERT（写线索/审计/生成），不可 SELECT 他人数据；
-- SELECT/UPDATE 限 service_role（服务端脚本）或本人（auth.uid = email 映射后）。
-- ============================================================
alter table subscribers enable row level security;
alter table audit_logs enable row level security;
alter table listings    enable row level security;
alter table usage_quota enable row level security;

-- 匿名允许写入线索
drop policy if exists "anon insert subscribers" on subscribers;
create policy "anon insert subscribers" on subscribers
  for insert to anon, authenticated with check (true);

-- 匿名允许写入审计埋点
drop policy if exists "anon insert audit_logs" on audit_logs;
create policy "anon insert audit_logs" on audit_logs
  for insert to anon, authenticated with check (true);

-- 匿名试用：允许写入生成记录（user_email 为空）
drop policy if exists "anon insert listings" on listings;
create policy "anon insert listings" on listings
  for insert to anon, authenticated with check (user_email is null);

-- 登录用户可查看自己的生成记录
drop policy if exists "owner read listings" on listings;
create policy "owner read listings" on listings
  for select to authenticated using (user_email = auth.email);

-- 用量配额：本人可读
drop policy if exists "owner read quota" on usage_quota;
create policy "owner read quota" on usage_quota
  for select to authenticated using (email = auth.email);
