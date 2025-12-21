
'use server'

import { createClient } from '@/lib/supabase/server'

export async function getPendingCollections(filters?: {
    schoolId?: string,
    courseId?: string,
    salesId?: string
}) {
    const supabase = await createClient()

    let query = supabase
        .from('students')
        .select(`
            id,
            full_name,
            phone,
            total_fee,
            payment_plan,
            schools (id, name),
            courses (id, name),
            assigned_sales:profiles!assigned_sales_id (id, full_name),
            payments (amount)
        `)
        .neq('payment_plan', 'one_time') // Only care about EMI/Cumulative for pending lists typically? Or all? User said "cumulative left".
    // Let's include everything that has a balance > 0 really.

    if (filters?.schoolId) query = query.eq('school_id', filters.schoolId)
    if (filters?.courseId) query = query.eq('course_id', filters.courseId)
    if (filters?.salesId) query = query.eq('assigned_sales_id', filters.salesId)

    const { data: students, error } = await query

    if (error) {
        console.error('Error fetching pending collections:', error)
        return []
    }

    // Client-side filtering for balance > 0 (easier than complex SQL subquery for calculated field)
    const pendingList = students.map((s: any) => {
        const totalPaid = s.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0
        const balance = s.total_fee - totalPaid
        return {
            ...s,
            total_paid: totalPaid,
            balance
        }
    }).filter(s => s.balance > 0)

    return pendingList
}
