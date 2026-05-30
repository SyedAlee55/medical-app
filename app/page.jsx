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
  title: "Tj's Medical Hub — Modern Healthcare Platform",
  description: 'Book appointments with verified doctors, access your medical records, and get care — all in one HIPAA-compliant platform.',
  keywords: 'healthcare, book doctor, telemedicine, medical records, appointment booking, HIPAA',
  openGraph: {
    title: "Tj's Medical Hub — Modern Healthcare Platform",
    description: 'Book appointments with verified doctors and manage your health — all in one place.',
    url: 'https://tjsmedicalhub.com',
    siteName: "Tj's Medical Hub",
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Tj's Medical Hub — Modern Healthcare Platform",
    description: 'Book appointments with verified doctors and manage your health — all in one place.',
    images: ['/og-image.png'],
  },
  alternates: { canonical: 'https://tjsmedicalhub.com' },
  robots: { index: true, follow: true },
}

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar theme="dark" />

      <div className="px-4 lg:px-6 pb-6">
        <div className="rounded-3xl overflow-hidden">
          <HeroSection />
        </div>
      </div>

      <div className="px-4 lg:px-6 pb-6">
        <div className="rounded-3xl overflow-hidden border border-white/5">
          <TrustStrip />
        </div>
      </div>

      <div className="px-4 lg:px-6 pb-6">
        <div className="rounded-3xl overflow-hidden border border-white/5">
          <ServicesSection />
        </div>
      </div>

      <div className="px-4 lg:px-6 pb-6">
        <div className="rounded-3xl overflow-hidden border border-white/5">
          <HowItWorksSection />
        </div>
      </div>

      {/* Stats — full-bleed, no rounded corners */}
      <StatsSection />

      <div className="px-4 lg:px-6 py-6">
        <div className="rounded-3xl overflow-hidden border border-white/5">
          <TestimonialsSection />
        </div>
      </div>

      <div className="px-4 lg:px-6 pb-6">
        <div className="rounded-3xl overflow-hidden border border-white/5">
          <CtaSection />
        </div>
      </div>

      <Footer />
    </main>
  )
}
