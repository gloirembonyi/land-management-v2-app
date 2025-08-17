-- Fix documents table foreign key constraint
-- Drop the problematic foreign key constraint and create a proper validation

-- First, drop the existing foreign key constraint that's causing issues
ALTER TABLE land_management.documents 
DROP CONSTRAINT IF EXISTS documents_uploaded_by_fkey;

-- Create a validation function for documents uploaded_by field
CREATE OR REPLACE FUNCTION land_management.validate_documents_uploaded_by(user_id_text TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if the text can be converted to integer and exists in public.users
    IF user_id_text ~ '^[0-9]+$' THEN
        RETURN EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = user_id_text::INTEGER
        );
    END IF;
    
    -- If not numeric, check if it exists in neon_auth.users_sync
    RETURN EXISTS (
        SELECT 1 FROM neon_auth.users_sync 
        WHERE id = user_id_text
    );
END;
$$ LANGUAGE plpgsql;

-- Add a check constraint using the validation function
ALTER TABLE land_management.documents 
ADD CONSTRAINT documents_uploaded_by_valid 
CHECK (land_management.validate_documents_uploaded_by(uploaded_by));

-- Test the constraint with a sample query
SELECT 'Documents foreign key constraint fixed successfully' as status;
