import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://wifujyooibxsrjvdjpvu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpZnVqeW9vaWJ4c3JqdmRqcHZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzOTAyNjgsImV4cCI6MjA4ODk2NjI2OH0.ZHPvMQmT2HXs3as20hZy2eZneTLFCJRbf7LJt2ukSqY";

const supabase = createClient(supabaseUrl, supabaseKey)

async function diagnose() {
  console.log("--- Detailed Mapping & Profile Diagnostic ---")
  
  // 1. Fetch all patients with their emails
  console.log("\n[ Patients Table ]")
  const { data: patients, error: pError } = await supabase.from('patients').select('id, email, full_name')
  if (patients) {
    patients.forEach(p => console.log(`Patient: ${p.full_name} (${p.email}) - ID: ${p.id}`))
  } else {
    console.log("No patients found or error:", pError?.message)
  }

  // 2. Fetch all doctors with their emails
  console.log("\n[ Doctors Table ]")
  const { data: doctors, error: dError } = await supabase.from('doctors').select('id, email, full_name')
  if (doctors) {
    doctors.forEach(d => console.log(`Doctor: ${d.full_name} (${d.email}) - ID: ${d.id}`))
  } else {
    console.log("No doctors found or error:", dError?.message)
  }

  // 3. Fetch all mappings
  console.log("\n[ Mappings Table ]")
  const { data: mappings } = await supabase.from('doctor_patient_mappings').select('*')
  if (mappings) {
    mappings.forEach(m => console.log(`Mapping: PT ${m.patient_id} -> DOC ${m.doctor_id}`))
  } else {
    console.log("No mappings found.")
  }

  // 4. Fetch the most recent queries to see if they were successful
  console.log("\n[ Recent Queries (Messages) ]")
  const { data: queries } = await supabase.from('doctor_patient_queries').select('*').order('created_at', { ascending: false }).limit(3)
  if (queries) {
    queries.forEach(q => console.log(`[${q.created_at}] From ${q.sender_role}: ${q.message.substring(0, 20)}...`))
  }
}

diagnose()
