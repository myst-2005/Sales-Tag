import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = createAdminClient()

    try {
        // 1. List all users
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
        if (listError) throw listError

        // 2. Delete all users
        for (const user of users) {
            const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)
            if (deleteError) console.error(`Failed to delete user ${user.id}:`, deleteError.message)
        }

        // 3. Create Super Admin
        const email = 'mohammednazilk@harisandcoacademy.com'
        const password = 'N33504701k@'
        const fullName = 'Mohammed Nazil'

        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName }
        })

        if (createError) throw createError
        if (!newUser.user) throw new Error('User creation failed')

        // 4. Ensure Profile is correct (Admin & Approved)
        // Wait a short moment for trigger or just upsert explicitly
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: newUser.user.id,
                email,
                full_name: fullName,
                role: 'admin',
                is_approved: true,
                // Ensure phone is null or handle if column exists/doesn't exist safely? 
                // We'll just set standard fields.
            })

        if (profileError) throw profileError

        return NextResponse.json({
            message: 'System Reset Successful. All users deleted. Super Admin created.',
            admin: { email, password }
        })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
