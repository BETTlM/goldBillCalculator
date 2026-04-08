import { NextResponse } from "next/server";

const GOLDAPI_URL = "https://www.goldapi.io/api/XAU/INR";
const FALLBACK_RATE_PER_GRAM = 14000;
const CACHE_TTL_MS = 8 * 60 * 60 * 1000;

let cached: { ratePerGram: number; timestamp: string } | null = null;
let cachedAt = 0;

export async function GET() {
  const now = Date.now();

  if (cached && now - cachedAt < CACHE_TTL_MS) {
    return NextResponse.json({
      ratePerGram: cached.ratePerGram,
      currency: "INR",
      unit: "gram",
      source: "live",
      timestamp: cached.timestamp,
    });
  }

  const apiKey = process.env.GOLDAPI_KEY;
  if (!apiKey || apiKey === "API_KEY_ERROR") {
    return NextResponse.json({
      ratePerGram: FALLBACK_RATE_PER_GRAM,
      currency: "INR",
      unit: "gram",
      source: "fallback",
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const res = await fetch(GOLDAPI_URL, {
      headers: { "x-access-token": apiKey },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`goldapi.io responded ${res.status}`);
    }

    const data = await res.json();
    const ratePerGram = data.price_gram_24k;

    if (typeof ratePerGram !== "number" || ratePerGram <= 0) {
      throw new Error("Invalid price_gram_24k in response");
    }

    const timestamp = new Date().toISOString();
    cached = { ratePerGram, timestamp };
    cachedAt = now;

    return NextResponse.json({
      ratePerGram,
      currency: "INR",
      unit: "gram",
      source: "live",
      timestamp,
    });
  } catch (err) {
    console.error("Gold rate fetch failed:", err);

    if (cached) {
      return NextResponse.json({
        ratePerGram: cached.ratePerGram,
        currency: "INR",
        unit: "gram",
        source: "live",
        timestamp: cached.timestamp,
      });
    }

    return NextResponse.json({
      ratePerGram: FALLBACK_RATE_PER_GRAM,
      currency: "INR",
      unit: "gram",
      source: "fallback",
      timestamp: new Date().toISOString(),
    });
  }
}
