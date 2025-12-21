
'use client'

import { createCampaign } from '@/app/actions/campaigns'
import { getCourses } from '@/app/actions' // Reuse
import { useState, useEffect } from 'react'
import { Loader2, Upload } from 'lucide-react'
import { Course } from '@/types'

// Need to select School? Probably campaigns target a specific course, so yes.
// Simplified: Just select course directly (assuming user knows the course and school).
// Or select School -> Course.

// Since I haven't exported an action to get ALL courses (only by school), I'll fetch schools first.
// Oh wait, `createCampaign` takes `target_course_id`.

export default function NewCampaignPage() {
    const [schools, setSchools] = useState<any[]>([])
    const [courses, setCourses] = useState<Course[]>([])
    const [selectedSchool, setSelectedSchool] = useState('')
    const [loadingCourses, setLoadingCourses] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        import('@/app/actions').then(mod => {
            mod.getSchools().then(data => setSchools(data || []))
        })
    }, [])

    useEffect(() => {
        if (!selectedSchool) {
            setCourses([])
            return
        }
        setLoadingCourses(true)
        getCourses(selectedSchool).then(data => {
            setCourses(data || [])
            setLoadingCourses(false)
        })
    }, [selectedSchool])

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsSubmitting(true)
        setError(null)

        const formData = new FormData(event.currentTarget)
        const result = await createCampaign(formData)

        if (result?.error) {
            setError(result.error)
            setIsSubmitting(false)
        } else {
            // Success - creating campaign redirects, so we don't strictly need to do anything here.
            // But if it didn't redirect (e.g. success json), we'd handle it.
            // The action redirects on success, so component unmounts likely.
        }
    }

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Import Campaign Leads</h1>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Campaign Name</label>
                        <input name="name" required placeholder="e.g. Summer Bootcamp Blast" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">School (Optional)</label>
                            <select
                                name="target_school_id"
                                value={selectedSchool}
                                onChange={(e) => setSelectedSchool(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                            >
                                <option value="">Select School</option>
                                <option value="">General (No specific school)</option>
                                {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Course (Optional)</label>
                            <select
                                name="target_course_id"
                                disabled={!selectedSchool || loadingCourses}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:bg-slate-50"
                            >
                                <option value="">Select Course</option>
                                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Start Date</label>
                        <input name="start_date" type="date" required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Source of Leads</label>
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                            <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                            <input name="csv_file" type="file" accept=".csv" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                            <p className="text-xs text-slate-400 mt-2">Upload CSV (Columns: Name, Phone)</p>
                        </div>
                        <div className="text-center text-xs text-slate-400 font-medium my-2">- OR -</div>
                        <textarea
                            name="phone_list"
                            placeholder="Paste list of phone numbers (comma or new line separated)...&#10;9876543210, 9988776655"
                            className="w-full h-32 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 resize-none font-mono"
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 text-white rounded-lg py-3 font-medium hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                        {isSubmitting && <Loader2 className="animate-spin h-5 w-5" />}
                        {isSubmitting ? 'Creating...' : 'Upload & Create Campaign'}
                    </button>
                </form>
            </div>
        </div>
    )
}
