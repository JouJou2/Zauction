-- Reverse Migration: Rename items back to lots
BEGIN;

-- Step 1: Rename tables back
ALTER TABLE items RENAME TO lots;
ALTER TABLE item_media RENAME TO lot_media;

-- Step 2: Rename columns in lots table
ALTER TABLE lots RENAME COLUMN item_number TO lot_number;

-- Step 3: Rename columns in lot_media table
ALTER TABLE lot_media RENAME COLUMN item_id TO lot_id;

-- Step 4: Rename columns in bids table
ALTER TABLE bids RENAME COLUMN item_id TO lot_id;

-- Step 5: Rename columns in watchlist table
ALTER TABLE watchlist RENAME COLUMN item_id TO lot_id;

-- Step 6: Rename indexes and constraints back
ALTER INDEX items_pkey RENAME TO lots_pkey;
ALTER INDEX items_auction_id_item_number_key RENAME TO lots_auction_id_lot_number_key;
ALTER INDEX items_auction_id_idx RENAME TO lots_auction_id_idx;
ALTER INDEX items_status_idx RENAME TO lots_status_idx;
ALTER INDEX items_current_bid_idx RENAME TO lots_current_bid_idx;

ALTER INDEX item_media_pkey RENAME TO lot_media_pkey;
ALTER INDEX item_media_item_id_idx RENAME TO lot_media_lot_id_idx;
ALTER INDEX item_media_item_id_display_order_idx RENAME TO lot_media_lot_id_display_order_idx;

ALTER INDEX bids_item_id_idx RENAME TO bids_lot_id_idx;
ALTER INDEX bids_item_id_created_at_idx RENAME TO bids_lot_id_created_at_idx;

ALTER INDEX watchlist_item_id_idx RENAME TO watchlist_lot_id_idx;
ALTER INDEX watchlist_user_id_item_id_key RENAME TO watchlist_user_id_lot_id_key;

COMMIT;
