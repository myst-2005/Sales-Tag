
import { createClient } from '@/lib/supabase/server'
import { Role } from '@/types'
import { getGlobalStats } from '@/app/actions/analytics'
import CeoDashboard from '@/components/dashboards/CeoDashboard'
import HeadOfSalesDashboard from '@/components/dashboards/HeadOfSalesDashboard'

async function SalesDashboard() {
    return (
        <div className="p-10 text-center">
            <h2 className="text-2xl font-bold text-slate-900">Sales Dashboard</h2>
            <p className="text-slate-500 mt-2">Go to "Students" to manage your assigned leads.</p>
        </div>
    )
}

async function DataEntryDashboard({ cumulativeStats }: { cumulativeStats: any }) {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Data Entry Actions</h2>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Total Needed (Cumulative)</p>
                    <p className="text-xl font-bold text-slate-900">${cumulativeStats.cumulativeRevenue?.toLocaleString() || '0'}</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <a href="/dashboard/students/new" className="h-32 rounded-xl border-2 border-dashed border-slate-300 p-6 hover:border-blue-500 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center text-slate-600 hover:text-blue-600 cursor-pointer">
                    <span className="font-semibold text-lg">+ Add New Student</span>
                </a>
                <a href="/dashboard/payments" className="h-32 rounded-xl border-2 border-dashed border-slate-300 p-6 hover:border-green-500 hover:bg-green-50 transition-colors flex flex-col items-center justify-center text-slate-600 hover:text-green-600 cursor-pointer">
                    <span className="font-semibold text-lg">⚡ Quick Payment Entry</span>
                </a>
            </div>
        </div>
    )
}

export default async function DashboardPage(props: { searchParams: Promise<{ school_id?: string }> }) {
    const searchParams = await props.searchParams
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return <div className="p-8">Please log in.</div>
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, school_id')
        .eq('id', user.id)
        .single()

    const role = profile?.role as Role || 'sales_executive'
    const schoolIdParam = searchParams.school_id

    // Determine the "Active School Scope"
    // Project Leads are forced to their school.
    // Executives are forced (but they have their own dashboard).
    // Admins/CEOs/Heads can view Global (null) OR drill down to a specific school.
    let targetSchoolId: string | null = null

    if (role === 'project_lead' || role === 'sales_team_lead') {
        targetSchoolId = profile?.school_id || null
        if (!targetSchoolId) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
                    <h2 className="text-xl font-semibold text-slate-900 mb-2">No School Assigned</h2>
                    <p className="text-slate-500">You have not been assigned to a school yet.<br />Please contact your administrator.</p>
                </div>
            )
        }
    } else if (['ceo', 'cfo', 'head_of_sales', 'admin'].includes(role)) {
        targetSchoolId = schoolIdParam || null
    }

    let dashboardData: any = {}

    if (['head_of_sales', 'ceo', 'cfo', 'admin', 'project_lead', 'sales_team_lead'].includes(role)) {
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

        // 1. Fetch Schools (for name mapping and global list)
        let { data: schoolsData } = await supabase.from('schools').select('id, name')

        // If sales_team_lead or project_lead, restrict schoolsData to their assigned school
        if (targetSchoolId && (role === 'sales_team_lead' || role === 'project_lead')) {
            schoolsData = schoolsData?.filter(s => s.id === targetSchoolId) || []
        }

        // If drilling down, we might want to know the name of the active school
        const activeSchoolName = schoolsData?.find(s => s.id === targetSchoolId)?.name

        // 2. Fetch Students based on Scope
        let studentQuery = supabase.from('students')
            .select('id, school_id, total_fee, created_at, assigned_sales_id, course_id')

        if (targetSchoolId) {
            studentQuery = studentQuery.eq('school_id', targetSchoolId)
        }

        const { data: allStudents } = await studentQuery

        // ... (Metrics Calculation largely similar, but scoped by matching students)

        // 3. Payments (Filtered by fetched students)
        const validStudentIds = new Set(allStudents?.map(s => s.id))

        // Optimization: if global, fetching ALL payments might be big. 
        // But for MVP, fetch based on student IDs? Or all and filter?
        // Fetching all payments for valid students:
        // Chunking might be needed for huge datasets, but let's do simple 'in' or join logic.
        // Actually, fetching all payments and filtering in JS is okay for < 10k records.
        // Better: Select payments where student_id in ... (but list can be long).
        // Let's fetch ALL payments for now and filter. 
        const { data: allPayments } = await supabase.from('payments').select('student_id, amount, payment_date')

        const validPayments = allPayments?.filter(p => validStudentIds.has(p.student_id)) || []

        // --- Metrics ---
        const monthlyStudentCount = allStudents?.filter(s => s.created_at >= startOfMonth).length || 0
        const cumulativeStudentCount = allStudents?.length || 0

        const monthlyRevenue = validPayments
            .filter(p => p.payment_date >= startOfMonth)
            .reduce((sum, p) => sum + Number(p.amount), 0)

        const cumulativeRevenue = validPayments
            .reduce((sum, p) => sum + Number(p.amount), 0)

        // --- Aggregations ---
        const schoolMonthlyRevenueMap: Record<string, number> = {}
        const schoolPendingMap: Record<string, number> = {}
        const coursePendingMap: Record<string, number> = {}
        const studentPaidMap: Record<string, number> = {}
        let totalPendingAmount = 0

        // Map Payments to Students
        validPayments.forEach((p: any) => {
            studentPaidMap[p.student_id] = (studentPaidMap[p.student_id] || 0) + Number(p.amount)

            // For Global Revenue Map (only if we have school_id available efficiently)
            // We need to look up student -> school.
            // allStudents has it.
            // But doing find() every time is O(N*M).
            // Let's map studentId -> schoolId first.
        })

        const studentSchoolMap = new Map(allStudents?.map(s => [s.id, s.school_id]))

        // Aggregating Revenue by School (Global View relevance)
        validPayments.filter(p => p.payment_date >= startOfMonth).forEach(p => {
            const sId = studentSchoolMap.get(p.student_id)
            if (sId) {
                schoolMonthlyRevenueMap[sId] = (schoolMonthlyRevenueMap[sId] || 0) + Number(p.amount)
            }
        })

        // Fetch Courses for naming
        const { data: allCourses } = await supabase.from('courses').select('id, name')
        const courseNameMap = new Map(allCourses?.map(c => [c.id, c.name]))

        // Calculating Pending Fees & Distributions
        allStudents?.forEach((s: any) => {
            const paid = studentPaidMap[s.id] || 0
            const fee = s.total_fee || 0
            const pending = Math.max(0, fee - paid)

            if (pending > 0) {
                if (s.school_id) schoolPendingMap[s.school_id] = (schoolPendingMap[s.school_id] || 0) + pending
                if (s.course_id) coursePendingMap[s.course_id] = (coursePendingMap[s.course_id] || 0) + pending
            }
            totalPendingAmount += pending
        })

        // Prepare Props
        const schoolsWithRevenue = schoolsData?.map(s => ({
            ...s,
            current_month_revenue: schoolMonthlyRevenueMap[s.id] || 0,
            // Only show schools involved in the current scope
        })).filter(s => targetSchoolId ? s.id === targetSchoolId : true) // If drilled down, usually only 1 school shown in "Schools" list, or we allow context switching?
        // User pattern: "Global -> Click School -> School Detail".
        // In School Detail, we probably don't need the "Schools List" table anymore of Target vs Actuals?
        // Or we keep it showing JUST that school? Keeping it is fine.

        const schoolPendingDistribution = schoolsWithRevenue?.map(s => ({
            name: s.name,
            value: schoolPendingMap[s.id] || 0
        })).sort((a: any, b: any) => b.value - a.value) || []

        const coursePendingDistribution = Object.entries(coursePendingMap)
            .map(([courseId, val]) => ({
                name: courseNameMap.get(courseId) || 'Unknown Course',
                value: val
            }))
            .sort((a, b) => b.value - a.value)

        // --- Team Performance (Drill Down Only) ---
        let teamPerformance: any[] = []
        if (targetSchoolId) {
            // Fetch Sales Execs for this school
            const { data: teamMembers } = await supabase.from('profiles')
                .select('id, full_name')
                .eq('school_id', targetSchoolId)
                .eq('role', 'sales_executive')
                .order('full_name')

            const salesStats: Record<string, { students: number, revenue: number }> = {}

            allStudents?.forEach((s: any) => {
                const salesId = s.assigned_sales_id
                if (salesId) {
                    if (!salesStats[salesId]) salesStats[salesId] = { students: 0, revenue: 0 }
                    salesStats[salesId].students += 1
                    salesStats[salesId].revenue += (studentPaidMap[s.id] || 0)
                }
            })

            teamPerformance = teamMembers?.map((m: any) => ({
                id: m.id,
                name: m.full_name,
                students: salesStats[m.id]?.students || 0,
                revenue: salesStats[m.id]?.revenue || 0
            })).sort((a: any, b: any) => b.revenue - a.revenue) || []
        }

        const { data: targets } = await supabase
            .from('school_targets')
            .select('*')
            .eq('target_month', startOfMonth.split('T')[0])

        dashboardData = {
            role,
            monthlyRevenue,
            cumulativeRevenue,
            monthlyStudents: monthlyStudentCount,
            cumulativeStudents: cumulativeStudentCount,
            schools: schoolsWithRevenue, // Filtered list
            schoolTargets: targets || [],
            schoolPendingDistribution,
            coursePendingDistribution,
            teamPerformance,
            totalPendingAmount,
            viewingSchoolId: targetSchoolId,
            viewingSchoolName: activeSchoolName
        }
    } else if (role === 'data_entry') {
        const { data: payments } = await supabase.from('payments').select('amount')
        const cumulativeRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0
        dashboardData = { cumulativeRevenue }
    }


    switch (role) {
        case 'ceo':
        case 'cfo':
        case 'head_of_sales':
        case 'admin':
        case 'project_lead':
        case 'sales_team_lead':
            return <HeadOfSalesDashboard role={role} {...dashboardData} />

        case 'data_entry':
            return <DataEntryDashboard cumulativeStats={dashboardData} />

        case 'sales_executive':
            return <SalesDashboard />

        default:
            return <SalesDashboard />
    }
}
