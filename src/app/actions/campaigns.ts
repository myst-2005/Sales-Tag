
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache' // Import needed? Yes.
import { redirect } from 'next/navigation'
import Papa from 'papaparse'

export async function createCampaign(formData: FormData) {
    const supabase = await createClient()

    const name = formData.get('name') as string
    const target_course_id = formData.get('target_course_id') as string
    const target_school_id = formData.get('target_school_id') as string
    const start_date = formData.get('start_date') as string
    const file = formData.get('csv_file') as File
    const phoneListText = formData.get('phone_list') as string

    if (!file && !phoneListText) {
        return { error: 'Please provide a CSV file or a list of phone numbers' }
    }

    // 1. Create Campaign
    const { data: campaign, error: campError } = await supabase
        .from('campaigns')
        .insert({
            name,
            target_course_id: target_course_id || null,
            target_school_id: target_school_id || null,
            start_date: start_date || null
        })
        .select()
        .single()

    if (campError) return { error: campError.message }

    let leadsToProcess: { phone: string, data?: any }[] = []

    // 2. Parse CSV if exists
    if (file && file.size > 0) {
        const text = await file.text()
        const { data: rows } = Papa.parse(text, { header: true, skipEmptyLines: true })
        // If header parsing fails or simple list
        if (rows.length > 0) {
            leadsToProcess = leadsToProcess.concat((rows as any[]).map((row: any) => ({
                phone: normalizePhone(row.phone || row.Phone || Object.values(row)[0] as string),
                data: row
            })))
        }
    }

    // 3. Parse Text Input if exists
    if (phoneListText) {
        const manualNumbers = phoneListText.split(/[\n,]+/).map(s => s.trim()).filter(Boolean)
        leadsToProcess = leadsToProcess.concat(manualNumbers.map(p => ({
            phone: normalizePhone(p),
            data: { source: 'manual_input' }
        })))
    }

    if (leadsToProcess.length === 0) {
        // No valid leads found
        return { success: true } // Or error?
    }

    // 4. Find matches in DB
    // Extract unique normalized phones to query
    const uniquePhones = Array.from(new Set(leadsToProcess.map(l => l.phone).filter(Boolean)))

    // Fetch generic matches from students table
    // Chunking might be needed for very large lists (e.g. > 1000 items in IN clause)
    // For MVP, assuming < 2000 leads usually.
    const { data: matches } = await supabase
        .from('students')
        .select('id, phone')
        .in('phone', uniquePhones)

    const phoneMap = new Map(matches?.map((s: any) => [s.phone, s.id]))

    const leadsToInsert = leadsToProcess
        .filter(l => l.phone) // Ensure valid phone
        .map(l => {
            const studentId = phoneMap.get(l.phone)
            return {
                campaign_id: campaign.id,
                phone: l.phone,
                raw_data: l.data,
                is_converted: !!studentId,
                converted_student_id: studentId || null
            }
        })

    // 5. Batch Insert
    if (leadsToInsert.length > 0) {
        const { error: leadsError } = await supabase
            .from('campaign_leads')
            .insert(leadsToInsert)

        if (leadsError) {
            return { error: 'Campaign created but leads failed: ' + leadsError.message }
        }
    }

    revalidatePath('/dashboard/campaigns')
    redirect('/dashboard/campaigns')
}

export async function updateCampaign(campaignId: string, formData: FormData) {
    const supabase = await createClient()

    const name = formData.get('name') as string
    const target_course_id = formData.get('target_course_id') as string
    const target_school_id = formData.get('target_school_id') as string
    const start_date = formData.get('start_date') as string
    const file = formData.get('csv_file') as File
    const phoneListText = formData.get('phone_list') as string

    // 1. Update basic details
    const updates: any = {
        name,
        target_course_id: target_course_id || null,
        target_school_id: target_school_id || null,
        start_date: start_date || null
    }

    const { error } = await supabase
        .from('campaigns')
        .update(updates)
        .eq('id', campaignId)

    if (error) return { error: error.message }

    // 2. Process NEW Leads if provided (this is additive)
    let leadsToProcess: { phone: string, data?: any }[] = []

    if (file && file.size > 0) {
        const text = await file.text()
        const { data: rows } = Papa.parse(text, { header: true, skipEmptyLines: true })
        if (rows.length > 0) {
            leadsToProcess = leadsToProcess.concat((rows as any[]).map((row: any) => ({
                phone: normalizePhone(row.phone || row.Phone || Object.values(row)[0] as string),
                data: row
            })))
        }
    }

    if (phoneListText) {
        const manualNumbers = phoneListText.split(/[\n,]+/).map(s => s.trim()).filter(Boolean)
        leadsToProcess = leadsToProcess.concat(manualNumbers.map(p => ({
            phone: normalizePhone(p),
            data: { source: 'manual_input' }
        })))
    }

    if (leadsToProcess.length > 0) {
        const uniquePhones = Array.from(new Set(leadsToProcess.map(l => l.phone).filter(Boolean)))

        // Match against Students
        const { data: matches } = await supabase
            .from('students')
            .select('id, phone')
            .in('phone', uniquePhones)

        const phoneMap = new Map(matches?.map((s: any) => [s.phone, s.id]))

        // Check for existing leads in this campaign to avoid duplicates (based on phone mostly)
        // ideally unique constraint on (campaign_id, phone). For now just blindly insert or ignore?
        // Let's assume user wants to add more. Postgres will error if unique constraint exists.
        // We haven't added unique constraint yet. So duplicates possible.
        // Let's check existing briefly
        const { data: existing } = await supabase
            .from('campaign_leads')
            .select('phone')
            .eq('campaign_id', campaignId)
            .in('phone', uniquePhones)

        const existingSet = new Set(existing?.map((e: any) => e.phone))

        const leadsToInsert = leadsToProcess
            .filter(l => l.phone && !existingSet.has(l.phone))
            .map(l => {
                const studentId = phoneMap.get(l.phone)
                return {
                    campaign_id: campaignId,
                    phone: l.phone,
                    raw_data: l.data,
                    is_converted: !!studentId,
                    converted_student_id: studentId || null
                }
            })

        if (leadsToInsert.length > 0) {
            const { error: leadsError } = await supabase
                .from('campaign_leads')
                .insert(leadsToInsert)

            if (leadsError) return { error: 'Failed to add new leads: ' + leadsError.message }
        }
    }

    revalidatePath(`/dashboard/campaigns/${campaignId}`)
    revalidatePath('/dashboard/campaigns')
    redirect(`/dashboard/campaigns/${campaignId}`)
}

function normalizePhone(phone: string): string {
    if (!phone) return ''
    // Keep only digits
    let clean = phone.replace(/\D/g, '')
    // Optional: logic to handle +91 or other prefixes if your DB is consistent.
    // For now, strict digit matching is safest if DB is messy.
    // If DB has "9876..." and input is "919876...", simple replace might fail.
    // Better: if > 10 digits and starts with 91, strip 91? 
    // Let's keep it simple: just digits.
    return clean
}

export async function getCampaigns() {
    const supabase = await createClient()
    // We want stats too
    const { data, error } = await supabase
        .from('campaigns')
        .select(`
            *,
            target_course:courses(name),
            leads:campaign_leads(is_converted) 
        `)
        .order('created_at', { ascending: false })

    if (error) throw error

    // Aggregate stats in JS (Supabase doesn't support easy count-aggregates in select without view/rpc)
    return data.map((c: any) => ({
        ...c,
        total_leads: c.leads.length,
        converted: c.leads.filter((l: any) => l.is_converted).length
    }))
}

export async function deleteCampaign(id: string) {
    const supabase = await createClient()

    // Campaign Leads will cascade delete if foreign key set up correctly.
    // If not, might need manual deletion, but let's assume cascade or just try deleting campaign.
    const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Delete error', error)
        throw new Error(error.message)
    }

    revalidatePath('/dashboard/campaigns')
}
