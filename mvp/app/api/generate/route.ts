import { NextResponse } from "next/server";
import { generateListing, isLLMConfigured, type GeneratedListing } from "@/lib/llm";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isLLMConfigured()) {
    return NextResponse.json(
      { error: "LLM not configured (set LLM_API_KEY). Add it in .env to enable generation." },
      { status: 503 }
    );
  }

  let body: { productType?: string; tags?: string[]; notes?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.productType) {
    return NextResponse.json({ error: "productType is required" }, { status: 400 });
  }

  try {
    const listing = await generateListing({
      productType: body.productType,
      tags: body.tags ?? [],
      notes: body.notes,
    });

    // 落库（匿名试用 user_email 为空；失败不影响返回）
    if (supabase) {
      supabase
        .from("listings")
        .insert({
          product_type: body.productType,
          input_tags: body.tags ?? [],
          title: listing.title,
          tags: listing.tags,
          description: listing.description,
          seo_summary: listing.seoSummary,
        })
        .then(({ error }) => {
          if (error) console.error("listings insert failed", error.message);
        });
    }

    return NextResponse.json(listing as GeneratedListing);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Generation failed" },
      { status: 500 }
    );
  }
}
