import Navbar from '@/components/landing/Navbar'
import HeroSection from '@/components/landing/HeroSection'
import TrustStrip from '@/components/landing/TrustStrip'
import ServicesSection from '@/components/landing/ServicesSection'
import HowItWorksSection from '@/components/landing/HowItWorksSection'
import StatsSection from '@/components/landing/StatsSection'
import TestimonialsSection from '@/components/landing/TestimonialsSection'
import CtaSection from '@/components/landing/CtaSection'
import Footer from '@/components/landing/Footer'

export const metadata = {
  title: "Tj's Medical Hub \u2014 Modern Healthcare Platform",
  description: 'Book appointments with verified doctors, access your medical records, and get care \u2014 all in one HIPAA-compliant platform.',
  keywords: 'healthcare, book doctor, telemedicine, medical records, appointment booking, HIPAA',
  openGraph: {
    title: "Tj's Medical Hub \u2014 Modern Healthcare Platform",
    description: 'Book appointments with verified doctors and manage your health \u2014 all in one place.',
    url: 'https://tjsmedicalhub.com',
    siteName: "Tj's Medical Hub",
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Tj's Medical Hub \u2014 Modern Healthcare Platform",
    description: 'Book appointments with verified doctors and manage your health \u2014 all in one place.',
    images: ['/og-image.png'],
  },
  alternates: { canonical: 'https://tjsmedicalhub.com' },
  robots: { index: true, follow: true },
}

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <TrustStrip />
      <ServicesSection />
      <HowItWorksSection />
      <StatsSection />
      <TestimonialsSection />
      <CtaSection />
      <Footer />
    </main>
  )
}
