import LoginClient from './LoginClient'

export const metadata = {
  title: 'Sign In \u2014 Tj\'s Medical Hub',
  description: 'Sign in to your Tj\'s Medical Hub account to manage appointments, records, and more.',
  robots: { index: false },
}

export default async function LoginPage({ searchParams }) {
  const params = await searchParams
  return (
    <LoginClient
      errorMessage={params?.error || null}
      infoMessage={params?.message || null}
    />
  )
}