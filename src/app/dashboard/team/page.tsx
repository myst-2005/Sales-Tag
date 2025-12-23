
import { createClient } from '@/lib/supabase/server'
import { Check, X, Shield, Trash2 } from 'lucide-react'
import { redirect } from 'next/navigation'
import { toggleApproval } from '@/app/actions/team'
import { deleteUser } from '@/app/actions/admin-users' // Added import
import RoleSelector from '@/components/team/RoleSelector'
import SchoolSelector from '@/components/team/SchoolSelector'

import AddUserModal from '@/components/team/AddUserModal'
import AddSchoolModal from '@/components/team/AddSchoolModal'

export default async function TeamPage() {
    const supabase = await createClient()

    // Fetch specific fields
    const { data: users } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

    const { data: schools } = await supabase
        .from('schools')
        .select('id, name')
        .order('name')

    const { data: { user: currentUser } } = await supabase.auth.getUser()
    const currentProfile = users?.find(u => u.id === currentUser?.id)

    if (currentProfile?.role !== 'admin' && currentProfile?.role !== 'data_entry') {
        redirect('/dashboard')
    }

    const isAdmin = currentProfile?.role === 'admin'

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Team Management</h1>
                <div className="flex gap-3">
                    <AddSchoolModal />
                    <AddUserModal schools={schools || []} />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-3 font-medium text-slate-500">User</th>
                            <th className="px-6 py-3 font-medium text-slate-500">Role</th>
                            <th className="px-6 py-3 font-medium text-slate-500">School</th>
                            <th className="px-6 py-3 font-medium text-slate-500">Status</th>
                            <th className="px-6 py-3 font-medium text-slate-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users?.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-slate-900">{user.full_name || 'No Name'}</div>
                                    <div className="text-slate-500 text-xs">{user.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <RoleSelector userId={user.id} currentRole={user.role} />
                                </td>
                                <td className="px-6 py-4">
                                    {['sales_executive', 'project_lead', 'sales_team_lead'].includes(user.role) ? (
                                        <SchoolSelector userId={user.id} currentSchoolId={user.school_id} schools={schools || []} />
                                    ) : (
                                        <span className="text-slate-400 text-xs">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {user.is_approved ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                            <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                                            Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700">
                                            <span className="h-1.5 w-1.5 rounded-full bg-orange-500"></span>
                                            Pending
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <form action={toggleApproval.bind(null, user.id, user.is_approved)}>
                                            <button
                                                className={`p-2 rounded-lg transition-colors ${user.is_approved ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}
                                                title={user.is_approved ? "Revoke Access" : "Approve User"}
                                            >
                                                {user.is_approved ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                                            </button>
                                        </form>
                                        {isAdmin && user.id !== currentUser?.id && (
                                            <form action={deleteUser.bind(null, user.id)}>
                                                <button
                                                    className="p-2 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
