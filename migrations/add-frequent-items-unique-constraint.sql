-- Add unique constraint on frequent_items to prevent duplicate items per user.
-- Uses lower(item_name) so "Milk" and "milk" are treated as the same item.
--
-- Before running: remove any existing duplicates:
--   DELETE FROM frequent_items a
--   USING frequent_items b
--   WHERE a.id > b.id
--     AND a.user_id = b.user_id
--     AND lower(a.item_name) = lower(b.item_name);

CREATE UNIQUE INDEX IF NOT EXISTS frequent_items_user_item_unique
  ON frequent_items (user_id, lower(item_name));
