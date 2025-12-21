
'use client'

import { useState } from 'react'
import { Plus, X, Loader2 } from 'lucide-react'
import { setExecutiveTarget } from '@/app/actions/targets'

interface SetTargetModalProps {
    executiveId: string
    currentTarget: number
    executiveName: string
}

export default function SetTargetModal({ executiveId, currentTarget, executiveName }: SetTargetModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [target, setTarget] = useState(currentTarget.toString())

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsLoading(true)

        await setExecutiveTarget(executiveId, Number(target))

        setIsLoading(false)
        setIsOpen(false)
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors"
            >
                Set Target
            </button>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95">
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-900">Set Target for {executiveName}</h3>
                    <button onClick={() => setIsOpen(false)}><X className="h-4 w-4 text-slate-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Revenue Target (₹)</label>
                        <input
                            type="number"
                            required
                            min="0"
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                            className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                        Save Target
                    </button>
                </form>
            </div>
        </div>
    )
}
