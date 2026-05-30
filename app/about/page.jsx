'use client'

import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import { ShieldCheck, Award, Heart, Users, Quote } from 'lucide-react'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f8faff] flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-white border-b border-zinc-100 py-16 md:py-24">
          {/* Blurred teal background accents */}
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-brand-100/60 blur-3xl -z-10" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-brand-100/40 blur-3xl -z-10" />

          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center animate-fade-up">
            <span className="type-label text-brand-600 mb-4 tracking-wider block">
              OUR MISSION & STORY
            </span>
            <h1 className="type-hero mb-6 text-zinc-900 leading-tight">
              Combining genuine care <br />
              <span className="text-brand-600">with a modern approach</span>
            </h1>
            <p className="type-body text-zinc-500 max-w-2xl mx-auto text-base md:text-lg">
              We believe healthcare should be seamless, deeply personal, and powered by state-of-the-art technology. Learn more about the principles and medical professionals that guide us every single day.
            </p>
          </div>
        </section>

        {/* Section 1: CEO Note */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              {/* CEO Picture side (Left) */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-sm aspect-[4/5] rounded-2xl overflow-hidden shadow-xl border border-zinc-100 bg-zinc-50 group">
                  {/* Aspect ratio frame for image_ceo.jpg */}
                  <img
                    src="/image_ceo.jpg"
                    alt="CEO Portrait"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      // Fallback overlay when the image hasn't been uploaded yet
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="hidden absolute inset-0 flex-col items-center justify-center p-6 text-center bg-zinc-100 border border-dashed border-zinc-300 rounded-2xl">
                    <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 mb-4">
                      <Users className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-semibold text-zinc-800">CEO Portrait Placeholder</p>
                    <p className="text-xs text-zinc-400 mt-1 max-w-[200px]">
                      Add <code className="bg-zinc-200 px-1 py-0.5 rounded text-[10px]">image_ceo.jpg</code> to public/ folder to display image.
                    </p>
                  </div>
                  
                  {/* Subtle caption banner */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md px-4 py-3 rounded-xl border border-zinc-200/50 shadow-sm">
                    <h4 className="font-bold text-zinc-900 text-sm">Thomas Jenkins</h4>
                    <p className="text-xs text-brand-600 font-semibold">Founder & Chief Executive Officer</p>
                  </div>
                </div>
              </div>

              {/* CEO Note (Right) */}
              <div className="lg:col-span-7 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-4">
                  <Quote className="w-8 h-8 text-brand-500/30" />
                  <span className="type-label text-brand-600">A Message from our CEO</span>
                </div>
                
                <h2 className="type-h2 text-zinc-950 mb-6 leading-tight">
                  Healthcare reimagined, centered entirely around you.
                </h2>
                
                <div className="space-y-4 text-zinc-600 text-base leading-relaxed">
                  <p>
                    At Tj&apos;s Medical Hub, our mission is simple yet profound: to combine premium, compassionate clinical care with modern technology to make healthcare simple, accessible, and high-quality for everyone.
                  </p>
                  <p>
                    We realized that navigating the healthcare system was too often confusing, disjointed, and stressful. That is why we built a unified digital home. By connecting top-tier verified clinical talent directly with modern tools, we give you control over your appointments, medical histories, and virtual consultations.
                  </p>
                  <p className="font-medium text-zinc-800 italic">
                    &ldquo;We don&apos;t just treat symptoms. We care for patients as people, with the respect and urgency they deserve.&rdquo;
                  </p>
                </div>

                <div className="mt-8 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center font-bold text-brand-700 text-sm">
                    TJ
                  </div>
                  <div>
                    <h5 className="font-semibold text-zinc-900 text-sm">Thomas Jenkins</h5>
                    <p className="text-xs text-zinc-500">CEO, Tj&apos;s Medical Hub</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Section 2: Values (3 Cards) */}
        <section className="py-20 bg-zinc-50 border-y border-zinc-100">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="type-label text-brand-600 mb-3 tracking-wider block">
                OUR CORE VALUES
              </span>
              <h2 className="type-h2 text-zinc-900">
                The pillars of our clinical excellence
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Card 1: Trusted */}
              <div className="bg-white rounded-2xl border border-zinc-100 p-8 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 mb-6">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="type-h3 text-zinc-900 mb-3">Trusted</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  We maintain the highest clinical standards and verify every practitioner. Your security, privacy, and health are safeguarded through stringent HIPAA compliance.
                </p>
              </div>

              {/* Card 2: Respected */}
              <div className="bg-white rounded-2xl border border-zinc-100 p-8 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 mb-6">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="type-h3 text-zinc-900 mb-3">Respected</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  Highly regarded by peers and patients alike, our hub represents the pinnacle of medical expertise, professional ethics, and patient satisfaction nationwide.
                </p>
              </div>

              {/* Card 3: Compassionate */}
              <div className="bg-white rounded-2xl border border-zinc-100 p-8 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 mb-6">
                  <Heart className="w-6 h-6" />
                </div>
                <h3 className="type-h3 text-zinc-900 mb-3">Compassionate</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  Care goes beyond prescription pads. We listen actively, communicate with empathy, and design personalized treatment plans that honor your unique life story.
                </p>
              </div>

            </div>

            {/* Note under the 3 cards */}
            <div className="mt-12 text-center max-w-2xl mx-auto">
              <p className="text-sm md:text-base text-zinc-500 italic leading-relaxed">
                Our operations and patient interactions are rooted in these three pillars. By aligning cutting-edge telemedicine tools with these values, we consistently deliver care that is not only highly effective but also comforting.
              </p>
            </div>

          </div>
        </section>

        {/* Section 3: Meet Our Team */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="type-label text-brand-600 mb-3 tracking-wider block">
                MEET OUR MEDICAL EXPERTS
              </span>
              <h2 className="type-h2 text-zinc-900 mb-4">
                Dedicated professionals centered on your well-being
              </h2>
              <p className="type-body text-zinc-500 max-w-xl mx-auto text-sm md:text-base">
                Our board-certified clinical specialists bring years of experience and specialized knowledge to manage your healthcare journey safely and comprehensively.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
              
              {/* Doctor 1 */}
              <div className="bg-[#f8faff] rounded-2xl border border-zinc-100 p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all duration-300">
                <div className="relative w-40 h-40 rounded-full overflow-hidden mb-6 shadow-md border-2 border-white bg-zinc-100 group">
                  <img
                    src="/image_doctor.jpg"
                    alt="Dr. Aisha Rehman"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="hidden absolute inset-0 flex-col items-center justify-center p-3 text-center bg-zinc-200">
                    <p className="text-xs font-bold text-zinc-700">Dr. Aisha Rehman</p>
                    <p className="text-[9px] text-zinc-500 mt-1">
                      Add <code className="bg-zinc-300 px-0.5 rounded font-mono">image_doctor.jpg</code>
                    </p>
                  </div>
                </div>

                <h3 className="type-h3 text-zinc-950 mb-1">Dr. Aisha Rehman</h3>
                <p className="text-xs text-brand-600 font-bold uppercase tracking-wider mb-4">
                  Lead Primary Care Physician
                </p>
                <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">
                  Dr. Aisha Rehman specializes in preventative medicine and family health. She is committed to forming long-term, supportive partnerships to help patients prevent diseases and adopt healthy lifestyles.
                </p>
              </div>

              {/* Doctor 2 */}
              <div className="bg-[#f8faff] rounded-2xl border border-zinc-100 p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all duration-300">
                <div className="relative w-40 h-40 rounded-full overflow-hidden mb-6 shadow-md border-2 border-white bg-zinc-100 group">
                  <img
                    src="/image_doctor2.jpg"
                    alt="Dr. Marcus Chen"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="hidden absolute inset-0 flex-col items-center justify-center p-3 text-center bg-zinc-200">
                    <p className="text-xs font-bold text-zinc-700">Dr. Marcus Chen</p>
                    <p className="text-[9px] text-zinc-500 mt-1">
                      Add <code className="bg-zinc-300 px-0.5 rounded font-mono">image_doctor2.jpg</code>
                    </p>
                  </div>
                </div>

                <h3 className="type-h3 text-zinc-950 mb-1">Dr. Marcus Chen</h3>
                <p className="text-xs text-brand-600 font-bold uppercase tracking-wider mb-4">
                  Consultant Cardiologist
                </p>
                <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">
                  Dr. Marcus Chen focuses on advanced cardiovascular health and stroke prevention. Combining patient-centric therapeutic options with telehealth, he guides clients toward optimal heart wellness.
                </p>
              </div>

            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  )
}
