
'use client'

import { useState, useEffect } from 'react'
import { createStudent, getCourses } from '@/app/actions'
import { Loader2, AlertCircle } from 'lucide-react'
import { School, Course } from '@/types'

interface AddStudentFormProps {
    schools: School[];
    salesExecutives: any[]; // Partial profile
}

export default function AddStudentForm({ schools, salesExecutives }: AddStudentFormProps) {
    const [selectedSchool, setSelectedSchool] = useState<string>('')
    const [courses, setCourses] = useState<Course[]>([])
    const [loadingCourses, setLoadingCourses] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [totalFee, setTotalFee] = useState(0)
    const [initialPayment, setInitialPayment] = useState(0)
    const [paymentPlan, setPaymentPlan] = useState('one_time')

    const remainingBalance = Math.max(0, totalFee - initialPayment)
    const showBalance = paymentPlan !== 'one_time'

    // Update courses when school changes
    useEffect(() => {
        if (!selectedSchool) {
            setCourses([])
            return
        }

        setLoadingCourses(true)
        getCourses(selectedSchool)
            .then(setCourses)
            .catch(console.error)
            .finally(() => setLoadingCourses(false))
    }, [selectedSchool])

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setSubmitting(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        try {
            const result = await createStudent(formData)
            if (result && 'error' in result) {
                setError(result.error)
                setSubmitting(false)
            }
            // If success, createStudent redirects
        } catch (err: any) {
            setError(err.message || 'Something went wrong')
            setSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-white p-8 rounded-xl shadow-sm border border-slate-100">
            {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Full Name</label>
                    <input
                        name="full_name"
                        required
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder="John Doe"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Phone Number</label>
                    <input
                        name="phone"
                        required
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder="+91 98765 43210"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Email Address</label>
                    <input
                        name="email"
                        type="email"
                        required
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder="john@example.com"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Learning Mode</label>
                    <select
                        name="mode"
                        required
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    >
                        <option value="offline">Offline</option>
                        <option value="online">Online</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Total Sale Value (₹)</label>
                    <input
                        name="total_fee"
                        type="number"
                        required
                        min="0"
                        value={totalFee || ''}
                        onChange={(e) => setTotalFee(parseFloat(e.target.value) || 0)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder="25000"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Payment Plan</label>
                    <select
                        name="payment_plan"
                        required
                        value={paymentPlan}
                        onChange={(e) => setPaymentPlan(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    >
                        <option value="one_time">One Time Payment</option>
                        <option value="emi">EMI</option>
                        <option value="cumulative">Cumulative</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Amount Paid Now (₹)</label>
                    <input
                        name="initial_payment"
                        type="number"
                        min="0"
                        value={initialPayment || ''}
                        onChange={(e) => setInitialPayment(parseFloat(e.target.value) || 0)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder="0"
                    />
                    <p className="text-xs text-slate-500">Leave "0" if no payment is collected yet.</p>
                </div>

                {showBalance && (
                    <div className="space-y-2 md:col-span-2 bg-slate-50 p-4 rounded-lg border border-slate-100 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200">
                        <div>
                            <p className="text-sm font-medium text-slate-700">Detailed Breakdown</p>
                            <p className="text-xs text-slate-500">Total: ₹{totalFee.toLocaleString()} - Paid: ₹{initialPayment.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Remaining Balance</p>
                            <p className="text-xl font-bold text-orange-600">₹{remainingBalance.toLocaleString()}</p>
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">School</label>
                    <select
                        name="school_id"
                        required
                        value={selectedSchool}
                        onChange={(e) => setSelectedSchool(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    >
                        <option value="">Select School</option>
                        {schools.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Course</label>
                    <select
                        name="course_id"
                        required
                        disabled={!selectedSchool || loadingCourses}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none disabled:bg-slate-50"
                    >
                        <option value="">Select Course</option>
                        {courses.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Assigned Sales Executive</label>
                    <select
                        name="assigned_sales_id"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    >
                        <option value="">Unassigned</option>
                        {salesExecutives.map(exec => (
                            <option key={exec.id} value={exec.id}>{exec.full_name || 'Unknown'}</option>
                        ))}
                    </select>
                    <p className="text-xs text-slate-500">Optional. Can be assigned later.</p>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                    {submitting && <Loader2 className="animate-spin h-4 w-4" />}
                    Create Student
                </button>
            </div>
        </form>
    )
}
