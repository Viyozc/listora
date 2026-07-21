/**
 * LLM 调用封装 —— OpenAI 兼容接口，默认 DeepSeek。
 * 仅服务端使用（API route / 服务端脚本），密钥不进浏览器。
 *
 * 成本参考：deepseek-chat ~$0.014 / 1K 输出 token，单次 listing 生成 < $0.02。
 */

const API_KEY = process.env.LLM_API_KEY;
const BASE_URL = process.env.LLM_BASE_URL ?? "https://api.deepseek.com/v1";
const MODEL = process.env.LLM_MODEL ?? "deepseek-chat";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export function isLLMConfigured(): boolean {
  return Boolean(API_KEY);
}

export async function chat(messages: ChatMessage[], opts?: { temperature?: number; maxTokens?: number }): Promise<string> {
  if (!API_KEY) throw new Error("LLM_API_KEY 未配置");

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: opts?.temperature ?? 0.7,
      max_tokens: opts?.maxTokens ?? 800,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LLM 调用失败 ${res.status}: ${err.slice(0, 300)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

/**
 * 将 LLM 原始输出解析为结构化 listing 字段。
 * 让模型以 JSON 返回，失败时做容错。
 */
export async function generateListing(input: {
  productType: string;
  tags: string[];
  notes?: string;
}): Promise<GeneratedListing> {
  const system = `You are an expert Etsy SEO copywriter for DIGITAL DOWNLOAD products (planners, prints, templates, SVGs). 
Return ONLY valid JSON with these keys:
{ "title": string (<=140 chars, keyword-rich), "tags": string[13] (each <=20 chars, Etsy allows 13), "description": string (HTML-free, 800-1200 chars, benefit-led), "seoSummary": string (1 sentence why it ranks) }`;

  const user = `Product type: ${input.productType}
Seller keywords/theme: ${input.tags.join(", ")}
Extra notes: ${input.notes ?? "none"}`;

  const raw = await chat(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { temperature: 0.8, maxTokens: 1000 }
  );

  return parseListing(raw);
}

export type GeneratedListing = {
  title: string;
  tags: string[];
  description: string;
  seoSummary: string;
};

function parseListing(raw: string): GeneratedListing {
  const json = raw.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(json) as GeneratedListing;
  } catch {
    // 容错：模型未严格返回 JSON 时，做最小回填
    return {
      title: raw.slice(0, 140),
      tags: [],
      description: raw,
      seoSummary: "",
    };
  }
}
