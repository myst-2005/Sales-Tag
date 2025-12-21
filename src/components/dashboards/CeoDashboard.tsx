
'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { CheckCircle, DollarSign, Users } from 'lucide-react'

// Passing data as props is cleaner than fetching inside client component usually,
// but for a dashboard widget, props are good.

export default function CeoDashboard({ stats }: { stats: any }) {
    const chartData = stats.campaigns.map((c: any) => ({
        name: c.name,
        rate: c.conversion_rate
    }))

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">CEO Overview</h2>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Revenue</p>
                        <h3 className="text-2xl font-bold text-slate-900">₹{stats.revenue.toLocaleString()}</h3>
                    </div>
                    <div className="p-3 bg-green-50 text-green-600 rounded-full">
                        <DollarSign className="h-6 w-6" />
                    </div>
                </div>

                <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Pending Collections</p>
                        <h3 className="text-2xl font-bold text-slate-900">₹{stats.pending.toLocaleString()}</h3>
                    </div>
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-full">
                        <CheckCircle className="h-6 w-6" />
                    </div>
                </div>

                <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Active Campaigns</p>
                        <h3 className="text-2xl font-bold text-slate-900">{stats.campaigns.length}</h3>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                        <Users className="h-6 w-6" />
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96 min-w-0">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Campaign Conversion Rates (%)</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Bar dataKey="rate" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
