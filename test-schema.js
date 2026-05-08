import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://swthqbbczokqrjnldqkv.supabase.co'
const supabaseKey = 'sb_publishable_lIRadiX0V5uwPG2lR74pKA_TXzBZUti'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
    console.log("Fetching profiles to guess schema...")
    const { data, error } = await supabase.from('profiles').select('*').limit(1)
    
    if (error) {
        console.error("Error fetching profiles:", error.message, error.details, error.hint)
    } else {
        console.log("Profiles data:", JSON.stringify(data, null, 2))
    }
}

checkSchema()
