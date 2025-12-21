
// ... (Previous actions omitted, append this) or I should use 'append' if I could, but I must overwrite or careful replace. 
// I'll add new functions to actions.ts using replace_file_content or a new file `actions/payment.ts`.
// Next.js actions are usually in one file or imported. I'll append to `src/app/actions.ts` using `write_to_file` but I have to read it first to not overwrite?
// Ah, `write_to_file` overwrites. I should use `multi_replace` or read then write.
// Use `read_resource` or `view_file`? No, I'll use `multi_replace_file_content` to append to the end of `src/app/actions.ts`.
// Actually, `replace_file_content` can't append easily without a target.
// I'll just create `src/app/actions/payments.ts` if I can.
// But calling separate server action files is fine.

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function searchStudentByPhone(phone: string) {
    const supabase = await createClient()

    // Get student + payments
    const { data: student, error } = await supabase
        .from('students')
        .select(`
      *,
      courses (name),
      assigned_sales:profiles!assigned_sales_id (full_name),
      payments (amount)
    `)
        .eq('phone', phone)
        .single()

    if (error || !student) return null

    // Calculate totals
    const totalPaid = student.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0
    const balance = student.total_fee - totalPaid

    return {
        ...student,
        total_paid: totalPaid,
        balance
    }
}

export async function addPayment(studentId: string, amount: number, type: string, remarks: string) {
    const supabase = await createClient()

    // Verify balance? User said "Payment amount cannot exceed balance"
    // We need to fetch current state inside the transaction or check before.
    // Ideally Postgres function, but let's check here.

    const { data: student } = await supabase
        .from('students')
        .select('total_fee, payments(amount)')
        .eq('id', studentId)
        .single()

    if (!student) return { error: 'Student not found' }

    const totalPaid = student.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0
    const balance = student.total_fee - totalPaid

    if (amount > balance) {
        return { error: `Amount exceeds balance. Pending: ${balance}` }
    }

    const { error } = await supabase.from('payments').insert({
        student_id: studentId,
        amount,
        payment_type: type,
        remarks
    })

    if (error) return { error: error.message }

    revalidatePath('/dashboard/payments')
    revalidatePath('/dashboard/students') // Maybe balances are shown there
    return { success: true }
}
