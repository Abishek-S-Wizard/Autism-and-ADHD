import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://wifujyooibxsrjvdjpvu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpZnVqeW9vaWJ4c3JqdmRqcHZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzOTAyNjgsImV4cCI6MjA4ODk2NjI2OH0.ZHPvMQmT2HXs3as20hZy2eZneTLFCJRbf7LJt2ukSqY";

const supabase = createClient(supabaseUrl, supabaseKey)

async function diagnose() {
  console.log("--- Messaging System Diagnostic ---")
  
  // 1. Check tables existence and count
  const tables = ['patients', 'doctors', 'doctor_patient_mappings', 'doctor_patient_queries']
  for (const table of tables) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true })
    if (error) {
      console.log(`[!] Error checking ${table}:`, error.message)
    } else {
      console.log(`[+] Table ${table} exists. Record count: ${count}`)
    }
  }

  // 2. Check for orphaned mappings
  console.log("\n--- Checking for Orphaned Mappings ---")
  const { data: mappings } = await supabase
    .from('doctor_patient_mappings')
    .select('patient_id, doctor_id')
  
  if (mappings) {
    for (const m of mappings) {
      const { data: p } = await supabase.from('patients').select('id').eq('id', m.patient_id).maybeSingle()
      const { data: d } = await supabase.from('doctors').select('id').eq('id', m.doctor_id).maybeSingle()
      
      if (!p) console.log(`[!] Mapped Patient ID ${m.patient_id} MISSING from patients table!`)
      if (!d) console.log(`[!] Mapped Doctor ID ${m.doctor_id} MISSING from doctors table!`)
      if (p && d) console.log(`[OK] Mapping ${m.patient_id} -> ${m.doctor_id} is healthy.`)
    }
  }

  // 3. Test insert with a known mapping
  if (mappings && mappings.length > 0) {
    console.log("\n--- Testing Insertion with Known Mapping ---")
    const testM = mappings[0]
    const { error: iError } = await supabase
      .from('doctor_patient_queries')
      .insert([
        { 
          patient_id: testM.patient_id, 
          doctor_id: testM.doctor_id, 
          sender_role: 'patient', 
          message: 'Diagnostic Test Message' 
        }
      ])
    
    if (iError) {
      console.log("[!] Insertion failed:", iError.message)
      console.log("[!] Error details:", JSON.stringify(iError, null, 2))
    } else {
      console.log("[+] Insertion successful! Foreign key is valid.")
    }
  }
}

diagnose()
