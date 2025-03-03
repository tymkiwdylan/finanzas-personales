-- Rename columns in expenses table
ALTER TABLE expenses RENAME COLUMN recurring TO is_recurring;
ALTER TABLE expenses RENAME COLUMN recurring_interval TO recurring_frequency;

-- Rename columns in incomes table
ALTER TABLE incomes RENAME COLUMN recurring TO is_recurring;
ALTER TABLE incomes RENAME COLUMN recurring_interval TO recurring_frequency;
