import { NextResponse } from "next/server";

const GOLD_API_URL = "https://www.goldapi.io/api/XAU/INR";
const FALLBACK_RATE_PER_GRAM = 7850; // approximate fallback in INR per gram

export async function GET() {
  try {
    // Try fetching from a free metals API (goldapi.io requires a key, so we
    // use the metals-api compatible endpoint from frankfurter + gold spot)
    // For reliability, we use a two-step approach:
    // 1. Get gold price in USD per troy ounce from a public source
    // 2. Get USD/INR exchange rate
    // 3. Compute INR per gram

    const [goldRes, fxRes] = await Promise.all([
      fetch("https://api.metals.dev/v1/latest?api_key=demo&currency=USD&unit=gram", {
        next: { revalidate: 300 },
      }).catch(() => null),
      fetch("https://api.frankfurter.dev/v1/latest?base=USD&symbols=INR", {
        next: { revalidate: 300 },
      }).catch(() => null),
    ]);

    let ratePerGramINR = FALLBACK_RATE_PER_GRAM;
    let source = "fallback";

    if (goldRes?.ok && fxRes?.ok) {
      const goldData = await goldRes.json();
      const fxData = await fxRes.json();

      const goldUsdPerGram = goldData?.metals?.gold ?? null;
      const usdToInr = fxData?.rates?.INR ?? null;

      if (goldUsdPerGram && usdToInr) {
        ratePerGramINR = Math.round(goldUsdPerGram * usdToInr * 100) / 100;
        source = "live";
      }
    }

    return NextResponse.json({
      ratePerGram: ratePerGramINR,
      currency: "INR",
      unit: "gram",
      source,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({
      ratePerGram: FALLBACK_RATE_PER_GRAM,
      currency: "INR",
      unit: "gram",
      source: "fallback",
      timestamp: new Date().toISOString(),
    });
  }
}
