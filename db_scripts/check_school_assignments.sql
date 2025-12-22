SELECT p.full_name, p.role, s.name as school_name 
FROM profiles p
LEFT JOIN schools s ON p.school_id = s.id;
