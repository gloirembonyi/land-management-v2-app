-- Fix foreign key constraints for land management system

-- First, drop the existing foreign key constraint if it exists
ALTER TABLE land_management.lands 
DROP CONSTRAINT IF EXISTS lands_owner_id_fkey;

-- Add the correct foreign key constraint that references public.users.id
-- We need to cast the text owner_id to integer to match public.users.id
ALTER TABLE land_management.lands 
ADD CONSTRAINT lands_owner_id_fkey 
FOREIGN KEY (owner_id) 
REFERENCES public.users(id::text);

-- Actually, let's do this properly by creating a function to handle the constraint
-- Drop the constraint again
ALTER TABLE land_management.lands 
DROP CONSTRAINT IF EXISTS lands_owner_id_fkey;

-- Create a proper constraint that allows text representation of integer IDs
-- We'll validate that the owner_id can be cast to integer and exists in public.users
CREATE OR REPLACE FUNCTION validate_owner_id(owner_id_text text) 
RETURNS boolean AS $$
BEGIN
  -- Check if the text can be cast to integer and exists in public.users
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = owner_id_text::integer
  );
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Add a check constraint instead of foreign key for more flexibility
ALTER TABLE land_management.lands 
ADD CONSTRAINT lands_owner_id_check 
CHECK (validate_owner_id(owner_id));

-- Also ensure we have proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_lands_owner_id ON land_management.lands(owner_id);
CREATE INDEX IF NOT EXISTS idx_lands_status ON land_management.lands(status);
CREATE INDEX IF NOT EXISTS idx_lands_for_sale ON land_management.lands(is_for_sale) WHERE is_for_sale = true;

-- Fix transactions table constraints as well
ALTER TABLE land_management.transactions 
DROP CONSTRAINT IF EXISTS transactions_seller_id_fkey;

ALTER TABLE land_management.transactions 
DROP CONSTRAINT IF EXISTS transactions_buyer_id_fkey;

-- Add check constraints for transactions
ALTER TABLE land_management.transactions 
ADD CONSTRAINT transactions_seller_id_check 
CHECK (validate_owner_id(seller_id));

ALTER TABLE land_management.transactions 
ADD CONSTRAINT transactions_buyer_id_check 
CHECK (validate_owner_id(buyer_id));

-- Add indexes for transactions
CREATE INDEX IF NOT EXISTS idx_transactions_seller_id ON land_management.transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON land_management.transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON land_management.transactions(status);
