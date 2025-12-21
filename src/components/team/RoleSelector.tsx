'use client'

import { updateRole } from '@/app/actions/team'

interface RoleSelectorProps {
    userId: string
    currentRole: string | null
}

export default function RoleSelector({ userId, currentRole }: RoleSelectorProps) {
    return (
        <form action={updateRole} className="flex items-center gap-2">
            <input type="hidden" name="userId" value={userId} />
            <select
                name="role"
                defaultValue={currentRole || 'sales_executive'}
                className="bg-slate-100 border-none text-xs rounded-md py-1 pl-2 pr-6 font-medium text-slate-700 cursor-pointer hover:bg-slate-200 focus:ring-1 focus:ring-blue-500"
                onChange={(e) => e.target.form?.requestSubmit()}
            >
                <option value="head_of_sales">Head of Sales</option>
                <option value="project_lead">Project Lead</option>
                <option value="sales_team_lead">Sales Team Lead</option>
                <option value="sales_executive">Sales Executive</option>
                <option value="cfo">CFO</option>
                <option value="ceo">CEO</option>
                <option value="data_entry">Data Entry</option>
                <option value="admin">Admin</option>
            </select>
        </form >
    )
}
