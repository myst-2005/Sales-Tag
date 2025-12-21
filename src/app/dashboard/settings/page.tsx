import ChangePasswordForm from '@/components/settings/ChangePasswordForm'
import { Settings, Lock } from 'lucide-react'

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                    <Lock className="h-5 w-5 text-slate-500" />
                    <h2 className="text-lg font-bold text-slate-900">Security</h2>
                </div>

                <div className="space-y-1 mb-6">
                    <h3 className="text-sm font-medium text-slate-900">Change Password</h3>
                    <p className="text-sm text-slate-500">Ensure your account is using a long, random password to stay secure.</p>
                </div>

                <ChangePasswordForm />
            </div>
        </div>
    )
}
