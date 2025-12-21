
'use client'

import { updateCampaign } from '@/app/actions/campaigns'
import { getSchools, getCourses } from '@/app/actions'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Upload, ChevronLeft } from 'lucide-react'
import { Course } from '@/types'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
    const [campaignId, setCampaignId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [campaign, setCampaign] = useState<any>(null)
    const [schools, setSchools] = useState<any[]>([])
    const [courses, setCourses] = useState<Course[]>([])
    const [selectedSchool, setSelectedSchool] = useState('')
    const [loadingCourses, setLoadingCourses] = useState(false)
    const router = useRouter()

    useEffect(() => {
        params.then(p => setCampaignId(p.id))
    }, [params])

    useEffect(() => {
        if (!campaignId) return

        const fetchData = async () => {
            const supabase = createClient()
            // Fetch Campaign
            const { data: c } = await supabase
                .from('campaigns')
                .select('*')
                .eq('id', campaignId)
                .single()

            // Fetch Schools
            const s = await getSchools()

            setCampaign(c)
            setSchools(s || [])
            if (c?.target_school_id) {
                setSelectedSchool(c.target_school_id)
            }
            setLoading(false)
        }
        fetchData()
    }, [campaignId])

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

    if (loading) return <div className="p-12 text-center"><Loader2 className="animate-spin h-8 w-8 mx-auto text-slate-400" /></div>
    if (!campaign) return <div>Campaign not found</div>

    const handleSubmit = async (formData: FormData) => {
        if (!campaignId) return
        const res = await updateCampaign(campaignId, formData)
        // updateCampaign handles redirect, but if error:
        if (res?.error) {
            alert(res.error)
        }
    }

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href={`/dashboard/campaigns/${campaignId}`} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                    <ChevronLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-2xl font-bold text-slate-900">Edit Campaign</h1>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
                <form action={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Campaign Name</label>
                        <input
                            name="name"
                            defaultValue={campaign.name}
                            required
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />
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
                                {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Course (Optional)</label>
                            <select
                                name="target_course_id"
                                defaultValue={campaign.target_course_id || ''}
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
                        <input
                            name="start_date"
                            type="date"
                            defaultValue={campaign.start_date}
                            required
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />
                    </div>

                    <div className="border-t border-slate-100 pt-6 mt-6">
                        <h3 className="text-sm font-bold text-slate-900 mb-4">Add More Leads (Optional)</h3>
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
                                className="w-full h-24 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 resize-none font-mono"
                            ></textarea>
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-blue-600 text-white rounded-lg py-3 font-medium hover:bg-blue-700">
                        Update Campaign
                    </button>
                </form>
            </div>
        </div>
    )
}
