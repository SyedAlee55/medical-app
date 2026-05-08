import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://swthqbbczokqrjnldqkv.supabase.co'
const supabaseKey = 'sb_publishable_lIRadiX0V5uwPG2lR74pKA_TXzBZUti'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkProfilesSchema() {
    console.log("Checking profiles table structure...")
    const { data, error } = await supabase.from('profiles').select('*').limit(1)
    
    if (error) {
        console.error("Error fetching profile:", error.message)
    } else {
        console.log("Profile sample:", JSON.stringify(data[0] || "No rows", null, 2))
    }
}

checkProfilesSchema()
