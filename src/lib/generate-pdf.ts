import jsPDF from "jspdf";

export interface EstimateData {
  itemName: string;
  itemType: string;
  weight: number;
  goldRate: number;
  goldRateSource: string;
  goldValue: number;
  wastagePercent: number;
  wastageAmount: number;
  makingPercent: number;
  makingAmount: number;
  taxPercent: number;
  taxAmount: number;
  totalPrice: number;
}

const GOLD: [number, number, number] = [180, 146, 46];
const DARK: [number, number, number] = [23, 23, 23];
const MUTED: [number, number, number] = [120, 120, 120];
const WARM_BG: [number, number, number] = [250, 247, 240];

function fmtINR(amount: number, decimals = 0): string {
  return (
    "Rs. " +
    new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount)
  );
}

export function generateEstimatePDF(data: EstimateData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pw = doc.internal.pageSize.getWidth();
  const margin = 20;
  const cw = pw - margin * 2;
  let y = margin;

  function hline(yPos: number, color: [number, number, number] = MUTED, width = 0.3) {
    doc.setDrawColor(...color);
    doc.setLineWidth(width);
    doc.line(margin, yPos, pw - margin, yPos);
  }

  /* ---- Header ---- */

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(...GOLD);
  doc.text("TITAN GOLD", margin, y);

  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...MUTED);
  doc.text("Jewellery Price Estimate", margin, y);

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const ref = `TG-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;

  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(`Date: ${dateStr}`, pw - margin, y - 8, { align: "right" });
  doc.text(`Ref: ${ref}`, pw - margin, y - 2, { align: "right" });

  y += 5;
  hline(y, GOLD, 0.6);

  /* ---- Item Details ---- */

  y += 12;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...GOLD);
  doc.text("ITEM DETAILS", margin, y);

  y += 9;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const typeName = data.itemType.charAt(0).toUpperCase() + data.itemType.slice(1);
  const rateLabel = data.goldRateSource === "live" ? "Live" : "Estimated";

  const fields: [string, string][] = [
    ["Item", data.itemName],
    ["Type", typeName],
    ["Net Weight", `${data.weight} grams — 24K Gold`],
    ["Gold Rate", `${fmtINR(data.goldRate, 2)} per gram (${rateLabel})`],
  ];

  for (const [label, value] of fields) {
    doc.setTextColor(...MUTED);
    doc.text(label, margin, y);
    doc.setTextColor(...DARK);
    doc.text(value, margin + 38, y);
    y += 7;
  }

  y += 3;
  hline(y);

  /* ---- Price Breakdown Table ---- */

  y += 12;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...GOLD);
  doc.text("PRICE BREAKDOWN", margin, y);

  y += 10;

  // Table header row
  doc.setFillColor(...WARM_BG);
  doc.roundedRect(margin, y - 5, cw, 9, 1, 1, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text("DESCRIPTION", margin + 4, y);
  doc.text("RATE", margin + cw * 0.52, y);
  doc.text("AMOUNT (INR)", pw - margin - 4, y, { align: "right" });

  y += 7;
  hline(y);

  // Table body
  const rows = [
    {
      label: "Gold Value",
      rate: `${data.weight}g x ${fmtINR(data.goldRate, 2)}`,
      amount: fmtINR(data.goldValue),
    },
    {
      label: "Wastage Charge",
      rate: `${data.wastagePercent}% of gold value`,
      amount: fmtINR(data.wastageAmount),
    },
    {
      label: "Making Charge",
      rate: `${data.makingPercent}% of gold value`,
      amount: fmtINR(data.makingAmount),
    },
    {
      label: "GST",
      rate: `${data.taxPercent}% of subtotal`,
      amount: fmtINR(data.taxAmount),
    },
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  for (const row of rows) {
    y += 9;
    doc.setTextColor(...DARK);
    doc.text(row.label, margin + 4, y);
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(row.rate, margin + cw * 0.52, y);
    doc.setFontSize(10);
    doc.setTextColor(...DARK);
    doc.text(row.amount, pw - margin - 4, y, { align: "right" });

    y += 4;
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.15);
    doc.line(margin, y, pw - margin, y);
  }

  y += 2;
  hline(y, GOLD, 0.5);

  // Total row
  y += 3;
  doc.setFillColor(...WARM_BG);
  doc.roundedRect(margin, y - 2, cw, 14, 1.5, 1.5, "F");
  y += 7;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...GOLD);
  doc.text("TOTAL", margin + 4, y);
  doc.text(fmtINR(data.totalPrice), pw - margin - 4, y, { align: "right" });

  /* ---- Footer ---- */

  y += 24;
  hline(y);
  y += 7;

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(
    "This is a price estimate based on current gold rates and may vary at the time of purchase.",
    margin,
    y,
  );
  y += 4.5;
  doc.text(
    "Prices are indicative and subject to market conditions. Final billing may differ.",
    margin,
    y,
  );

  y += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text("Titan Gold — Jewellery Price Calculator", margin, y);
  doc.text(`Generated on ${dateStr}`, pw - margin, y, { align: "right" });

  /* ---- Save ---- */

  const slug = data.itemName.replace(/[^a-zA-Z0-9]+/g, "-");
  doc.save(`Titan-Gold-Estimate-${slug}.pdf`);
}
