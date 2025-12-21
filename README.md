# SaleTag - Sales Management Application

SaleTag is a comprehensive sales management and student performance tracking application designed for educational institutions. It facilitates the management of students, campaigns, payments, and team performance across various roles.

## Features

-   **Role-Based Access Control (RBAC)**: Secure access tailored to specific roles (CEO, CFO, Head of Sales, etc.).
-   **Student Management**: Track student enrollment, courses, and learning modes (Online/Offline).
-   **Campaign Management**: Create and monitor marketing campaigns, track leads, and conversion rates.
-   **Financial Tracking**: Record and monitor student payments, pending fees, and revenue targets.
-   **Team Performance**: Set revenue targets for schools and track the performance of sales executives.
-   **Responsive Design**: Mobile-friendly interface for on-the-go access.

## User Roles & Functions

The application supports a hierarchy of roles, each with specific permissions:

| Role | Description | Key Functions |
| :--- | :--- | :--- |
| **CEO / CFO** | Top-level management | View global dashboards, total revenue, and all student data. |
| **Admin** | System Administrator | Manage users, approve accounts, and full system access. |
| **Head of Sales** | Sales Logic Controller | Set targets, view all sales performance, manage campaigns. |
| **Project Lead** | Project Manager | Oversee specific projects or schools. |
| **Sales Team Lead** | Team Supervisor | Manage specific sales teams and their targets. |
| **Sales Executive** | Frontline Sales | View assigned leads/students, track personal targets. |
| **Data Entry** | Operational Support | Enter student data and record payments (No delete access). |

## Database Schema

The application uses a relational database (Supabase/PostgreSQL) with the following key tables:

### 1. `users` (Managed by Supabase Auth)
-   Handles authentication and login credentials.

### 2. `profiles`
-   **Relation**: Extends `users`.
-   **Purpose**: Stores user profile data and roles.
-   **Columns**: `id`, `role`, `full_name`, `email`, `school_id`, `is_approved`.

### 3. `schools`
-   **Purpose**: Defines the institutions (e.g., Marketing School, Tech School).
-   **Columns**: `id`, `name`.

### 4. `courses`
-   **Purpose**: Specific courses offered under each school.
-   **Relation**: Belongs to a `school`.
-   **Columns**: `id`, `school_id`, `name`.

### 5. `students`
-   **Purpose**: Core entity representing enrolled students.
-   **Relation**: Linked to `schools`, `courses`, and assigned `sales_executive`.
-   **Columns**: `id`, `full_name`, `phone`, `email`, `mode` (Online/Offline), `total_fee`.

### 6. `payments`
-   **Purpose**: Records financial transactions.
-   **Relation**: Links to `students`.
-   **Columns**: `id`, `student_id`, `amount`, `payment_type`, `remarks`.

### 7. `campaigns` & `campaign_leads`
-   **Purpose**: Marketing tracking.
-   **Columns**: `id`, `name`, `target_course`, `leads_count`, `converted_count`.

### 8. `school_targets`
-   **Purpose**: Monthly revenue targets for schools.
-   **Columns**: `school_id`, `target_month`, `target_revenue`.

## Tech Stack

-   **Framework**: Next.js 14+ (App Router)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS
-   **Database**: Supabase (PostgreSQL)
-   **Charts**: Recharts
-   **Icons**: Lucide React

## Getting Started

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/myst-2005/Sales-Tag.git
    cd Sales-Tag
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env.local` file with your Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
    ```

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## License

Private / Proprietary.
