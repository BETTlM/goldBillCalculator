"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { generateEstimatePDF } from "@/lib/generate-pdf";

interface GoldRate {
  ratePerGram: number;
  source: string;
  timestamp: string;
}

interface JewelleryListItem {
  id: number;
  name: string;
  type: string;
  weight: number;
}

interface JewelleryDetail {
  id: number;
  name: string;
  type: string;
  weight: number;
  wastagePercent: number;
  makingPercent: number;
  taxPercent: number;
}
const CATEGORIES = [
  { value: "ring", label: "Rings" },
  { value: "chain", label: "Chains" },
  { value: "bracelet", label: "Bracelets" },
  { value: "earring", label: "Earrings" },
  { value: "necklace", label: "Necklaces" },
  { value: "bangle", label: "Bangles" },
];

function formatINR(amount: number, decimals = 0): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

export default function Home() {
  const [goldRate, setGoldRate] = useState<GoldRate | null>(null);
  const [goldLoading, setGoldLoading] = useState(true);

  const [selectedType, setSelectedType] = useState("");
  const [items, setItems] = useState<JewelleryListItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [detail, setDetail] = useState<JewelleryDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [dbError, setDbError] = useState("");

  const itemsRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    fetch("/api/gold-rate")
      .then((r) => r.json())
      .then((data) => setGoldRate(data))
      .catch(() =>
        setGoldRate({
          ratePerGram: 14000,
          source: "fallback",
          timestamp: new Date().toISOString(),
        }),
      )
      .finally(() => setGoldLoading(false));
  }, []);

  const fetchItems = useCallback(async (type: string) => {
    setItemsLoading(true);
    setDbError("");
    try {
      const res = await fetch(`/api/jewellery?type=${type}`);
      const data = await res.json();
      if (data.error) {
        setDbError(data.error);
        setItems([]);
      } else {
        setItems(data);
      }
    } catch {
      setDbError("Failed to connect to database.");
      setItems([]);
    } finally {
      setItemsLoading(false);
      setTimeout(
        () => itemsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }),
        80,
      );
    }
  }, []);

  const fetchDetail = useCallback(async (id: number) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/jewellery?id=${id}`);
      const data = await res.json();
      if (data.error) setDetail(null);
      else setDetail(data);
    } catch {
      setDetail(null);
    } finally {
      setDetailLoading(false);
      setTimeout(
        () => priceRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }),
        80,
      );
    }
  }, []);

  function handleTypeChange(type: string) {
    const next = type === selectedType ? "" : type;
    setSelectedType(next);
    setSelectedItemId(null);
    setDetail(null);
    if (next) fetchItems(next);
    else setItems([]);
  }

  function handleItemSelect(id: number) {
    setSelectedItemId(id);
    setDetail(null);
    fetchDetail(id);
  }

  function handleReset() {
    setSelectedType("");
    setSelectedItemId(null);
    setDetail(null);
    setItems([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const rate = goldRate?.ratePerGram ?? 0;
  const goldValue = detail ? detail.weight * rate : 0;
  const wastageAmt = detail ? goldValue * (detail.wastagePercent / 100) : 0;
  const makingAmt = detail ? goldValue * (detail.makingPercent / 100) : 0;
  const subtotal = goldValue + wastageAmt + makingAmt;
  const taxAmt = detail ? subtotal * (detail.taxPercent / 100) : 0;
  const totalPrice = subtotal + taxAmt;

  return (
    <>
      {/* ---- Nav ---- */}
      <nav className="no-print sticky top-0 z-50 border-b border-[var(--card-border)]/50 bg-[var(--background)]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <button
            onClick={handleReset}
            className="text-xl font-semibold tracking-tight gold-gradient-text"
          >
            Titan Gold
          </button>
          {goldRate && !goldLoading && (
            <div className="flex items-center gap-1.5 rounded-full border border-[var(--card-border)] bg-[var(--card)] px-3 py-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                24K
              </span>
              <span className="text-sm font-semibold tabular-nums text-[var(--gold)]">
                {formatINR(rate, 2)}
              </span>
              <span className="text-[10px] text-[var(--muted)]">/g</span>
            </div>
          )}
        </div>
      </nav>

      <main className="flex-1">
        {/* ---- Gold Rate Hero ---- */}
        <section className="relative overflow-hidden border-b border-[var(--card-border)]/50">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-52 w-[28rem] rounded-full bg-[var(--gold)]/[0.03] blur-[100px]" />
          </div>
          <div className="animate-shimmer pointer-events-none absolute inset-0" />

          <div className="relative mx-auto max-w-5xl px-4 py-16 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--muted)]">
              Today&apos;s Gold Rate
            </p>

            {goldLoading ? (
              <div className="mx-auto mt-5 h-14 w-64 animate-pulse rounded-xl bg-[var(--card)]" />
            ) : (
              <>
                <p className="mt-4 text-4xl font-bold gold-gradient-text sm:text-5xl tabular-nums">
                  {formatINR(rate, 2)}
                </p>
                <p className="mt-2 text-sm text-[var(--muted)]">per gram &middot; 24 karat</p>

                <div className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-[var(--card-border)] bg-[var(--card)] px-4 py-2">
                  {goldRate?.source === "live" ? (
                    <>
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                      </span>
                      <span className="text-xs font-medium text-emerald-400">Live</span>
                    </>
                  ) : (
                    <>
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      <span className="text-xs font-medium text-amber-400">Estimated</span>
                    </>
                  )}
                  {goldRate?.timestamp && (
                    <span className="text-xs text-[var(--muted)]">
                      &middot; Updated{" "}
                      {new Date(goldRate.timestamp).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-4">
          {/* ---- Categories ---- */}
          <section className="no-print pt-10 pb-2">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Browse by Category</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Select a jewellery type to explore items
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {CATEGORIES.map((cat, i) => {
                const active = selectedType === cat.value;
                return (
                  <button
                    key={cat.value}
                    onClick={() => handleTypeChange(cat.value)}
                    className={`group flex flex-col items-center gap-3 rounded-2xl border p-5 transition-all duration-200 animate-slide-up ${
                      active
                        ? "border-[var(--gold)]/50 bg-[var(--gold)]/[0.06] shadow-[0_0_30px_rgba(212,168,67,0.08)]"
                        : "border-[var(--card-border)] bg-[var(--card)] hover:border-[var(--gold)]/25 hover:shadow-[0_0_20px_rgba(212,168,67,0.04)]"
                    }`}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-200 ${
                        active
                          ? "bg-[var(--gold)]/15 text-[var(--gold)]"
                          : "bg-[var(--card-border)]/40 text-[var(--muted)] group-hover:text-[var(--gold-light)]"
                      }`}
                    >
                      <CategoryIcon type={cat.value} />
                    </div>
                    <span
                      className={`text-sm font-medium transition-colors duration-200 ${
                        active ? "text-[var(--gold)]" : "text-[var(--foreground)]"
                      }`}
                    >
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ---- Items ---- */}
          {selectedType && (
            <section ref={itemsRef} className="no-print pt-8 pb-2 animate-slide-up">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--foreground)]">
                    {CATEGORIES.find((c) => c.value === selectedType)?.label}
                  </h2>
                  {!itemsLoading && !dbError && (
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {items.length} item{items.length !== 1 && "s"}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5">
                {itemsLoading ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="h-[88px] animate-pulse rounded-2xl border border-[var(--card-border)] bg-[var(--card)]"
                      />
                    ))}
                  </div>
                ) : dbError ? (
                  <div className="rounded-2xl border border-red-900/40 bg-red-950/20 px-5 py-4">
                    <p className="text-sm font-medium text-red-400">Connection Error</p>
                    <p className="mt-1 text-xs text-red-400/70">{dbError}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {items.map((item, i) => {
                      const active = selectedItemId === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleItemSelect(item.id)}
                          className={`flex flex-col items-start rounded-2xl border p-4 text-left transition-all duration-200 animate-slide-up ${
                            active
                              ? "border-[var(--gold)]/50 bg-[var(--gold)]/[0.06] shadow-[0_0_24px_rgba(212,168,67,0.1)]"
                              : "border-[var(--card-border)] bg-[var(--card)] hover:border-[var(--gold)]/25"
                          }`}
                          style={{ animationDelay: `${i * 40}ms` }}
                        >
                          <span
                            className={`text-sm font-medium leading-snug ${
                              active ? "text-[var(--gold)]" : "text-[var(--foreground)]"
                            }`}
                          >
                            {item.name}
                          </span>
                          <span className="mt-2 inline-flex rounded-md bg-[var(--background)] px-2 py-0.5 text-xs tabular-nums text-[var(--muted)]">
                            {item.weight}g
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ---- Detail Skeleton ---- */}
          {detailLoading && (
            <section className="pt-8 pb-20">
              <div className="h-24 animate-pulse rounded-2xl border border-[var(--card-border)] bg-[var(--card)]" />
              <div className="mt-3 space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-[68px] animate-pulse rounded-xl border border-[var(--card-border)] bg-[var(--card)]"
                  />
                ))}
              </div>
              <div className="mt-3 h-28 animate-pulse rounded-2xl border border-[var(--card-border)] bg-[var(--card)]" />
            </section>
          )}

          {/* ---- Price Breakdown ---- */}
          {detail && !detailLoading && (
            <section ref={priceRef} className="pt-8 pb-20 animate-slide-up">
              <h2 className="mb-5 text-lg font-semibold text-[var(--foreground)]">
                Price Estimate
              </h2>

              {/* Item header card */}
              <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
                <h3 className="text-xl font-semibold text-[var(--foreground)]">{detail.name}</h3>
                <p className="mt-1 text-sm capitalize text-[var(--muted)]">
                  {detail.type} &middot; {detail.weight}g
                </p>
              </div>

              {/* Breakdown rows */}
              <div className="mt-3 space-y-2">
                <BreakdownRow
                  label="Gold Value"
                  desc={`${detail.weight}g × ${formatINR(rate, 2)}/g`}
                  amount={goldValue}
                  delay={0}
                />
                <BreakdownRow
                  label="Wastage"
                  desc={`${detail.wastagePercent}% of gold value`}
                  amount={wastageAmt}
                  delay={50}
                />
                <BreakdownRow
                  label="Making Charge"
                  desc={`${detail.makingPercent}% of gold value`}
                  amount={makingAmt}
                  delay={100}
                />
                <BreakdownRow
                  label="GST"
                  desc={`${detail.taxPercent}% of subtotal`}
                  amount={taxAmt}
                  delay={150}
                />
              </div>

              {/* Total */}
              <div
                className="mt-3 overflow-hidden rounded-2xl border border-[var(--gold)]/25 p-6 animate-slide-up"
                style={{
                  animationDelay: "200ms",
                  background:
                    "linear-gradient(135deg, rgba(212,168,67,0.06) 0%, rgba(212,168,67,0.02) 100%)",
                }}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--muted)]">
                  Total Estimated Price
                </p>
                <p className="mt-2 text-3xl font-bold gold-gradient-text tabular-nums sm:text-4xl">
                  {formatINR(totalPrice)}
                </p>
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-3 animate-slide-up" style={{ animationDelay: "250ms" }}>
                <button
                  onClick={handleReset}
                  className="no-print flex-1 rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-4 py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:border-[var(--gold)]/25"
                >
                  New Estimate
                </button>
                <button
                  onClick={() => {
                    if (!detail || !goldRate) return;
                    generateEstimatePDF({
                      itemName: detail.name,
                      itemType: detail.type,
                      weight: detail.weight,
                      goldRate: rate,
                      goldRateSource: goldRate.source,
                      goldValue,
                      wastagePercent: detail.wastagePercent,
                      wastageAmount: wastageAmt,
                      makingPercent: detail.makingPercent,
                      makingAmount: makingAmt,
                      taxPercent: detail.taxPercent,
                      taxAmount: taxAmt,
                      totalPrice,
                    });
                  }}
                  className="no-print flex-1 rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/[0.08] px-4 py-3 text-sm font-medium text-[var(--gold)] transition-colors hover:bg-[var(--gold)]/15"
                >
                  Download Estimate
                </button>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* ---- Footer ---- */}
      <footer className="no-print mt-auto border-t border-[var(--card-border)]/50 py-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-1 px-4 text-xs text-[var(--muted)] sm:flex-row sm:justify-between">
          <span>Titan Gold &middot; Jewellery Price Calculator</span>
          <span>Rates via goldapi.io &middot; Powered by Supabase</span>
        </div>
      </footer>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function BreakdownRow({
  label,
  desc,
  amount,
  delay,
}: {
  label: string;
  desc: string;
  amount: number;
  delay: number;
}) {
  return (
    <div
      className="flex items-center justify-between rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-5 py-4 animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div>
        <p className="text-sm font-medium text-[var(--foreground)]">{label}</p>
        <p className="mt-0.5 text-sm text-[var(--muted)]">{desc}</p>
      </div>
      <span className="text-sm font-semibold tabular-nums text-[var(--gold)]">
        {formatINR(amount)}
      </span>
    </div>
  );
}

function CategoryIcon({ type }: { type: string }) {
  const base = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-6 w-6",
  };

  switch (type) {
    case "ring":
      return (
        <svg {...base}>
          <circle cx="12" cy="14" r="6" />
          <polygon points="12,4 14,8 10,8" fill="currentColor" stroke="none" />
        </svg>
      );
    case "chain":
      return (
        <svg {...base}>
          <ellipse cx="9" cy="12" rx="5.5" ry="3.5" />
          <ellipse cx="15" cy="12" rx="5.5" ry="3.5" />
        </svg>
      );
    case "bracelet":
      return (
        <svg {...base}>
          <path d="M4 12a8 8 0 0116 0" />
          <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="20" cy="12" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      );
    case "earring":
      return (
        <svg {...base}>
          <path d="M12 3v4" />
          <path d="M12 7a5 5 0 010 10" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      );
    case "necklace":
      return (
        <svg {...base}>
          <path d="M5 5c0 8 7 12 7 12s7-4 7-12" />
          <polygon points="12,17 10,21 14,21" fill="currentColor" stroke="none" />
        </svg>
      );
    case "bangle":
      return (
        <svg {...base}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="5" />
        </svg>
      );
    default:
      return null;
  }
}
