
import { createClient } from '@/lib/supabase/server'
import SetTargetModal from '@/components/team/SetTargetModal'

export default async function MyExecutivesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return <div>Please log in</div>

    // Get Current User Role & School
    const { data: profile } = await supabase.from('profiles').select('role, school_id').eq('id', user.id).single()
    const role = profile?.role
    const schoolId = profile?.school_id

    // Only for Leadership
    if (!['project_lead', 'sales_team_lead', 'head_of_sales', 'admin'].includes(role)) {
        return <div className="p-8">Unauthorized</div>
    }

    // Fetch Executives
    let query = supabase.from('profiles').select('id, full_name, role, school_id').eq('role', 'sales_executive')

    // Filter by School if restricted
    if (['project_lead', 'sales_team_lead'].includes(role) && schoolId) {
        query = query.eq('school_id', schoolId)
    }

    const { data: executives } = await query

    // Fetch Targets for this month
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
    const { data: targets } = await supabase.from('user_targets').select('user_id, target_revenue').eq('target_month', startOfMonth)

    // Fetch Actuals (Payments) for this month
    // We need to sum payments for students assigned to each exec.
    // 1. Get all students assigned to these execs
    const execIds = executives?.map(e => e.id) || []

    let actualsMap: Record<string, number> = {}

    if (execIds.length > 0) {
        // Fetch aggregated payments per sales agent is complex in one go without joins/groupBy
        // Alternative: Fetch all payments for this month, then map back to student -> assigned_sales

        // 1. Get students for these execs
        const { data: students } = await supabase.from('students')
            .select('id, assigned_sales_id')
            .in('assigned_sales_id', execIds)

        const studentToSalesMap = new Map(students?.map(s => [s.id, s.assigned_sales_id]))
        const studentIds = students?.map(s => s.id) || []

        // 2. Get payments for these students
        if (studentIds.length > 0) {
            const { data: payments } = await supabase.from('payments')
                .select('amount, student_id')
                .gte('payment_date', startOfMonth) // This month only
                .in('student_id', studentIds)

            payments?.forEach(p => {
                const salesId = studentToSalesMap.get(p.student_id)
                if (salesId) {
                    actualsMap[salesId] = (actualsMap[salesId] || 0) + Number(p.amount)
                }
            })
        }
    }

    const execData = executives?.map(e => {
        const target = targets?.find(t => t.user_id === e.id)?.target_revenue || 0
        const actual = actualsMap[e.id] || 0
        const progress = target > 0 ? (actual / target) * 100 : 0
        return { ...e, target, actual, progress }
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Executives</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 font-medium text-slate-500">Name</th>
                            <th className="px-6 py-4 font-medium text-slate-500">Month Target</th>
                            <th className="px-6 py-4 font-medium text-slate-500">Month Actual</th>
                            <th className="px-6 py-4 font-medium text-slate-500">Progress</th>
                            <th className="px-6 py-4 font-medium text-slate-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {execData?.map((exec) => (
                            <tr key={exec.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900">{exec.full_name}</td>
                                <td className="px-6 py-4 text-slate-600">₹{Number(exec.target).toLocaleString()}</td>
                                <td className="px-6 py-4 font-bold text-blue-600">₹{Number(exec.actual).toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden w-24">
                                            <div
                                                className={`h-full rounded-full ${exec.progress >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                                                style={{ width: `${Math.min(exec.progress, 100)}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-slate-500">{Math.round(exec.progress)}%</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <SetTargetModal
                                        executiveId={exec.id}
                                        executiveName={exec.full_name}
                                        currentTarget={exec.target}
                                    />
                                </td>
                            </tr>
                        ))}
                        {execData?.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                                    No Sales Executives found under your management.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
