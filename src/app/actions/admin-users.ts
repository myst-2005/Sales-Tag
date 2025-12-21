'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { Role } from '@/types'

export async function createUser(formData: FormData) {
    const supabaseAdmin = createAdminClient()

    // 0. Authorization Check
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const { data: requesterProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!requesterProfile || (requesterProfile.role !== 'admin' && requesterProfile.role !== 'ceo')) {
        return { error: 'You do not have permission to create users.' }
    }

    let email = formData.get('email') as string
    let password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const role = formData.get('role') as Role
    const schoolId = formData.get('schoolId') as string | null
    const phone = formData.get('phone') as string | null

    // Helper to generate dummy credentials for "Shadow" users
    const isQuickAdd = !email && !password && !!phone && role === 'sales_executive'

    if (isQuickAdd) {
        // Generate dummy credentials
        const cleanName = fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
        const randomSuffix = Math.random().toString(36).slice(2, 7)
        email = `${cleanName}.${randomSuffix}@placeholder.sales` // distinct domain to identify them easily
        password = `P@ss${Math.random().toString(36).slice(2)}` // Random strong password
    }

    if (!email || !password || !fullName || !role) {
        return { error: 'All fields are required' }
    }

    // 1. Create User in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto confirm since admin is creating it
        user_metadata: {
            full_name: fullName
        }
    })

    if (authError) {
        return { error: authError.message }
    }

    if (!authData.user) {
        return { error: 'Failed to create user' }
    }

    // 2. Update Profile with Role and Approval
    const updateData: any = {
        role: role,
        full_name: fullName,
        is_approved: true
    }

    if (schoolId && (role === 'sales_executive' || role === 'project_lead')) {
        updateData.school_id = schoolId
    }

    if (phone) {
        updateData.phone = phone
    }

    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update(updateData)
        .eq('id', authData.user.id)

    if (profileError) {
        // If update fails (e.g. race condition/trigger trigger lag), try insert just in case
        // But usually trigger is immediate.
        return { error: 'User created but profile update failed: ' + profileError.message }
    }

    revalidatePath('/dashboard/team')
    return { success: true }
}

export async function deleteUser(userId: string) {
    const supabaseAdmin = createAdminClient()
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        console.error('Unauthorized delete attempt')
        return
    }

    // Check if requester is Admin
    const { data: requesterProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (requesterProfile?.role !== 'admin') {
        console.error('Unauthorized delete attempt: Not admin')
        return
    }

    // Perform Delete
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (error) {
        console.error('Delete error:', error)
        throw new Error(error.message)
    }

    revalidatePath('/dashboard/team')
}
