
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function setExecutiveTarget(userId: string, targetRevenue: number) {
    const supabase = await createClient()
    const currentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

    // Create or update target for this user for this month
    // We need a table for individual targets. 'user_targets' or add to 'profiles'?
    // 'school_targets' exists. I should create 'user_targets'.

    // For now, I'll create the query. I need to CREATE the table first in next step if it doesn't exist.
    // Assuming table 'user_targets' (user_id, target_month, target_revenue).

    const { error } = await supabase.from('user_targets').upsert({
        user_id: userId,
        target_month: currentMonth,
        target_revenue: targetRevenue
    }, { onConflict: 'user_id, target_month' })

    if (error) console.error('Error setting user target:', error)

    revalidatePath('/dashboard/my-executives')
}
