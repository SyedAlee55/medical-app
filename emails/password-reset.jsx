import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

export const PasswordResetEmail = ({ name = 'there', resetUrl }) => {
  return (
    <Html>
      <Head />
      <Preview>Reset your Tj&apos;s Medical Hub password</Preview>
      <Body style={main}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <div style={logoWrapper}>
              <span style={logoIcon}>✚</span>
            </div>
            <Text style={brandName}>Tj&apos;s Medical Hub</Text>
          </Section>

          {/* Body */}
          <Section style={body}>
            <Heading style={h1}>Reset your password</Heading>

            <Text style={greeting}>Hello {name},</Text>

            <Text style={text}>
              We received a request to reset the password for your Tj&apos;s Medical Hub account. Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.
            </Text>

            <Section style={buttonSection}>
              <Button style={button} href={resetUrl}>
                Reset Password
              </Button>
            </Section>

            <Text style={subtext}>
              If you did not request a password reset, you can safely ignore this email. Your password will not change.
            </Text>

            <Text style={linkFallback}>
              If the button doesn&apos;t work, copy and paste this link into your browser:
            </Text>
            <Text style={linkText}>{resetUrl}</Text>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © 2025 Tj&apos;s Medical Hub — Caring for you, simplified.
            </Text>
            <Text style={footerSubtext}>
              This is an automated message. Please do not reply to this email.
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

export default PasswordResetEmail

// ── Styles ────────────────────────────────────────────────────────────────────

const main = {
  backgroundColor: '#f4f4f5',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  padding: '32px 0',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  maxWidth: '560px',
  borderRadius: '16px',
  overflow: 'hidden',
  border: '1px solid #e4e4e7',
  boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
}

const header = {
  backgroundColor: '#0f172a',
  padding: '28px 40px',
  textAlign: 'center',
}

const logoWrapper = {
  width: '44px',
  height: '44px',
  borderRadius: '50%',
  backgroundColor: 'rgba(6,148,162,0.15)',
  border: '1px solid rgba(6,148,162,0.3)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '12px',
}

const logoIcon = {
  color: '#06b6d4',
  fontSize: '22px',
  fontWeight: 'bold',
  lineHeight: 1,
}

const brandName = {
  color: '#f1f5f9',
  fontSize: '18px',
  fontWeight: '700',
  margin: '0',
  letterSpacing: '-0.3px',
}

const body = {
  padding: '40px 40px 32px',
}

const h1 = {
  color: '#09090b',
  fontSize: '22px',
  fontWeight: '800',
  lineHeight: '1.3',
  margin: '0 0 20px',
  letterSpacing: '-0.4px',
}

const greeting = {
  color: '#3f3f46',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 12px',
  fontWeight: '600',
}

const text = {
  color: '#52525b',
  fontSize: '15px',
  lineHeight: '26px',
  margin: '0 0 28px',
}

const buttonSection = {
  textAlign: 'center',
  margin: '0 0 28px',
}

const button = {
  backgroundColor: '#0694a2',
  borderRadius: '10px',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '700',
  textDecoration: 'none',
  textAlign: 'center',
  display: 'inline-block',
  padding: '14px 32px',
  letterSpacing: '0.1px',
}

const subtext = {
  color: '#71717a',
  fontSize: '13px',
  lineHeight: '22px',
  margin: '0 0 16px',
}

const linkFallback = {
  color: '#71717a',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '0 0 6px',
}

const linkText = {
  color: '#0694a2',
  fontSize: '11px',
  lineHeight: '18px',
  wordBreak: 'break-all',
  margin: '0',
}

const hr = {
  borderColor: '#f4f4f5',
  margin: '0',
}

const footer = {
  padding: '24px 40px',
  textAlign: 'center',
}

const footerText = {
  color: '#a1a1aa',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '0 0 4px',
}

const footerSubtext = {
  color: '#d4d4d8',
  fontSize: '11px',
  lineHeight: '18px',
  margin: '0',
}
