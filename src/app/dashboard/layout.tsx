
import { Sidebar } from '@/components/Sidebar'
import { MobileHeader } from '@/components/MobileHeader'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Role } from '@/types'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch Role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    const role = profile?.role as Role || 'sales_executive' // Fallback?

    return (
        <div className="flex h-screen w-full bg-slate-50">
            <div className="hidden md:block h-full">
                <Sidebar role={role} />
            </div>

            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <MobileHeader role={role} />

                <main className="flex-1 overflow-y-auto">
                    <div className="min-h-full p-4 md:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
