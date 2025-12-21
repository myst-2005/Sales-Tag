
'use client'

import { useState } from 'react'
import { deleteCampaign } from '@/app/actions/campaigns'
import { Trash2, Loader2 } from 'lucide-react'

export default function DeleteCampaignButton({ id }: { id: string }) {
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
            setLoading(true)
            await deleteCampaign(id)
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
        >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Delete
        </button>
    )
}
