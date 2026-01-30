import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  const regionId = searchParams.get("region_id");
  const isBio = searchParams.get("is_bio");
  const search = searchParams.get("search");

  let query = supabase
    .from("producer_profiles")
    .select(
      `
      *,
      profile:profiles(full_name, avatar_url, phone),
      region:regions(name),
      products:products(count)
    `
    )
    .eq("is_active", true)
    .order("rating", { ascending: false });

  if (regionId) {
    query = query.eq("region_id", regionId);
  }

  if (isBio === "true") {
    query = query.eq("is_certified_bio", true);
  }

  if (search) {
    query = query.or(
      `business_name.ilike.%${search}%,description.ilike.%${search}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
