
import { createClient } from '@/lib/supabase/server'
import StudentList from '@/components/students/StudentList'

export default async function StudentsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    let userRole = null
    let userSchoolId = null

    if (user) {
        const { data: profile } = await supabase.from('profiles').select('role, school_id').eq('id', user.id).single()
        userRole = profile?.role
        userSchoolId = profile?.school_id
    }

    // Fetch students
    let query = supabase
        .from('students')
        .select(`
      *,
      schools (name),
      courses (name),
      assigned_sales:profiles!students_assigned_sales_id_fkey (full_name)
    `)

    // Restrict data for specific roles
    if (userRole && ['sales_executive', 'project_lead', 'sales_team_lead'].includes(userRole)) {
        if (userSchoolId) {
            query = query.eq('school_id', userSchoolId)
        }
    }

    const { data: students, error } = await query.order('created_at', { ascending: false })

    if (error) {
        console.error(error)
        return <div>Error loading students</div>
    }

    return <StudentList students={students || []} userRole={userRole} />
}
