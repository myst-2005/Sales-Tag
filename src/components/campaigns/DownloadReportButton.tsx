'use client'

import { Download } from 'lucide-react'
import { useState } from 'react'
import { toPng } from 'html-to-image'
import jsPDF from 'jspdf'

export default function DownloadReportButton({ campaignName }: { campaignName: string }) {
    const [loading, setLoading] = useState(false)

    const handleDownload = async () => {
        const element = document.getElementById('campaign-report-content')
        if (!element) return

        setLoading(true)
        try {
            // html-to-image uses browser rendering via SVG, avoiding manual CSS parsing issues with Tailwind v4 (oklab/oklch)
            const dataUrl = await toPng(element, { backgroundColor: '#ffffff', cacheBust: true })

            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            })

            const imgProps = pdf.getImageProperties(dataUrl)
            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight)
            pdf.save(`${campaignName.replace(/\s+/g, '_')}_Report.pdf`)
        } catch (err) {
            console.error('PDF generation failed', err)
            alert('Failed to generate PDF. See console for details.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleDownload}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium disabled:opacity-50"
        >
            <Download className="h-4 w-4" />
            {loading ? 'Generating...' : 'Download Report'}
        </button>
    )
}
