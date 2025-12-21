
import Link from 'next/link'
import { Clock } from 'lucide-react'

export default function PendingPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <div className="max-w-md text-center bg-white p-8 rounded-xl shadow-sm border border-slate-100">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 mb-6">
                    <Clock className="h-8 w-8 text-orange-600" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Account Pending Approval</h1>
                <p className="text-slate-500 mb-8">
                    Your account has been created successfully! Please wait for an administrator to approve your access request.
                </p>
                <Link href="/login" className="text-blue-600 font-medium hover:underline">
                    Back to Login
                </Link>
            </div>
        </div>
    )
}
