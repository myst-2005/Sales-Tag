-- Add FK constraint if flexible join is failing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'students_assigned_sales_id_fkey') THEN
        ALTER TABLE students
        ADD CONSTRAINT students_assigned_sales_id_fkey
        FOREIGN KEY (assigned_sales_id) REFERENCES profiles(id);
    END IF;
END$$;
