import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://swthqbbczokqrjnldqkv.supabase.co'
const supabaseKey = 'sb_publishable_lIRadiX0V5uwPG2lR74pKA_TXzBZUti'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
    const { data, error } = await supabase.from('appointments').select('*').limit(1)
    if (error) console.error(error)
    else console.log(data)
}

checkSchema()
