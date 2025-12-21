

'use client'

import { useState } from 'react'
import Link from 'next/link' // Added
import { createClient } from '@/lib/supabase/client'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts'
import {
    Loader2, TrendingUp, Target, Users, DollarSign, Calendar,
    PieChart as PieIcon, ArrowLeft  // Added ArrowLeft
} from 'lucide-react'

// Types for props (can refine further)
interface HeadOfSalesDashboardProps {
    role?: string; // New Prop
    viewingSchoolId?: string | null; // New Prop
    viewingSchoolName?: string;      // New Prop
    monthlyRevenue: number;
    cumulativeRevenue: number;
    monthlyStudents: number;
    cumulativeStudents: number;
    totalPendingAmount: number;
    schools: any[];
    schoolTargets: any[];
    schoolPendingDistribution: { name: string, value: number }[];
    coursePendingDistribution?: { name: string, value: number }[];
    teamPerformance?: { id: string, name: string, students: number, revenue: number }[]; // New Prop
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1']

export default function HeadOfSalesDashboard({
    role,
    viewingSchoolId, // New Prop
    viewingSchoolName, // New Prop
    monthlyRevenue,
    cumulativeRevenue,
    monthlyStudents,
    cumulativeStudents,
    totalPendingAmount,
    schools,
    schoolTargets,
    schoolPendingDistribution,
    coursePendingDistribution = [],
    teamPerformance = []
}: HeadOfSalesDashboardProps) {

    // ... (rest of code)

    // ... state ...
    const [loading, setLoading] = useState(false)
    const [settingTarget, setSettingTarget] = useState<string | null>(null) // School ID we are editing
    const [newTarget, setNewTarget] = useState('')

    const supabase = createClient()
    const currentMonthLabel = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
    const monthKey = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

    // Determine view mode
    const isSingleSchool = schools.length === 1
    const distributionData = isSingleSchool ? coursePendingDistribution : schoolPendingDistribution
    const distributionTitle = isSingleSchool ? 'Pending Fees by Course' : 'Pending Fees Distribution'

    // Combine School Data...
    const schoolPerformance = schools.map(school => {
        const target = schoolTargets.find(t => t.school_id === school.id)?.target_revenue || 0
        const actual = school.current_month_revenue || 0
        const progress = target > 0 ? (actual / target) * 100 : 0

        return {
            id: school.id,
            name: school.name,
            Target: Number(target),
            Actual: Number(actual),
            progress
        }
    })

    const totalTarget = schoolPerformance.reduce((sum, s) => sum + s.Target, 0)
    const totalActual = schoolPerformance.reduce((sum, s) => sum + s.Actual, 0)

    const handleSetTarget = async (schoolId: string) => {
        if (!newTarget) return
        setLoading(true)

        // Upsert target
        const { error } = await supabase
            .from('school_targets')
            .upsert({
                school_id: schoolId,
                target_month: monthKey,
                target_revenue: parseFloat(newTarget)
            }, {
                onConflict: 'school_id, target_month'
            })

        if (error) {
            console.error(error)
            alert('Failed to set target')
        } else {
            window.location.reload() // Simple reload to refresh data
        }
        setLoading(false)
        setSettingTarget(null)
    }

    // New logic for dashboard title and back button
    const isGlobalView = !viewingSchoolId && role !== 'project_lead';
    const canDrillDown = ['ceo', 'cfo', 'head_of_sales', 'admin'].includes(role || '');
    const canEditTargets = ['head_of_sales', 'admin', 'sales_team_lead'].includes(role || ''); // Only specific roles can edit targets

    const formatRole = (r: string) => {
        if (!r) return 'Dashboard';
        if (r === 'ceo' || r === 'cfo') return r.toUpperCase();
        return r.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }

    const dashboardTitle = viewingSchoolId
        ? `${viewingSchoolName || 'School'} Overview`
        : role === 'project_lead'
            ? 'Project Lead Dashboard'
            : `${formatRole(role || '')} Overview`;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {viewingSchoolId && canDrillDown && (
                        <Link href="/dashboard" className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                            <ArrowLeft className="h-5 w-5 text-slate-600" />
                        </Link>
                    )}
                    <h1 className="text-2xl font-bold text-slate-900">
                        {dashboardTitle}
                    </h1>
                </div>
            </div>

            {/* Top Stats */}
            <div className="grid gap-4 md:grid-cols-5">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">This Month Revenue</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">₹{monthlyRevenue.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cumulative Revenue</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">₹{cumulativeRevenue.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4 text-red-500" />
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Fees</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">₹{totalPendingAmount.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-purple-500" />
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Month Students</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{monthlyStudents}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-orange-500" />
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Students</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{cumulativeStudents}</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* School Targets Section (Takes 2 cols) */}
                <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">School Targets vs Actuals</h2>
                            <p className="text-sm text-slate-500">Performance for {currentMonthLabel}</p>
                        </div>
                        <div className="flex gap-4 mt-4 md:mt-0">
                            <div className="px-4 py-2 bg-slate-50 rounded-lg border border-slate-100">
                                <p className="text-xs text-slate-500 uppercase font-semibold">Total Target</p>
                                <p className="text-green-600 font-bold">₹{totalTarget.toLocaleString('en-IN')}</p>
                            </div>
                            <div className="px-4 py-2 bg-slate-50 rounded-lg border border-slate-100">
                                <p className="text-xs text-slate-500 uppercase font-semibold">Total Actual</p>
                                <p className="font-bold text-blue-600">
                                    ₹{totalActual.toLocaleString('en-IN')}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="h-80 w-full mb-8">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={schoolPerformance}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, undefined]}
                                />
                                <Legend />
                                <Bar dataKey="Target" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Actual" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pending Fees Distribution Pie Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-6">
                        <PieIcon className="h-5 w-5 text-slate-400" />
                        <h2 className="text-lg font-bold text-slate-900">{distributionTitle}</h2>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={distributionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {distributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: any) => `₹${Number(value).toLocaleString('en-IN')}`} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                        {distributionData.slice(0, 3).map((item, idx) => (
                            <div key={item.name} className="flex justify-between text-sm">
                                <span className="text-slate-600">{item.name}</span>
                                <span className="font-bold text-slate-900">₹{item.value.toLocaleString('en-IN')}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Target Management List */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Manage School Targets</h3>
                <div className="overflow-hidden border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">School</th>
                                <th className="px-6 py-4">Target (Revenue)</th>
                                <th className="px-6 py-4">Actual (Revenue)</th>
                                <th className="px-6 py-4">Progress</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {schoolPerformance.map(school => (
                                <tr key={school.id} className="group hover:bg-slate-50/50">
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        {isGlobalView && canDrillDown ? (
                                            <Link href={`/dashboard?school_id=${school.id}`} className="text-blue-600 hover:underline">
                                                {school.name}
                                            </Link>
                                        ) : (
                                            school.name
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {settingTarget === school.id ? (
                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-400">₹</span>
                                                <input
                                                    autoFocus
                                                    type="number"
                                                    className="w-24 rounded border border-slate-300 px-2 py-1 text-sm outline-none focus:border-blue-500"
                                                    value={newTarget}
                                                    onChange={(e) => setNewTarget(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleSetTarget(school.id)
                                                        if (e.key === 'Escape') setSettingTarget(null)
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <span className="text-slate-600">₹{school.Target.toLocaleString('en-IN')}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-blue-600">
                                        ₹{school.Actual.toLocaleString('en-IN')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-3 bg-slate-200 border border-slate-300 rounded-full overflow-hidden max-w-[100px]">
                                                <div
                                                    className={`h-full rounded-full ${school.progress >= 100 ? 'bg-green-600' : 'bg-blue-600'} `}
                                                    style={{ width: `${Math.min(school.progress, 100)}% ` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs font-semibold text-slate-700">{school.progress.toFixed(0)}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {canEditTargets && (
                                            settingTarget === school.id ? (
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => setSettingTarget(null)} className="text-xs text-slate-500 hover:text-slate-700">Cancel</button>
                                                    <button onClick={() => handleSetTarget(school.id)} className="text-xs font-bold text-blue-600 hover:text-blue-700">Save</button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setNewTarget(school.Target.toString())
                                                        setSettingTarget(school.id)
                                                    }}
                                                    className="text-xs font-medium text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    Set Target
                                                </button>
                                            )
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Team Performance (Project Leads & Drill Down) */}
            {teamPerformance.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mt-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Users className="h-5 w-5 text-slate-400" />
                        <h2 className="text-lg font-bold text-slate-900">Sales Team Performance</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 uppercase font-medium text-xs">
                                <tr>
                                    <th className="px-4 py-3">Rank</th>
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3 text-right">Total Students</th>
                                    <th className="px-4 py-3 text-right">Revenue Generated</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {teamPerformance.map((member, index) => (
                                    <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-slate-500">#{index + 1}</td>
                                        <td className="px-4 py-3 font-medium text-slate-900">{member.name}</td>
                                        <td className="px-4 py-3 text-right text-slate-600">{member.students}</td>
                                        <td className="px-4 py-3 text-right font-bold text-green-600">₹{member.revenue.toLocaleString('en-IN')}</td>
                                    </tr>
                                ))}
                                {teamPerformance.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-slate-400">No Sales Executives assigned to this school yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
