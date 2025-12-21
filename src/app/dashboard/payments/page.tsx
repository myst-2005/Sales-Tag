
'use client'

import { useState } from 'react'
import { searchStudentByPhone, addPayment } from '@/app/actions/payments'
import { Search, CreditCard, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Student } from '@/types'
import PendingList from '@/components/payments/PendingList'

export default function PaymentsPage() {
    const [phone, setPhone] = useState('')
    const [student, setStudent] = useState<any | null>(null)
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState<{ type: 'error' | 'success', text: string } | null>(null)

    // Payment Form
    const [amount, setAmount] = useState('')
    const [remarks, setRemarks] = useState('')
    const [paying, setPaying] = useState(false)

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMsg(null)
        setStudent(null)

        try {
            const result = await searchStudentByPhone(phone)
            if (result) {
                setStudent(result)
            } else {
                setMsg({ type: 'error', text: 'Student not found with this phone number.' })
            }
        } catch (err) {
            setMsg({ type: 'error', text: 'Search failed.' })
        } finally {
            setLoading(false)
        }
    }

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!student) return
        setPaying(true)
        setMsg(null)

        const payAmount = parseFloat(amount)
        if (isNaN(payAmount) || payAmount <= 0) {
            setMsg({ type: 'error', text: 'Invalid amount' })
            setPaying(false)
            return
        }

        try {
            const res = await addPayment(student.id, payAmount, 'cumulative', remarks)
            if (res.error) {
                setMsg({ type: 'error', text: res.error })
            } else {
                setMsg({ type: 'success', text: 'Payment recorded successfully!' })
                // Clear form
                setAmount('')
                setRemarks('')
                // Refresh student data
                const fresh = await searchStudentByPhone(phone)
                setStudent(fresh)
            }
        } catch (err) {
            setMsg({ type: 'error', text: 'Payment failed.' })
        } finally {
            setPaying(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quick Cumulative Payment</h1>

            {/* Search Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                    <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Student Phone (e.g. 9876543210)"
                        className="flex-1 rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                    <button
                        type="submit"
                        disabled={loading || !phone}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Search className="h-4 w-4" />}
                        Search
                    </button>
                </form>
            </div>

            {msg && (
                <div className={`p-4 rounded-lg flex items-center gap-2 ${msg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {msg.type === 'error' ? <AlertCircle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                    {msg.text}
                </div>
            )}

            {/* Result Section */}
            {student && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50">
                        <div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Student</div>
                            <div className="text-lg font-bold text-slate-900">{student.full_name}</div>
                            <div className="text-sm text-slate-500">{student.phone}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Course</div>
                            <div className="text-lg font-medium text-slate-900">{student.courses?.name}</div>
                            <div className="text-sm text-slate-500">Sales Exec: {student.assigned_sales?.full_name || 'None'}</div>
                        </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-slate-100">
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                            <div className="text-xs text-slate-500 font-medium">Total Fee</div>
                            <div className="text-xl font-bold text-slate-900">₹{student.total_fee}</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-xs text-green-600 font-medium">Paid</div>
                            <div className="text-xl font-bold text-green-700">₹{student.total_paid}</div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-xs text-blue-600 font-medium">Balance</div>
                            <div className="text-xl font-bold text-blue-700">₹{student.balance}</div>
                        </div>
                    </div>

                    <div className="p-6">
                        <h3 className="text-sm font-medium text-slate-900 mb-4 flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Record New Payment
                        </h3>
                        <form onSubmit={handlePayment} className="grid gap-4 md:grid-cols-2 items-end">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-600">Amount</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-slate-500">₹</span>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full pl-7 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-600">Remarks (Optional)</label>
                                <input
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    placeholder="e.g. Cash, UPI Ref..."
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <button
                                    type="submit"
                                    disabled={paying || !amount}
                                    className="w-full bg-green-600 text-white rounded-lg py-2 font-medium hover:bg-green-700 disabled:opacity-50 flex justify-center"
                                >
                                    {paying ? <Loader2 className="animate-spin h-5 w-5" /> : 'Confirm Payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="pt-8 border-t border-slate-200">
                <PendingList />
            </div>
        </div>
    )
}
