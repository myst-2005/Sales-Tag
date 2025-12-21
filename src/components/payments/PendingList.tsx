
'use client'

import { useState, useEffect } from 'react'
import { getSchools, getSalesExecutives } from '@/app/actions'
import { getPendingCollections } from '@/app/actions/collections'
import { School, Profile } from '@/types'
import { Filter, Loader2, Phone, User, BookOpen } from 'lucide-react'

export default function PendingList() {
    const [schools, setSchools] = useState<School[]>([])
    const [salesExecs, setSalesExecs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [students, setStudents] = useState<any[]>([])

    // Filters
    const [selectedSchool, setSelectedSchool] = useState('')
    const [selectedSales, setSelectedSales] = useState('')

    // Initial Load
    useEffect(() => {
        Promise.all([getSchools(), getSalesExecutives()]).then(([sData, seData]) => {
            setSchools(sData || [])
            setSalesExecs(seData || [])
        })
    }, [])

    // Fetch Data when filters change
    useEffect(() => {
        setLoading(true)
        getPendingCollections({
            schoolId: selectedSchool || undefined,
            salesId: selectedSales || undefined
        }).then(data => {
            setStudents(data)
            setLoading(false)
        })
    }, [selectedSchool, selectedSales])

    const totalPending = students.reduce((sum, s) => sum + s.balance, 0)

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    Pending Collections
                    <span className="text-sm font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {students.length} Students
                    </span>
                </h2>

                {/* Filters */}
                <div className="flex gap-2">
                    <select
                        value={selectedSchool}
                        onChange={(e) => setSelectedSchool(e.target.value)}
                        className="text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                    >
                        <option value="">All Schools</option>
                        {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>

                    <select
                        value={selectedSales}
                        onChange={(e) => setSelectedSales(e.target.value)}
                        className="text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                    >
                        <option value="">All Sales Execs</option>
                        {salesExecs.map(se => <option key={se.id} value={se.id}>{se.full_name}</option>)}
                    </select>
                </div>
            </div>

            {/* Total Banner */}
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-orange-800">Total Pending Amount</p>
                    <p className="text-2xl font-bold text-orange-900">₹{totalPending.toLocaleString()}</p>
                </div>
                <Filter className="h-8 w-8 text-orange-200" />
            </div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="animate-spin h-8 w-8 text-slate-400" />
                </div>
            ) : students.length === 0 ? (
                <div className="text-center p-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-slate-500">No pending collections found requiring attention.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {students.map(student => (
                        <div key={student.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-slate-900">{student.full_name}</h3>
                                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                                        <Phone className="h-3 w-3" /> {student.phone}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                                        {student.payment_plan?.replace('_', ' ') || 'One Time'}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-slate-600 mb-4">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="h-4 w-4 text-slate-400" />
                                    <span className="truncate">{student.courses?.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-slate-400" />
                                    <span className="truncate">{student.assigned_sales?.full_name || 'Unassigned'}</span>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex justify-between items-end">
                                <div>
                                    <p className="text-xs text-slate-500">Paid: ₹{student.total_paid.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-semibold text-orange-600 uppercase">Pending</p>
                                    <p className="text-lg font-bold text-slate-900">₹{student.balance.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
