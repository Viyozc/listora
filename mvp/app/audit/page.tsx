"use client";

import { useState } from "react";
import { scoreListing, parseTags, MAX_TITLE, MAX_TAGS, type AuditResult } from "@/lib/audit";

export default function AuditPage() {
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [desc, setDesc] = useState("");
  const [keyword, setKeyword] = useState("");
  const [res, setRes] = useState<AuditResult | null>(null);

  function runAudit() {
    const result = scoreListing({
      title,
      tags: parseTags(tags),
      desc,
      keyword: keyword.trim(),
    });
    setRes(result);
    // 埋点：审计计数（匿名也写，用于判断是否达 ≥200 验证门槛）
    fetch("/api/audit-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score: result.total, grade: result.grade }),
    }).catch(() => {});
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold">Free Etsy Listing SEO Audit</h1>
      <p className="text-gray-600 mt-2">Paste a listing and get a 0–100 score with fix tips.</p>

      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Title ({title.length}/{MAX_TITLE})</span>
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            rows={2}
            className="w-full mt-1 p-3 border rounded-lg"
            placeholder="Cute printable planner for busy moms, PDF instant download"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Tags, comma-separated ({parseTags(tags).length}/{MAX_TAGS})</span>
          <textarea
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            rows={3}
            className="w-full mt-1 p-3 border rounded-lg"
            placeholder="printable planner, mom planner, pdf planner, instant download"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Description</span>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={4}
            className="w-full mt-1 p-3 border rounded-lg"
            placeholder="What's included, format, who it's for…"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Target keyword (optional)</span>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full mt-1 p-3 border rounded-lg"
            placeholder="printable planner"
          />
        </label>

        <button
          onClick={runAudit}
          className="bg-brand text-white px-5 py-3 rounded-lg font-semibold hover:bg-brand-dark"
        >
          Run Audit
        </button>
      </div>

      {res && (
        <div className="mt-10 bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-brand">{res.total}</div>
            <div>
              <span className="inline-block bg-brand text-white px-2 py-1 rounded text-sm">Grade {res.grade}</span>
              <p className="text-sm text-gray-600 mt-1">
                {res.total >= 85 ? "Strong listing — minor tweaks only."
                  : res.total >= 70 ? "Good foundation, a few quick wins left."
                  : res.total >= 55 ? "Workable, but leaving ranking points on the table."
                  : "Needs real work before it can compete."}
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {Object.entries(res.dims).map(([k, d]) => (
              <div key={k} className="flex items-center gap-3 text-sm">
                <span className="w-28">{k}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded">
                  <div className="h-2 bg-brand rounded" style={{ width: `${(d.score / d.max) * 100}%` }} />
                </div>
                <span className="w-12 text-right text-gray-500">{d.score}/{d.max}</span>
              </div>
            ))}
          </div>

          <ul className="mt-4 list-disc pl-5 space-y-1 text-sm text-gray-700">
            {res.tips.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
