# Unique Register Number Implementation

## Overview
We've implemented a system to ensure register numbers are unique in the application form, with both client-side and server-side validation:

1. **Client-side real-time validation**: The form checks in real-time if a register number already exists in the database
2. **Server-side constraint**: A unique constraint on the database level ensures data integrity

## Implementation Details

### Client-Side Validation

In `src/app/apply/page.tsx`, we implemented:

1. State variables to track validation:
   ```tsx
   const [registerNumberError, setRegisterNumberError] = useState<string | null>(null);
   const [isCheckingRegisterNumber, setIsCheckingRegisterNumber] = useState(false);
   ```

2. A debounced function to reduce database calls:
   ```tsx
   const debounce = (func: Function, delay: number) => {
     let timeoutId: NodeJS.Timeout;
     return function(...args: any[]) {
       clearTimeout(timeoutId);
       timeoutId = setTimeout(() => {
         func(...args);
       }, delay);
     };
   };
   ```

3. Supabase query to check for existing register numbers:
   ```tsx
   const checkRegisterNumberUnique = async (registerNumber: string) => {
     // Query Supabase to check if register number exists
     const { data, error } = await supabase
       .from('applications')
       .select('register_number')
       .eq('register_number', registerNumber);
     
     // Set error state based on results
     if (data && data.length > 0) {
       setRegisterNumberError('This register number is already in use.');
     } else {
       setRegisterNumberError(null);
     }
   };
   ```

4. UI feedback in the form:
   - Red border and error message when register number is already in use
   - Loading indicator while checking
   - Form submission prevention when there's an error

### Database-Level Constraint

In `supabase/migrations/001_add_register_number_unique_constraint.sql`:

```sql
ALTER TABLE applications ADD CONSTRAINT applications_register_number_unique UNIQUE (register_number);
```

This adds a unique constraint at the database level, providing a second layer of protection against duplicate register numbers.

## How It Works

1. When a user types a register number, a debounced validation function is triggered
2. The validation function queries Supabase to check if that register number already exists
3. User receives immediate feedback with appropriate error messages
4. Form submission is prevented if the register number is already in use
5. Even if client-side validation fails, the database-level constraint provides backup protection 