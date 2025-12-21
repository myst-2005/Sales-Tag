export type Role = 'ceo' | 'cfo' | 'head_of_sales' | 'sales_executive' | 'data_entry' | 'admin' | 'project_lead' | 'sales_team_lead';

export type StudentMode = 'online' | 'offline';

export interface School {
    id: string;
    name: string;
}

export interface Course {
    id: string;
    school_id: string;
    name: string;
}

export interface Profile {
    id: string;
    role: Role;
    full_name: string | null;
    email: string | null;
    school_id?: string | null;
    is_approved?: boolean;
    phone?: string | null;
}

export interface Student {
    id: string;
    full_name: string;
    phone: string;
    email: string;
    school_id: string;
    course_id: string;
    mode: StudentMode;
    assigned_sales_id?: string | null;
    total_fee: number;
    payment_plan?: 'one_time' | 'emi' | 'cumulative';
    created_by?: string | null;
    created_at: string;
    updated_at: string;

    // Joins
    schools?: School;
    courses?: Course;
    assigned_sales?: Profile;
}

export interface Payment {
    id: string;
    student_id: string;
    amount: number;
    payment_type: 'one_time' | 'emi' | 'cumulative';
    payment_date: string; // ISO Date
    remarks?: string | null;
    created_by?: string | null;
    created_at: string;
}

export interface Campaign {
    id: string;
    name: string;
    target_course_id?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    status: string;
}
