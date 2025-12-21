
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone, Mail, MapPin, Calendar, CreditCard, DollarSign } from 'lucide-react'

// Helper to format currency
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount)
}

export default async function StudentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    // 1. Fetch Student Details
    const { data: student, error } = await supabase
        .from('students')
        .select(`
            *,
            schools (name),
            courses (name),
            assigned_sales:profiles!students_assigned_sales_id_fkey (full_name, email, phone)
        `)
        .eq('id', id)
        .single()

    if (error || !student) {
        notFound()
    }

    // 2. Fetch Payments
    const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .eq('student_id', id)
        .order('payment_date', { ascending: false })

    // Calculate totals
    const totalPaid = payments?.reduce((sum, p) => sum + p.amount, 0) || 0
    const pendingAmount = student.total_fee - totalPaid

    // Status Logic
    const isFullyPaid = pendingAmount <= 0
    const progressPercentage = Math.min(100, Math.max(0, (totalPaid / student.total_fee) * 100)) || 0

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/students"
                    className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{student.full_name}</h1>
                    <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {student.phone}
                        </span>
                        {student.email && (
                            <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" /> {student.email}
                            </span>
                        )}
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${student.mode === 'online' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                            {student.mode.toUpperCase()}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Info Card */}
                <div className="md:col-span-2 space-y-6">
                    {/* Course & School Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-blue-500" />
                            Academic Details
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">School</label>
                                <p className="text-base font-medium text-slate-900 mt-1">{student.schools?.name}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Course</label>
                                <p className="text-base font-medium text-slate-900 mt-1">{student.courses?.name}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Assigned Sales</label>
                                <p className="text-base font-medium text-slate-900 mt-1">
                                    {student.assigned_sales?.full_name || 'Unassigned'}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Joining Date</label>
                                <p className="text-base font-medium text-slate-900 mt-1">
                                    {student.joining_date ? new Date(student.joining_date).toLocaleDateString() : '-'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Payment History */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-purple-500" />
                                Payment History
                            </h2>
                            {/* We could add an "Add Payment" button here comfortably later */}
                        </div>

                        {payments && payments.length > 0 ? (
                            <div className="relative overflow-hidden rounded-lg border border-slate-100">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-slate-500">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">Date</th>
                                            <th className="px-4 py-3 font-medium">Type</th>
                                            <th className="px-4 py-3 font-medium">Remarks</th>
                                            <th className="px-4 py-3 font-medium text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {payments.map((p: any) => (
                                            <tr key={p.id}>
                                                <td className="px-4 py-3 text-slate-600">
                                                    {new Date(p.payment_date).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3 text-slate-900 capitalize">
                                                    {p.payment_type?.replace('_', ' ')}
                                                </td>
                                                <td className="px-4 py-3 text-slate-500 max-w-xs truncate">
                                                    {p.remarks || '-'}
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium text-slate-900">
                                                    {formatCurrency(p.amount)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-slate-500 text-sm italic py-4">No payments recorded yet.</p>
                        )}
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-green-500" />
                            Fee Status
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-500">Paid So Far</span>
                                    <span className="font-semibold text-green-600">{formatCurrency(totalPaid)}</span>
                                </div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-500">Total Fee</span>
                                    <span className="font-medium text-slate-900">{formatCurrency(student.total_fee)}</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-2">
                                    <div
                                        className={`h-full rounded-full ${isFullyPaid ? 'bg-green-500' : 'bg-blue-500'}`}
                                        style={{ width: `${progressPercentage}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pending Balance</label>
                                <p className={`text-2xl font-bold mt-1 ${pendingAmount > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                    {formatCurrency(Math.max(0, pendingAmount))}
                                </p>
                            </div>

                            <div className="pt-2">
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Payment Plan</label>
                                <p className="text-base font-medium text-slate-900 mt-1 capitalize">
                                    {student.payment_plan?.replace('_', ' ') || 'One Time'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Admim Actions (Reset/Edit) could go here later */}
                </div>
            </div>
        </div>
    )
}
