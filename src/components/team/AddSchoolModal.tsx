
'use client'

import { useState } from 'react'
import { Plus, Loader2, School as SchoolIcon } from 'lucide-react'
import { createSchool } from '@/app/actions/team'

export default function AddSchoolModal() {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const res = await createSchool(formData)

        if (res && res.error) {
            setError(res.error)
        } else {
            setIsOpen(false)
            // Clear form? Native form reset happens or we can do it manually if needed, but closing modal destroys state usually or we reset
        }
        setLoading(false)
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
                <SchoolIcon className="h-4 w-4" />
                Add School
            </button>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 animate-in fade-in zoom-in-95 duration-200">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Add New School</h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">School Name</label>
                        <input
                            name="name"
                            required
                            placeholder="e.g. Haris & Co Academy (HACA)"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                            autoFocus
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                        >
                            {loading && <Loader2 className="animate-spin h-4 w-4" />}
                            Create School
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
