import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

/**
 * 匿名审计埋点：写入 audit_logs，用于客观统计真实审计次数（验证门槛 ≥200）。
 * 未配置 Supabase 时静默跳过，不阻断审计体验。
 */
export async function POST(req: Request) {
  let body: { score?: number; grade?: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!supabase) {
    return NextResponse.json({ ok: true, note: "supabase not configured" });
  }

  const { error } = await supabase.from("audit_logs").insert({
    email: body.email ?? null,
    score: body.score ?? 0,
    grade: body.grade ?? null,
  });

  if (error) {
    console.error("audit_logs insert failed", error.message);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
