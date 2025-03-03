# Recurring Transactions Documentation

## Overview
This document describes how recurring transactions (both expenses and incomes) are handled in the personal finance application.

## Database Schema

### Expenses Table
| Column | Type | Description |
|--------|------|-------------|
| is_recurring | boolean | Indicates if this is a recurring expense |
| recurring_frequency | string | Frequency of recurrence (daily, weekly, monthly, yearly) |

### Incomes Table
| Column | Type | Description |
|--------|------|-------------|
| is_recurring | boolean | Indicates if this is a recurring income |
| recurring_frequency | string | Frequency of recurrence (daily, weekly, monthly, yearly) |

## Frontend Implementation

### Data Flow
1. User sets a transaction as recurring in the UI
2. Frontend sends data with `isRecurring` and `recurringFrequency` properties
3. `BudgetContext` prepares data for database using `prepareIncomeForDb` or `prepareExpenseForDb`
4. Data is saved to Supabase with correct column names

### Key Files

#### `src/context/BudgetContext.tsx`
Contains the logic for handling recurring transactions:
- `prepareExpenseForDb`: Transforms expense data for database storage
- `prepareIncomeForDb`: Transforms income data for database storage
- `processRecurringExpenses`: Generates future instances of recurring expenses
- `processRecurringIncomes`: Generates future instances of recurring incomes

#### `src/types/supabase.ts`
Contains TypeScript types for the database schema, including:
- `expenses` table definition
- `incomes` table definition
- Type definitions for recurring transaction properties

## Recent Changes (March 2025)

### Property Name Standardization
We standardized the property names between frontend and database:
- Changed `recurring` to `is_recurring`
- Changed `recurring_interval` to `recurring_frequency`

### Migration
A migration script was created at `migrations/rename_recurring_columns.sql` to update existing database columns.

### Code Updates
1. Updated `BudgetContext.tsx` to use new property names
2. Updated Supabase types to reflect new column names
3. Ensured data transformation functions use correct property mapping

## Usage Example

```typescript
// Creating a recurring expense
const recurringExpense = {
  description: "Monthly Rent",
  amount: 1000,
  date: new Date(),
  currency: "ARS",
  category: "housing",
  isRecurring: true,
  recurringFrequency: "monthly"
};

// The system will automatically:
// 1. Transform property names for database storage
// 2. Generate future instances based on frequency
// 3. Update all related budgets
```

## Troubleshooting

### Common Issues
1. **Transaction not showing as recurring**: Verify that both `isRecurring` and `recurringFrequency` are set correctly
2. **Future instances not generating**: Check the date format and ensure it's a valid date
3. **Database errors**: Ensure the database migration has been executed through Supabase dashboard
