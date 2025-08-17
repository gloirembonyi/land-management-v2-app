-- Drop the problematic foreign key constraint and create proper validation
-- Drop the existing foreign key constraint that's causing the type mismatch
ALTER TABLE land_management.lands DROP CONSTRAINT IF EXISTS lands_owner_id_fkey;

-- Create a function to validate that owner_id exists in public.users
CREATE OR REPLACE FUNCTION land_management.validate_owner_id(owner_id_text TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if the text can be converted to integer and exists in public.users
    RETURN EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = CAST(owner_id_text AS INTEGER)
    );
EXCEPTION
    WHEN invalid_text_representation THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Add a check constraint to validate owner_id
ALTER TABLE land_management.lands 
ADD CONSTRAINT lands_owner_id_valid 
CHECK (land_management.validate_owner_id(owner_id));

-- Ensure the constraint is enabled
ALTER TABLE land_management.lands VALIDATE CONSTRAINT lands_owner_id_valid;
