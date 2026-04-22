import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://wifujyooibxsrjvdjpvu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpZnVqeW9vaWJ4c3JqdmRqcHZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzOTAyNjgsImV4cCI6MjA4ODk2NjI2OH0.ZHPvMQmT2HXs3as20hZy2eZneTLFCJRbf7LJt2ukSqY";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
    console.log("--- Messaging Insert Diagnostic ---");
    
    // Hardcoded IDs from previous successful diagnostic
    const doctorId = '26bb2c74-058b-4658-8b54-68265b86d1bc';
    const patientId = '90ac1be1-7f18-44cd-b843-2d166db840e9';

    console.log(`Attempting to insert dummy message for: \nDoctor: ${doctorId}\nPatient: ${patientId}`);

    const { data, error } = await supabase
        .from('doctor_patient_queries')
        .insert([{
            doctor_id: doctorId,
            patient_id: patientId,
            sender_role: 'patient',
            message: 'Diagnostic test message'
        }])
        .select();

    if (error) {
        console.error("\n❌ INSERT FAILED!");
        console.error("Error Code:", error.code);
        console.error("Error Message:", error.message);
        console.error("Error Detail:", error.detail);
    } else {
        console.log("\n✅ INSERT SUCCESSFUL!");
        console.log(data);
    }

    // Check table structure via SQL if possible? No, but we can check if the columns exist
    const { data: columns, error: cError } = await supabase
        .from('doctor_patient_queries')
        .select('*')
        .limit(1);
    
    if (columns && columns.length > 0) {
        console.log("\nExisting columns in doctor_patient_queries:", Object.keys(columns[0]));
    }
}

testInsert();
