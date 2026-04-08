import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const id = searchParams.get("id");

  try {
    if (id) {
      const { data, error } = await supabase
        .from("jewellery_items")
        .select("*")
        .eq("id", parseInt(id))
        .single();

      if (error || !data) {
        return NextResponse.json({ error: "Item not found" }, { status: 404 });
      }

      return NextResponse.json({
        id: data.id,
        name: data.name,
        type: data.type,
        weight: data.weight,
        wastagePercent: data.wastage_percent,
        makingPercent: data.making_percent,
        taxPercent: data.tax_percent,
      });
    }

    if (type) {
      const { data, error } = await supabase
        .from("jewellery_items")
        .select("id, name, type, weight")
        .eq("type", type);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data);
    }

    const { data, error } = await supabase
      .from("jewellery_items")
      .select("type");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const uniqueTypes = [...new Set(data?.map((r) => r.type))];
    return NextResponse.json(uniqueTypes);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch jewellery data. Is the database set up?" },
      { status: 500 }
    );
  }
}
