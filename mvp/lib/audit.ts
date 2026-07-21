/**
 * Listora Listing SEO 审计引擎 —— 移植自静态站 assets/audit.js。
 * 按 Etsy 搜索权重打分：标题25 / 标签25 / 关键词20 / 描述15 / 完整性15。
 * 纯函数，服务端客户端均可调用，零网络成本。
 */

export const MAX_TITLE = 140;
export const MAX_TAGS = 13;

export type AuditDimension = { score: number; max: number };
export type AuditInput = { title: string; tags: string[]; desc: string; keyword: string };
export type AuditResult = {
  total: number;
  dims: Record<string, AuditDimension>;
  tips: string[];
  grade: "A" | "B" | "C" | "D";
};

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0);
}

function hasMultiWord(tags: string[]): number {
  return tags.filter((t) => t.split(/\s+/).length >= 2).length;
}

export function gradeFor(score: number): AuditResult["grade"] {
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  return "D";
}

export function scoreListing(input: AuditInput): AuditResult {
  const { title, tags, desc, keyword } = input;
  const tips: string[] = [];
  const dims: Record<string, AuditDimension> = {};

  // 1) Title (25)
  const tLen = title.length;
  let tScore = 0;
  if (tLen >= 120 && tLen <= MAX_TITLE) tScore = 25;
  else if (tLen >= 80) tScore = 20;
  else if (tLen >= 40) tScore = 12;
  else if (tLen > 0) tScore = 4;
  if (tLen === 0) tScore = 0;
  if (keyword && tLen) {
    const firstWords = title.toLowerCase().split(/\s+/).slice(0, 4).join(" ");
    if (firstWords.indexOf(keyword.toLowerCase()) !== -1) tScore = clamp(tScore + 2, 0, 25);
    else tips.push(`Put your main keyword "${keyword}" near the front of the title — Etsy weighs the first words most.`);
  }
  if (tLen < 120 && tLen > 0) tips.push(`Title is ${tLen} chars. Etsy gives you 140 — use more of it with relevant phrases buyers search.`);
  if (tLen < 40) tips.push("Title is very short. Aim for 120–140 chars packed with search phrases, not just the product name.");
  dims.Title = { score: tScore, max: 25 };

  // 2) Tags (25): need 13, reward multi-word
  const nTags = tags.length;
  const tagFill = (Math.min(nTags, MAX_TAGS) / MAX_TAGS) * 18;
  const multi = hasMultiWord(tags);
  const tagPhrase = (multi / MAX_TAGS) * 7;
  const tagScore = Math.round(tagFill + tagPhrase);
  if (nTags < MAX_TAGS) tips.push(`You have ${nTags} tags. Etsy allows 13 — fill all of them; each is a free search entry point.`);
  if (nTags > 0 && multi < nTags) tips.push("Use multi-word tags (e.g. “printable planner” not “planner”). Etsy matches phrases buyers actually type.");
  dims.Tags = { score: tagScore, max: 25 };

  // 3) Keyword strategy (20)
  let kwScore = 0;
  if (keyword) {
    const kwL = keyword.toLowerCase();
    const inTitle = title.toLowerCase().indexOf(kwL) !== -1;
    const inTags = tags.indexOf(kwL) !== -1 || tags.some((t) => t.indexOf(kwL) !== -1);
    const inDesc = desc.toLowerCase().indexOf(kwL) !== -1;
    if (inTitle) kwScore += 8; else tips.push("Your target keyword isn’t in the title — add it.");
    if (inTags) kwScore += 6; else tips.push("Add your target keyword as one of the 13 tags.");
    if (inDesc) kwScore += 6; else tips.push("Mention your target keyword in the description too.");
    if (tags.length !== new Set(tags).size) tips.push("You have duplicate tags — each tag should be unique to maximize reach.");
  } else {
    kwScore = 12;
    tips.push("Add a target keyword to get a deeper keyword-coverage analysis.");
  }
  dims.Keywords = { score: kwScore, max: 20 };

  // 4) Description (15)
  const dLen = desc.length;
  let dScore = 0;
  if (dLen >= 600) dScore = 15;
  else if (dLen >= 300) dScore = 12;
  else if (dLen >= 120) dScore = 8;
  else if (dLen > 0) dScore = 3;
  if (dLen < 300 && dLen > 0) tips.push(`Description is ${dLen} chars. Aim for 300+ with what’s included, format, and who it’s for.`);
  if (dLen === 0) tips.push("Add a description — it’s indexable and builds buyer trust.");
  dims.Description = { score: dScore, max: 15 };

  // 5) Completeness (15)
  let comp = 0;
  if (tLen > 0) comp += 5;
  if (nTags === MAX_TAGS) comp += 5; else if (nTags > 0) comp += Math.round((nTags / MAX_TAGS) * 5);
  if (dLen > 0) comp += 5;
  dims.Completeness = { score: comp, max: 15 };

  let total = Math.round(
    dims.Title.score + dims.Tags.score + dims.Keywords.score + dims.Description.score + dims.Completeness.score
  );
  if (tLen === 0 && nTags === 0 && dLen === 0) total = 0;

  if (tips.length === 0) tips.push("Solid listing — keep an eye on ranking and refresh tags as trends shift.");

  return { total, dims, tips, grade: gradeFor(total) };
}

export { parseTags };
