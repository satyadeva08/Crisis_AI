
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://gcjawzcwmxaayedcmfin.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_xegx2pNa1MtuYwOHJBKGtg_UtVowL2R';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupAdmin() {
  console.log('Setting up admin account...');
  
  const email = 'admin@disaster-response.gov';
  const password = 'admin123';
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: 'Command Administrator',
        role: 'authority',
        department: 'HQ'
      }
    }
  });

  if (error) {
    if (error.status === 422 || error.message.includes('already registered')) {
      console.log('Admin account already exists! You can log in directly.');
    } else {
      console.error('Error creating admin account:', error.message);
    }
  } else {
    console.log('Successfully created admin account!');
  }
}

setupAdmin();
