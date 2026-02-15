-- Quick SQL script to make a user an admin
-- Update the first user in the database to have Admin role

UPDATE "user" 
SET role = 'Admin' 
WHERE id = (SELECT id FROM "user" LIMIT 1);

-- Verify the update
SELECT id, name, role FROM "user" WHERE role = 'Admin';
