
'use server'

import { createClient } from '@/lib/supabase/server'

export async function getGlobalStats() {
    const supabase = await createClient()

    // 1. Total Revenue
    const { data: payments } = await supabase.from('payments').select('amount')
    const totalRevenue = payments?.reduce((sum, p) => sum + p.amount, 0) || 0

    // 2. Total Expectations (Fees)
    const { data: students } = await supabase.from('students').select('total_fee, id')
    const totalExpected = students?.reduce((sum, s) => sum + s.total_fee, 0) || 0

    const totalPending = totalExpected - totalRevenue

    // 3. Campaign Stats
    // We can reuse getCampaigns or simplified count
    const { data: campaigns } = await supabase
        .from('campaigns')
        .select('id, name, leads:campaign_leads(is_converted)')

    const campaignStats = campaigns?.map((c: any) => ({
        name: c.name,
        leads: c.leads.length,
        converted: c.leads.filter((l: any) => l.is_converted).length,
        conversion_rate: c.leads.length ? (c.leads.filter((l: any) => l.is_converted).length / c.leads.length) * 100 : 0
    }))

    return {
        revenue: totalRevenue,
        pending: totalPending,
        campaigns: campaignStats
    }
}
