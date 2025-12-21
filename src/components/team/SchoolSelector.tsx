
'use client'

import { updateSchool } from '@/app/actions/team'

interface SchoolSelectorProps {
    userId: string
    currentSchoolId: string | null
    schools: { id: string, name: string }[]
}

export default function SchoolSelector({ userId, currentSchoolId, schools }: SchoolSelectorProps) {
    return (
        <form action={updateSchool} className="flex items-center gap-2">
            <input type="hidden" name="userId" value={userId} />
            <select
                name="schoolId"
                defaultValue={currentSchoolId || ''}
                className="bg-slate-50 border border-slate-200 text-xs rounded-md py-1 pl-2 pr-6 text-slate-600 cursor-pointer hover:bg-slate-100 focus:ring-1 focus:ring-blue-500 max-w-[150px] truncate"
                onChange={(e) => e.target.form?.requestSubmit()}
            >
                <option value="">No School</option>
                {schools.map(school => (
                    <option key={school.id} value={school.id}>{school.name}</option>
                ))}
            </select>
        </form>
    )
}
