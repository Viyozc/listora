"use client";

import { useState } from "react";
import type { GeneratedListing } from "@/lib/llm";

export default function GeneratePage() {
  const [productType, setProductType] = useState("");
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedListing | null>(null);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productType, tags: tags.split(",").map((t) => t.trim()).filter(Boolean), notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setResult(data as GeneratedListing);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold">AI Listing Generator</h1>
      <p className="text-gray-600 mt-2">Describe your digital product — get a title, 13 tags, and description.</p>

      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Product type</span>
          <input
            value={productType}
            onChange={(e) => setProductType(e.target.value)}
            className="w-full mt-1 p-3 border rounded-lg"
            placeholder="Printable weekly planner PDF"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Theme / keywords (comma-separated)</span>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full mt-1 p-3 border rounded-lg"
            placeholder="mom, minimal, instant download, A4"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Extra notes</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full mt-1 p-3 border rounded-lg"
            placeholder="Target busy moms, include 12 month + 52 week pages"
          />
        </label>
        <button
          onClick={generate}
          disabled={loading || !productType}
          className="bg-brand text-white px-5 py-3 rounded-lg font-semibold hover:bg-brand-dark disabled:opacity-50"
        >
          {loading ? "Generating…" : "Generate Listing"}
        </button>
      </div>

      {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}

      {result && (
        <div className="mt-8 bg-white p-6 rounded-xl border shadow-sm space-y-4">
          <div>
            <h3 className="font-semibold text-sm text-gray-500">TITLE</h3>
            <p className="mt-1">{result.title}</p>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-gray-500">TAGS (13)</h3>
            <div className="mt-1 flex flex-wrap gap-2">
              {result.tags.map((t, i) => (
                <span key={i} className="bg-brand-light text-brand-dark px-2 py-1 rounded text-xs">{t}</span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-gray-500">DESCRIPTION</h3>
            <p className="mt-1 whitespace-pre-wrap text-sm">{result.description}</p>
          </div>
          {result.seoSummary && (
            <p className="text-xs text-gray-400">SEO: {result.seoSummary}</p>
          )}
        </div>
      )}
    </main>
  );
}
