-- Add blockchain_tx_hash column to surveys table
-- This column will store the transaction hash from the Movement blockchain

ALTER TABLE surveys 
ADD COLUMN blockchain_tx_hash TEXT;

-- Add an index for faster lookups by transaction hash
CREATE INDEX IF NOT EXISTS idx_surveys_blockchain_tx_hash 
ON surveys(blockchain_tx_hash);

-- Add a comment to document the column
COMMENT ON COLUMN surveys.blockchain_tx_hash IS 'Transaction hash from Movement blockchain when survey is created on-chain';

-- Optional: Update existing surveys to mark them as database-only
UPDATE surveys 
SET blockchain_tx_hash = NULL 
WHERE blockchain_tx_hash IS NULL;

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'surveys' 
AND column_name = 'blockchain_tx_hash';