
'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Plus, Search, Filter } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Student } from '@/types'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

interface StudentListProps {
    students: any[];
    userRole?: string;
}

export default function StudentList({ students, userRole }: StudentListProps) {
    const [search, setSearch] = useState('')
    const [selectedSchool, setSelectedSchool] = useState('All')
    const [dateFilter, setDateFilter] = useState('All')

    // Derived state for filtering
    const filteredStudents = useMemo(() => {
        return students.filter(s => {
            const matchesSearch = s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
                s.phone?.includes(search)
            const matchesSchool = selectedSchool === 'All' || s.schools?.name === selectedSchool

            let matchesDate = true
            if (dateFilter === 'This Month') {
                const date = new Date(s.created_at)
                const now = new Date()
                matchesDate = date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
            }

            return matchesSearch && matchesSchool && matchesDate
        })
    }, [students, search, selectedSchool, dateFilter])

    // Stats for Charts
    const modeStats = useMemo(() => {
        const stats = { Online: 0, Offline: 0 }
        filteredStudents.forEach(s => {
            if (s.mode === 'online') stats.Online++
            else stats.Offline++
        })
        return Object.entries(stats).map(([name, value]) => ({ name, value }))
    }, [filteredStudents])

    const courseStats = useMemo(() => {
        const stats: Record<string, number> = {}
        filteredStudents.forEach(s => {
            const course = s.courses?.name || 'Unknown'
            stats[course] = (stats[course] || 0) + 1
        })
        return Object.entries(stats)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5) // Top 5
    }, [filteredStudents])

    const schoolStats = useMemo(() => {
        const stats: Record<string, number> = {}
        filteredStudents.forEach(s => {
            const school = s.schools?.name || 'Unknown'
            stats[school] = (stats[school] || 0) + 1
        })
        return Object.entries(stats)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5) // Top 5
    }, [filteredStudents])

    const schools = Array.from(new Set(students.map(s => s.schools?.name).filter(Boolean)))

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Students</h1>
                {userRole !== 'head_of_sales' && (
                    <Link
                        href="/dashboard/students/new"
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors w-full md:w-auto justify-center"
                    >
                        <Plus className="h-4 w-4" />
                        Add Student
                    </Link>
                )}
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 md:grid-cols-3">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-700 mb-4">Learning Mode</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={modeStats}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {modeStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-700 mb-4">Course Enrollment</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={courseStats}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {courseStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-700 mb-4">School Distribution</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={schoolStats}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {schoolStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-100">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name or phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    />
                </div>
                <div className="flex gap-2">
                    <div className="flex items-center gap-2 min-w-[160px]">
                        <Filter className="h-4 w-4 text-slate-400" />
                        <select
                            value={selectedSchool}
                            onChange={(e) => setSelectedSchool(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"
                        >
                            <option value="All">All Schools</option>
                            {schools.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="items-center gap-2 min-w-[160px] hidden md:flex">
                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"
                        >
                            <option value="All">All Time</option>
                            <option value="This Month">This Month</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 font-medium">Name</th>
                            <th className="px-6 py-4 font-medium">School / Course</th>
                            <th className="px-6 py-4 font-medium">Mode</th>
                            <th className="px-6 py-4 font-medium">Assigned Sales Executive</th>
                            <th className="px-6 py-4 font-medium text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map((student) => (
                                <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{student.full_name}</div>
                                        <div className="text-xs text-slate-500">{student.phone}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-slate-900">{student.courses?.name}</div>
                                        <div className="text-xs text-slate-500">{student.schools?.name}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${student.mode === 'online' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                                            }`}>
                                            {student.mode}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {student.assigned_sales?.full_name || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/dashboard/students/${student.id}`}
                                            className="text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                    <div className="flex flex-col items-center justify-center p-4">
                                        <p className="text-lg font-medium text-slate-900">No students found</p>
                                        <p className="text-sm text-slate-500 mt-1">Try adjusting your search or filters.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="text-xs text-slate-400 text-center">
                Showing {filteredStudents.length} of {students.length} students
            </div>
        </div>
    )
}
