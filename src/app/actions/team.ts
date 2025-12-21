'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleApproval(userId: string, currentStatus: boolean) {
    const supabase = await createClient()
    await supabase.from('profiles').update({ is_approved: !currentStatus }).eq('id', userId)
    revalidatePath('/dashboard/team')
}

export async function updateRole(formData: FormData) {
    const supabase = await createClient()
    const userId = formData.get('userId') as string
    const role = formData.get('role') as string

    await supabase.from('profiles').update({ role }).eq('id', userId)
    revalidatePath('/dashboard/team')
}

export async function updateSchool(formData: FormData) {
    const supabase = await createClient()
    const userId = formData.get('userId') as string
    const schoolId = formData.get('schoolId') as string

    // Convert empty string to null
    const finalSchoolId = schoolId || null

    const { error } = await supabase.from('profiles').update({ school_id: finalSchoolId }).eq('id', userId)

    if (error) {
        console.error('Update school error:', error)
    }

    revalidatePath('/dashboard/team')
}

export async function createSchool(formData: FormData) {
    const supabase = await createClient()
    const name = formData.get('name') as string

    // Authorization check? Assuming RLS handles it or only admin can access this page/action.
    // For safety, we could check role here.

    if (!name || name.trim().length === 0) return { error: 'School name is required' }

    const { error } = await supabase.from('schools').insert({ name })

    if (error) return { error: error.message }

    revalidatePath('/dashboard/team')
    return { success: true }
}
