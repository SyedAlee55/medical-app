import LoginClient from './LoginClient'

export default async function LoginPage({ searchParams }) {
  const params = await searchParams
  return (
    <LoginClient
      errorMessage={params?.error || null}
      infoMessage={params?.message || null}
    />
  )
}