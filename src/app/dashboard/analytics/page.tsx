
import { getGlobalStats } from '@/app/actions/analytics'
import CeoDashboard from '@/components/dashboards/CeoDashboard'

export default async function AnalyticsPage() {
    // Reusing the global stats for now as it contains the key metrics
    const stats = await getGlobalStats()

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900">Detailed Analytics</h1>
            <p className="text-slate-500">Deep dive into your revenue and campaign performance.</p>
            <div className="border-t border-slate-200 pt-6">
                <CeoDashboard stats={stats} />
            </div>
        </div>
    )
}
