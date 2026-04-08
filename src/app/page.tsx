"use client";

import { useState, useEffect, useCallback } from "react";

interface GoldRate {
  ratePerGram: number;
  source: string;
  timestamp: string;
}

interface JewelleryListItem {
  id: number;
  name: string;
  type: string;
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

const JEWELLERY_TYPES = [
  { value: "ring", label: "Ring" },
  { value: "chain", label: "Chain" },
  { value: "bracelet", label: "Bracelet" },
  { value: "earring", label: "Earring" },
  { value: "necklace", label: "Necklace" },
  { value: "bangle", label: "Bangle" },
];

function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function Home() {
  const [goldRate, setGoldRate] = useState<GoldRate | null>(null);
  const [goldLoading, setGoldLoading] = useState(true);

  const [selectedType, setSelectedType] = useState("");
  const [items, setItems] = useState<JewelleryListItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  const [selectedItemId, setSelectedItemId] = useState("");
  const [detail, setDetail] = useState<JewelleryDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [dbError, setDbError] = useState("");

  useEffect(() => {
    setGoldLoading(true);
    fetch("/api/gold-rate")
      .then((r) => r.json())
      .then((data) => setGoldRate(data))
      .catch(() => setGoldRate({ ratePerGram: 7850, source: "fallback", timestamp: new Date().toISOString() }))
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
    }
  }, []);

  const fetchDetail = useCallback(async (id: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/jewellery?id=${id}`);
      const data = await res.json();
      if (data.error) {
        setDetail(null);
      } else {
        setDetail(data);
      }
    } catch {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  function handleTypeChange(type: string) {
    setSelectedType(type);
    setSelectedItemId("");
    setDetail(null);
    if (type) fetchItems(type);
    else setItems([]);
  }

  function handleItemChange(id: string) {
    setSelectedItemId(id);
    setDetail(null);
    if (id) fetchDetail(id);
  }

  const rate = goldRate?.ratePerGram ?? 0;
  const goldValue = detail ? detail.weight * rate : 0;
  const wastageAmt = detail ? goldValue * (detail.wastagePercent / 100) : 0;
  const makingAmt = detail ? goldValue * (detail.makingPercent / 100) : 0;
  const subtotal = goldValue + wastageAmt + makingAmt;
  const taxAmt = detail ? subtotal * (detail.taxPercent / 100) : 0;
  const totalPrice = subtotal + taxAmt;

  return (
    <div className="flex flex-1 flex-col items-center justify-start px-4 py-12 sm:py-20">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
            Titan Gold
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Jewellery Price Calculator
          </p>
        </div>

        {/* Gold Rate Card */}
        <div className="mb-8 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
                Gold Rate (24K)
              </p>
              {goldLoading ? (
                <div className="mt-1 h-8 w-40 animate-pulse rounded bg-[var(--input-border)]" />
              ) : (
                <p className="mt-1 text-2xl font-semibold text-[var(--accent)]">
                  {formatINR(rate)}<span className="text-sm font-normal text-[var(--muted)]"> / gram</span>
                </p>
              )}
            </div>
            <div className="text-right">
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  goldRate?.source === "live"
                    ? "bg-green-900/40 text-green-400"
                    : "bg-yellow-900/40 text-yellow-400"
                }`}
              >
                {goldRate?.source === "live" ? "Live" : "Estimated"}
              </span>
              {goldRate?.timestamp && (
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {new Date(goldRate.timestamp).toLocaleTimeString("en-IN")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Type Selector */}
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
            Jewellery Type
          </label>
          <select
            value={selectedType}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="w-full appearance-none rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
          >
            <option value="">Select type...</option>
            {JEWELLERY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Item Selector */}
        {selectedType && (
          <div className="mb-6 animate-[fadeIn_0.2s_ease-in]">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
              Select Item
            </label>
            {itemsLoading ? (
              <div className="h-12 w-full animate-pulse rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)]" />
            ) : dbError ? (
              <div className="rounded-xl border border-red-800/60 bg-red-950/30 px-4 py-3 text-sm text-red-400">
                {dbError}
              </div>
            ) : (
              <select
                value={selectedItemId}
                onChange={(e) => handleItemChange(e.target.value)}
                className="w-full appearance-none rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
              >
                <option value="">Select item...</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Price Breakdown */}
        {detailLoading && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 w-full animate-pulse rounded-xl bg-[var(--card)]" />
            ))}
          </div>
        )}

        {detail && !detailLoading && (
          <div className="animate-[fadeIn_0.25s_ease-in]">
            <div className="mb-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">{detail.name}</h2>
              <p className="text-xs text-[var(--muted)] capitalize">{detail.type}</p>
            </div>

            <div className="space-y-3">
              <PriceRow label="Weight" valueText={`${detail.weight} g`} amount={goldValue} />
              <PriceRow label="Wastage" valueText={`${detail.wastagePercent}%`} amount={wastageAmt} />
              <PriceRow label="Making Charge" valueText={`${detail.makingPercent}%`} amount={makingAmt} />
              <PriceRow label="Tax (GST)" valueText={`${detail.taxPercent}%`} amount={taxAmt} />
            </div>

            <div className="mt-4 flex items-center justify-between rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 px-5 py-4">
              <span className="text-sm font-medium text-[var(--muted)]">Total Price</span>
              <span className="text-xl font-bold text-[var(--accent)]">{formatINR(totalPrice)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PriceRow({
  label,
  valueText,
  amount,
}: {
  label: string;
  valueText: string;
  amount: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-4 py-3">
      <span className="min-w-[110px] text-sm text-[var(--muted)]">{label}</span>
      <input
        type="text"
        readOnly
        value={valueText}
        className="w-24 rounded-lg border border-[var(--input-border)] bg-[var(--background)] px-3 py-1.5 text-center text-sm text-[var(--foreground)] outline-none"
      />
      <span className="mx-auto" />
      <input
        type="text"
        readOnly
        value={formatINR(amount)}
        className="w-36 rounded-lg border border-[var(--input-border)] bg-[var(--background)] px-3 py-1.5 text-right text-sm font-medium text-[var(--accent)] outline-none"
      />
    </div>
  );
}
