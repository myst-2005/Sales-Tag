'use client'

import { useState } from 'react'
import { updatePassword } from '@/app/actions/auth'
import { Loader2, KeyRound } from 'lucide-react'

export default function ChangePasswordForm() {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        setMessage(null)

        const res = await updatePassword(formData)

        if (res.error) {
            setMessage({ type: 'error', text: res.error })
        } else if (res.success) {
            setMessage({ type: 'success', text: res.success as string })
            // Optional: Reset form via ref if needed, but controlled inputs might be better or just let it be
            const form = document.getElementById('change-password-form') as HTMLFormElement
            form?.reset()
        }

        setLoading(false)
    }

    return (
        <form id="change-password-form" action={handleSubmit} className="space-y-4 max-w-md">
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">New Password</label>
                <input
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Confirm Password</label>
                <input
                    name="confirmPassword"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
            </div>

            {message && (
                <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                Update Password
            </button>
        </form>
    )
}
