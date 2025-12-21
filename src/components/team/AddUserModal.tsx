'use client'

import { useState } from 'react'
import { createUser } from '@/app/actions/admin-users'
import { Plus, X, Loader2 } from 'lucide-react'

interface AddUserModalProps {
    schools: { id: string, name: string }[]
    currentUserRole?: string // Optional for backward compatibility initally
}

export default function AddUserModal({ schools, currentUserRole }: AddUserModalProps) {
    const isRestrictedUser = currentUserRole === 'sales_executive' || currentUserRole === 'data_entry'

    // Default restricted users to adding Sales Executives only
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedRole, setSelectedRole] = useState(isRestrictedUser ? 'sales_executive' : 'sales_executive')
    const [createLogin, setCreateLogin] = useState(!isRestrictedUser) // Default false/true logic can stay, but maybe simpler is fine

    // ... handleSubmit ...
    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setError(null)

        const formData = new FormData(event.currentTarget)
        const res = await createUser(formData)

        setIsLoading(false)

        if (res?.error) {
            setError(res.error)
        } else {
            setIsOpen(false)
            // Optional: Show success toast
        }
    }

    const isSalesExec = selectedRole === 'sales_executive'
    const isSalesTeamLead = selectedRole === 'sales_team_lead'
    const isProjectLead = selectedRole === 'project_lead'
    const showLoginFields = createLogin || !(isSalesExec || isSalesTeamLead) // Sales Exec and Sales Team Lead can opt out of login
    const showSchoolAssignment = isSalesExec || isSalesTeamLead || isProjectLead

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
            >
                <Plus className="h-4 w-4" />
                Add New User
            </button>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900">Add New Team Member</h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-slate-400 hover:text-slate-500 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Error display ... */}
                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Full Name</label>
                        <input
                            required
                            name="fullName"
                            type="text"
                            placeholder="e.g. John Doe"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Role</label>
                        <div className="relative">
                            <select
                                required
                                name="role"
                                value={selectedRole}
                                onChange={(e) => {
                                    const newRole = e.target.value
                                    setSelectedRole(newRole)
                                    if (newRole === 'sales_executive') setCreateLogin(false)
                                    else setCreateLogin(true)
                                }}
                                disabled={isRestrictedUser} // Disable if restricted
                                className="w-full appearance-none px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white disabled:bg-slate-100 disabled:text-slate-500"
                            >
                                <option value="sales_executive">Sales Executive</option>
                                {!isRestrictedUser && (
                                    <>
                                        <option value="head_of_sales">Head of Sales</option>
                                        <option value="project_lead">Project Lead</option>
                                        <option value="sales_team_lead">Sales Team Lead</option>
                                        <option value="data_entry">Data Entry Specialist</option>
                                        <option value="cfo">Chief Financial Officer (CFO)</option>
                                        <option value="ceo">Chief Executive Officer (CEO)</option>
                                        <option value="admin">Administrator</option>
                                    </>
                                )}
                            </select>
                            {!isRestrictedUser && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                </div>
                            )}
                        </div>
                        {isRestrictedUser && <p className="text-xs text-slate-400 mt-1">You function as a recruiter/lead and can only add Sales Executives.</p>}
                    </div>

                    {isSalesExec && (
                        <div className="flex items-center gap-2 py-1">
                            <input
                                type="checkbox"
                                id="createLogin"
                                checked={createLogin}
                                onChange={(e) => setCreateLogin(e.target.checked)}
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="createLogin" className="text-sm text-slate-600">
                                Create Login Account (Email & Password)
                            </label>
                        </div>
                    )}

                    {showLoginFields ? (
                        <>
                            <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                <label className="text-sm font-medium text-slate-700">Email Address</label>
                                <input
                                    required={showLoginFields}
                                    name="email"
                                    type="email"
                                    placeholder="john@example.com"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                            </div>

                            <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                <label className="text-sm font-medium text-slate-700">Password</label>
                                <input
                                    required={showLoginFields}
                                    name="password"
                                    type="password"
                                    minLength={6}
                                    placeholder="••••••••"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                            </div>
                        </>
                    ) : (
                        <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                            <label className="text-sm font-medium text-slate-700">Phone Number</label>
                            <input
                                required={!showLoginFields}
                                name="phone"
                                type="tel"
                                placeholder="e.g. 9876543210"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                            <p className="text-xs text-slate-500">A placeholder account will be created. They cannot log in.</p>
                        </div>
                    )}

                    {showSchoolAssignment && (
                        <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                            <label className="text-sm font-medium text-slate-700">School Assignment</label>
                            <div className="relative">
                                <select
                                    required
                                    name="schoolId"
                                    className="w-full appearance-none px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                                >
                                    <option value="">Select a School...</option>
                                    {schools.map(school => (
                                        <option key={school.id} value={school.id}>{school.name}</option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                </div>
                            </div>
                            {(selectedRole === 'project_lead' || selectedRole === 'sales_team_lead') && (
                                <p className="text-xs text-slate-500 mt-1">This role must be assigned to a school to view its data.</p>
                            )}
                        </div>
                    )}

                    <div className="pt-4 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
                        >
                            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                            Create User
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
