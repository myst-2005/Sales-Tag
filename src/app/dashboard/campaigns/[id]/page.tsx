
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Megaphone, GraduationCap, ChevronLeft, School as SchoolIcon } from 'lucide-react'
import Link from 'next/link'

import DownloadReportButton from '@/components/campaigns/DownloadReportButton'

export default async function CampaignDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()


    // 1. Fetch Campaign + Leads + Converted Student Info
    const { data: campaign, error } = await supabase
        .from('campaigns')
        .select(`
            *,
            leads:campaign_leads(
                id,
                is_converted,
                student:students!converted_student_id(
                     id,
                     full_name,
                     phone,
                     email,
                     schools(name),
                     courses(name)
                )
            )
        `)
        .eq('id', id)
        .single()

    if (error || !campaign) {
        if (error) console.error(error)
        notFound()
    }

    // 2. Process Stats
    const totalLeads = campaign.leads.length
    const convertedLeads = campaign.leads.filter((l: any) => l.is_converted)
    const convertedCount = convertedLeads.length
    const conversionRate = totalLeads > 0 ? ((convertedCount / totalLeads) * 100).toFixed(1) : '0.0'

    // Group by School
    const schoolStats = convertedLeads.reduce((acc: any, lead: any) => {
        const schoolName = lead.student?.schools?.name || 'Unknown School'
        acc[schoolName] = (acc[schoolName] || 0) + 1
        return acc
    }, {})

    // Group by Course
    const courseStats = convertedLeads.reduce((acc: any, lead: any) => {
        const courseName = lead.student?.courses?.name || 'Unknown Course'
        acc[courseName] = (acc[courseName] || 0) + 1
        return acc
    }, {})

    // Find "Most With"
    const topSchool = Object.entries(schoolStats).sort((a: any, b: any) => b[1] - a[1])[0]
    const topCourse = Object.entries(courseStats).sort((a: any, b: any) => b[1] - a[1])[0]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/campaigns" className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900">{campaign.name}</h1>
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                        {campaign.target_course_id ? 'Targeted' : 'General'}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <DownloadReportButton campaignName={campaign.name} />
                    <Link href={`/dashboard/campaigns/${id}/edit`} className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
                        Edit Details
                    </Link>
                </div>
            </div>

            <div id="campaign-report-content" className="space-y-6 p-4 bg-slate-50/50">
                {/* Print Header */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">{campaign.name}</h2>
                    <div className="flex gap-4 text-sm text-slate-500">
                        <span>Report Generated: {new Date().toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{campaign.target_course_id ? 'Targeted Campaign' : 'General Campaign'}</span>
                    </div>
                </div>

                {/* Overview Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Leads</p>
                        <p className="text-3xl font-bold text-slate-900 mt-2">{totalLeads}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Converted</p>
                        <p className="text-3xl font-bold text-green-600 mt-2">{convertedCount}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Conversion Rate</p>
                        <p className="text-3xl font-bold text-blue-600 mt-2">{conversionRate}%</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Pending</p>
                        <p className="text-3xl font-bold text-slate-400 mt-2">{totalLeads - convertedCount}</p>
                    </div>
                </div>

                {/* Breakdown Section */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* School Stats */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <SchoolIcon className="h-5 w-5 text-slate-400" />
                            School Performance
                        </h3>
                        {topSchool && (
                            <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-100">
                                <p className="text-xs text-orange-600 font-medium uppercase">Top Performing School</p>
                                <div className="flex justify-between items-end mt-1">
                                    <p className="text-lg font-bold text-orange-900">{topSchool[0]}</p>
                                    <p className="text-2xl font-bold text-orange-600">{topSchool[1] as number} <span className="text-sm font-normal text-orange-800">converted</span></p>
                                </div>
                            </div>
                        )}
                        <div className="space-y-3">
                            {Object.entries(schoolStats).map(([name, count]: any) => (
                                <div key={name} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50">
                                    <span className="text-sm font-medium text-slate-700">{name}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                                            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(count / convertedCount) * 100}%` }}></div>
                                        </div>
                                        <span className="text-sm font-bold text-slate-900">{count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Course Stats */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-slate-400" />
                            Course Performance
                        </h3>
                        {topCourse && (
                            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <p className="text-xs text-blue-600 font-medium uppercase">Top Performing Course</p>
                                <div className="flex justify-between items-end mt-1">
                                    <p className="text-lg font-bold text-blue-900">{topCourse[0]}</p>
                                    <p className="text-2xl font-bold text-blue-600">{topCourse[1] as number} <span className="text-sm font-normal text-blue-800">converted</span></p>
                                </div>
                            </div>
                        )}
                        <div className="space-y-3">
                            {Object.entries(courseStats).map(([name, count]: any) => (
                                <div key={name} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50">
                                    <span className="text-sm font-medium text-slate-700">{name}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                                            <div className="bg-purple-500 h-full rounded-full" style={{ width: `${(count / convertedCount) * 100}%` }}></div>
                                        </div>
                                        <span className="text-sm font-bold text-slate-900">{count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Matched Students List */}
                {convertedLeads.length > 0 && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Matched Students ({convertedLeads.length})</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Student Name</th>
                                        <th className="px-4 py-3 font-semibold">Phone</th>
                                        <th className="px-4 py-3 font-semibold">Email</th>
                                        <th className="px-4 py-3 font-semibold">School</th>
                                        <th className="px-4 py-3 font-semibold">Course</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {convertedLeads.map((lead: any) => (
                                        <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-slate-900">
                                                {lead.student?.full_name || 'N/A'}
                                            </td>
                                            <td className="px-4 py-3 text-slate-500">
                                                {lead.student?.phone || lead.phone || 'N/A'}
                                            </td>
                                            <td className="px-4 py-3 text-slate-500">
                                                {lead.student?.email || 'N/A'}
                                            </td>
                                            <td className="px-4 py-3 text-slate-500">
                                                {lead.student?.schools?.name || 'N/A'}
                                            </td>
                                            <td className="px-4 py-3 text-slate-500">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                                                    {lead.student?.courses?.name || 'N/A'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

