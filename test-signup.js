import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://swthqbbczokqrjnldqkv.supabase.co'
const supabaseKey = 'sb_publishable_lIRadiX0V5uwPG2lR74pKA_TXzBZUti'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSignup() {
    const email = 'test' + Date.now() + '@example.com'
    const password = 'Password123!'
    
    console.log("Trying to sign up", email)
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                fullName: "Test User",
                name: "Test User",
                full_name: "Test User",
                email: email,
                role: "patient"
            }
        }
    })
    
    if (error) {
        console.error("Error signing up:", error.message)
    } else {
        console.log("Success!", data.user.id)
    }
}

testSignup()
