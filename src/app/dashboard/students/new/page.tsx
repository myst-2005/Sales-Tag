
import { getSchools, getSalesExecutives } from '@/app/actions'
import AddStudentForm from '@/components/students/AddStudentForm'

export default async function NewStudentPage() {
    const [schools, salesExecutives] = await Promise.all([
        getSchools(),
        getSalesExecutives()
    ])

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">New Student Admission</h1>
            <AddStudentForm schools={schools || []} salesExecutives={salesExecutives || []} />
        </div>
    )
}
