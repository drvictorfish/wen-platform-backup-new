import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { mapCityRow } from '@/lib/cities'

/** Public, read-only — active cities and their delivery hubs/price
 * multipliers. Not sensitive (same spirit as product prices being public),
 * used by checkout to show an accurate estimate and bias address search. */
export async function GET() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('cities')
    .select('slug, name, state, hq_lat, hq_lng, service_radius_km, price_multiplier')
    .eq('is_active', true)
    .order('name')

  if (error) {
    console.error('[cities] load failed:', error.message)
    return NextResponse.json({ cities: [] }, { status: 500 })
  }

  return NextResponse.json({ cities: (data ?? []).map(mapCityRow) })
}
