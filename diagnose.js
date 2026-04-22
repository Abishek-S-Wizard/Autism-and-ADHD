import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://wifujyooibxsrjvdjpvu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpZnVqeW9vaWJ4c3JqdmRqcHZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzOTAyNjgsImV4cCI6MjA4ODk2NjI2OH0.ZHPvMQmT2HXs3as20hZy2eZneTLFCJRbf7LJt2ukSqY";

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
    console.log("--- Supabase Diagnostics ---");
    
    const { data: doctors, error: dError } = await supabase.from('doctors').select('id, full_name, email');
    console.log("\n1. Doctors in DB:", doctors?.length || 0);
    console.log(doctors);

    const { data: patients, error: pError } = await supabase.from('patients').select('id, full_name, email');
    console.log("\n2. Patients in DB:", patients?.length || 0);
    console.log(patients);

    const { data: qJoin, error: qError } = await supabase
        .from('doctor_patient_mappings')
        .select('*, patients(*)')
        .eq('doctor_id', '26bb2c74-058b-4658-8b54-68265b86d1bc');
    console.log("\n4. Test Join (Doctor Tony Stark -> Patient):", qJoin?.length || 0);
    console.log(JSON.stringify(qJoin, null, 2));

    const { data: pJoin, error: pErrorJoin } = await supabase
        .from('doctor_patient_mappings')
        .select('*, doctors(*)')
        .eq('patient_id', '90ac1be1-7f18-44cd-b843-2d166db840e9');
    console.log("\n5. Test Join (Patient Abishek S -> Doctor):", pJoin?.length || 0);
    console.log(JSON.stringify(pJoin, null, 2));
    if (aError) {
        console.log("\n4. Auth Users: (Admin key required to list all, using basic check instead)");
        const { data: currentUser } = await supabase.auth.getUser();
        console.log("Current session user:", currentUser.user?.id);
    } else {
        console.log("\n4. Auth Users:", authUsers.users.length);
        console.log(authUsers.users.map(u => ({ id: u.id, email: u.email })));
    }
}

diagnose();
