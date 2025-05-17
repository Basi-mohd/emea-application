// This script creates an admin user in Supabase Auth
// Run with: node create-admin.js

const { createClient } = require('@supabase/supabase-js');

// Replace with your Supabase URL and service role key (from the API section in Supabase dashboard)
const supabaseUrl = 'https://eqsqdtgpxabjemwfosmn.supabase.co';
const supabaseKey = 'YOUR_SUPABASE_SERVICE_ROLE_KEY'; // Use the service role key, not the anon key

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdminUser() {
  const adminEmail = 'admin@emeahss.edu';
  const adminPassword = 'admin123';

  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { role: 'admin' }
    });

    if (error) {
      console.error('Error creating admin user:', error.message);
    } else {
      console.log('Admin user created successfully:', data.user.id);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

createAdminUser(); 