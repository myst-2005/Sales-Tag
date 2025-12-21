
import { getCampaigns } from '@/app/actions/campaigns'
import Link from 'next/link'
import { Plus, Megaphone } from 'lucide-react'

import DeleteCampaignButton from '@/components/campaigns/DeleteCampaignButton'

export default async function CampaignsPage() {
    const campaigns = await getCampaigns()

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Campaigns</h1>
                <Link
                    href="/dashboard/campaigns/new"
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors w-full sm:w-auto justify-center"
                >
                    <Plus className="h-4 w-4" />
                    New Campaign
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {campaigns?.map((c: any) => {
                    const conversionRate = c.total_leads > 0
                        ? ((c.converted / c.total_leads) * 100).toFixed(1)
                        : '0.0'

                    return (
                        <div key={c.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                            <Link href={`/dashboard/campaigns/${c.id}`} className="block">
                                <div>
                                    <div className="flex items-start justify-between">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                            <Megaphone className="h-5 w-5" />
                                        </div>
                                        <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                                            {c.status}
                                        </span>
                                    </div>
                                    <h3 className="mt-4 font-bold text-lg text-slate-900">{c.name}</h3>
                                    <p className="text-sm text-slate-500 mb-4">{c.target_course?.name || 'General Campaign'}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-4">
                                    <div>
                                        <div className="text-xs text-slate-500">Leads</div>
                                        <div className="text-xl font-bold text-slate-900">{c.total_leads}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500">Converted</div>
                                        <div className="text-xl font-bold text-green-600">{c.converted}</div>
                                    </div>
                                    <div className="col-span-2">
                                        <div className="text-xs text-slate-500 mb-1">Conversion Rate</div>
                                        <div className="w-full bg-slate-100 rounded-full h-2">
                                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${conversionRate}%` }}></div>
                                        </div>
                                        <div className="text-right text-xs font-medium text-green-600 mt-1">{conversionRate}%</div>
                                    </div>
                                </div>
                            </Link>
                            <div className="mt-4 pt-4 border-t border-slate-50 flex justify-end">
                                <DeleteCampaignButton id={c.id} />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
