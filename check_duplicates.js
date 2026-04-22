import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://wifujyooibxsrjvdjpvu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpZnVqeW9vaWJ4c3JqdmRqcHZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzOTAyNjgsImV4cCI6MjA4ODk2NjI2OH0.ZHPvMQmT2HXs3as20hZy2eZneTLFCJRbf7LJt2ukSqY";

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDuplicates() {
  console.log("--- Checking for duplicate IDs in profile tables ---")
  
  const tables = ['patients', 'doctors', 'researchers']
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('id')
    if (error) {
      console.log(`Error checking ${table}:`, error.message)
      continue
    }
    
    const ids = data.map(d => d.id)
    const uniqueIds = new Set(ids)
    
    if (ids.length !== uniqueIds.size) {
      console.log(`[!] Duplicate IDs found in ${table}! Total: ${ids.length}, Unique: ${uniqueIds.size}`)
      
      const counts = {}
      ids.forEach(id => counts[id] = (counts[id] || 0) + 1)
      Object.keys(counts).forEach(id => {
        if (counts[id] > 1) {
          console.log(`    - ID ${id} appears ${counts[id]} times.`)
        }
      })
    } else {
      console.log(`[OK] No duplicate IDs in ${table}. Count: ${ids.length}`)
    }
  }
}

checkDuplicates()
