import { Resend } from 'resend'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const resend = new Resend(process.env.RESEND_API_KEY)

const recipient = 'tjmedicalhub1@gmail.com'

console.log(`Sending test email from ${process.env.RESEND_FROM || 'onboarding@resend.dev'} to ${recipient}...`)

const { data, error } = await resend.emails.send({
  from: process.env.RESEND_FROM || 'onboarding@resend.dev',
  to: recipient,
  subject: 'Resend Test',
  html: '<p>If you see this, Resend is working.</p>',
})

console.log('Result:', JSON.stringify({ data, error }, null, 2))
