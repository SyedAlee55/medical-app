'use client'

import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import { ShieldCheck, Award, Heart, Users, Quote, Sparkles, MapPin, Building, Bed, Stethoscope, Cpu } from 'lucide-react'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col justify-between overflow-hidden">
      <div>
        {/* Navbar */}
        <Navbar />

        {/* Hero Section */}
        <section className="relative min-h-[50vh] w-full flex items-center justify-center overflow-hidden bg-zinc-950 border-b border-white/5">
          {/* Background medical image + gradient overlay */}
          <div
            className="absolute inset-0 z-0 bg-cover bg-center opacity-45 scale-105"
            style={{ backgroundImage: `url("https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop")` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/95 via-zinc-950/85 to-zinc-950" />
          </div>

          {/* Ambient glow orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl pointer-events-none -z-10" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full relative z-10 py-20 text-center animate-fade-up">
            {/* Live-dot badge */}
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
              </span>
              <span className="text-[10px] font-bold tracking-widest text-brand-300 uppercase">
                OUR MISSION & STORY
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight mb-6">
              Combining genuine care <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-teal-300 to-emerald-400">
                with a modern approach
              </span>
            </h1>
            
            <p className="text-zinc-400 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
              We believe healthcare should be seamless, deeply personal, and powered by state-of-the-art technology. Learn more about the principles and medical professionals that guide us every single day.
            </p>
          </div>
        </section>

        {/* Section 1: CEO Note */}
        <section className="relative py-24 bg-zinc-950/40 border-b border-white/5">
          {/* Ambient glow orb */}
          <div className="absolute top-1/2 left-1/3 w-80 h-80 rounded-full bg-brand-500/5 blur-3xl pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              {/* CEO Picture side (Left) */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-sm aspect-[3/5] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-zinc-900/40 backdrop-blur-2xl group flex items-center justify-center">
                  {/* Aspect ratio frame for image_ceo.jpg */}
                  <img
                    src="/ceo.jpg"
                    alt="CEO Portrait"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Subtle caption banner */}
                  <div className="absolute bottom-4 left-4 right-4 bg-zinc-950/80 backdrop-blur-md px-4 py-3.5 rounded-xl border border-white/10 shadow-lg">
                    <h4 className="font-bold text-white text-sm">Tajammal Gauhar</h4>
                    <p className="text-xs text-brand-300 font-semibold tracking-wider uppercase mt-0.5">Medical Director</p>
                  </div>
                </div>
              </div>

              {/* CEO Note (Right) */}
              <div className="lg:col-span-7 flex flex-col justify-center">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-brand-300">
                  </div>
                </div>
                
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-6 leading-tight">
                  A Message From Our, <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-teal-300 to-emerald-400">
                    Medical Director
                  </span>
                </h2>
                
                <div className="space-y-4 text-zinc-400 text-sm sm:text-base leading-relaxed">
                  <p>
                    At Tj&apos;s Medical Hub, we deliver safe, reliable and compassionate care, focused on accurate diagnosis, modern treatment and making every patient feel respected and valued.
                  </p>
                  <p className="font-medium text-zinc-200 italic border-l-2 border-brand-400/40 pl-4 py-1">
                    &ldquo;We don&apos;t just treat symptoms. We care for patients as people, with the respect and urgency they deserve.&rdquo;
                  </p>
                </div>

                <div className="mt-8 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-400/25 flex items-center justify-center font-bold text-brand-300 text-sm shadow-[0_0_10px_rgba(6,148,162,0.1)]">
                    TJ
                  </div>
                  <div>
                    <h5 className="font-semibold text-white text-sm">Tajammal Gauhar</h5>
                    <p className="text-xs text-zinc-500 font-medium">Medical Director, Tj&apos;s Medical Hub</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Section 2: Values (3 Cards) */}
        <section className="relative py-24 bg-black border-b border-white/5">
          {/* Ambient glow orbs */}
          <div className="absolute top-1/4 right-1/4 w-80 h-80 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            
            <div className="text-center mb-16">
              <span className="inline-block text-[11px] font-semibold tracking-widest uppercase text-zinc-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full mb-3">
                OUR VALUES
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400 mt-2">
                The pillars of our clinical excellence
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Card 1: Trusted */}
              <div className="bg-zinc-950/40 backdrop-blur-2xl rounded-2xl border border-white/6 p-8 hover:bg-black hover:border-brand-500/20 hover:shadow-[0_10px_40px_rgba(6,148,162,0.04)] transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center mb-6 group-hover:bg-brand-500/10 group-hover:border-brand-400/20 transition-colors">
                  <ShieldCheck className="text-zinc-300 w-6 h-6 group-hover:text-brand-300 transition-colors" />
                </div>
                <h3 className="font-semibold text-white text-base mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-brand-300 group-hover:to-teal-300 transition-all duration-300">
                  Trusted
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  We maintain the highest clinical standards and verify every practitioner. Your security, privacy, and health are safeguarded through stringent HIPAA compliance.
                </p>
              </div>

              {/* Card 2: Respected */}
              <div className="bg-zinc-950/40 backdrop-blur-2xl rounded-2xl border border-white/6 p-8 hover:bg-black hover:border-brand-500/20 hover:shadow-[0_10px_40px_rgba(6,148,162,0.04)] transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center mb-6 group-hover:bg-brand-500/10 group-hover:border-brand-400/20 transition-colors">
                  <Award className="text-zinc-300 w-6 h-6 group-hover:text-brand-300 transition-colors" />
                </div>
                <h3 className="font-semibold text-white text-base mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-brand-300 group-hover:to-teal-300 transition-all duration-300">
                  Respected
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Highly regarded by peers and patients alike, our hub represents the pinnacle of medical expertise, professional ethics, and patient satisfaction nationwide.
                </p>
              </div>

              {/* Card 3: Compassionate */}
              <div className="bg-zinc-950/40 backdrop-blur-2xl rounded-2xl border border-white/6 p-8 hover:bg-black hover:border-brand-500/20 hover:shadow-[0_10px_40px_rgba(6,148,162,0.04)] transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center mb-6 group-hover:bg-brand-500/10 group-hover:border-brand-400/20 transition-colors">
                  <Heart className="text-zinc-300 w-6 h-6 group-hover:text-brand-300 transition-colors" />
                </div>
                <h3 className="font-semibold text-white text-base mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-brand-300 group-hover:to-teal-300 transition-all duration-300">
                  Compassionate
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Care goes beyond prescription pads. We listen actively, communicate with empathy, and design personalized treatment plans that honor your unique life story.
                </p>
              </div>

            </div>

            {/* Note under the 3 cards */}
            <div className="mt-14 text-center max-w-2xl mx-auto">
              <p className="text-xs sm:text-sm text-zinc-500 italic leading-relaxed bg-zinc-950/80 border border-white/5 px-6 py-4 rounded-2xl">
                Our operations and patient interactions are rooted in these three pillars. By aligning cutting-edge telemedicine tools with these values, we consistently deliver care that is not only highly effective but also comforting.
              </p>
            </div>

          </div>
        </section>

        {/* Facilities & Infrastructure Section */}
        <section className="relative py-24 bg-zinc-950/20 border-b border-white/5">
          {/* Decorative ambient background glows */}
          <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-brand-500/5 blur-3xl pointer-events-none -z-10" />
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-20">
              <span className="inline-block text-[11px] font-semibold tracking-widest uppercase text-zinc-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full mb-3">
                OUR INFRASTRUCTURE & FACILITIES
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400 mt-2">
                Modern clinical setup designed for healing
              </h2>
              <p className="text-zinc-400 max-w-xl mx-auto text-sm leading-relaxed mt-4">
                Explore our clinic's advanced space, comfort standards, and state-of-the-art diagnostic technologies.
              </p>
            </div>

            <div className="space-y-24">
              {/* 1. Hospital Location (Front View) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                {/* Image Side */}
                <div className="lg:col-span-6 flex justify-center">
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-zinc-900/40 backdrop-blur-2xl group transition-all duration-500 hover:border-brand-400/40 hover:shadow-[0_0_30px_rgba(6,148,162,0.15)]">
                    <img
                      src="/Clinic%20Front%20view.png"
                      alt="Clinic Front View"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>
                {/* Text Side */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold">
                    <MapPin className="w-3.5 h-3.5" />
                    Prime Location & Exterior
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Easily Accessible Clinic Facade
                  </h3>
                  <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                    Our facility is located in a prime, highly accessible area, welcoming patients with a modern architectural facade. Designed with convenience and patient comfort in mind, our exterior features clear directional signage, dedicated emergency drop-off bays, and wheelchair-accessible entryways. The clean, professional aesthetic of our front entrance reflects the elite standards of healthcare you will find inside.
                  </p>
                </div>
              </div>

              {/* 2. Clinic Inside View */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                {/* Image Side - Order 2 on large screens, meaning it goes to the right */}
                <div className="lg:col-span-6 lg:order-2 flex justify-center">
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-zinc-900/40 backdrop-blur-2xl group transition-all duration-500 hover:border-brand-400/40 hover:shadow-[0_0_30px_rgba(6,148,162,0.15)]">
                    <img
                      src="/Clinic%20inside%20hall%20room%20ariel%20view.jpeg"
                      alt="Clinic Interior Hallway"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>
                {/* Text Side - Order 1 on large screens, meaning it goes to the left */}
                <div className="lg:col-span-6 lg:order-1 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold">
                    <Building className="w-3.5 h-3.5" />
                    Elite Interior Spaces
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Welcoming & Sanitized Interiors
                  </h3>
                  <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                    Step into a spacious, well-lit reception and lounge area designed to minimize stress and clinical anxiety. Our corridors and waiting zones are engineered for high airflow, continuous sterilization, and peaceful vibes. With ambient acoustic treatment and modern seating, we guarantee a soothing experience for both patients and their accompanying loved ones.
                  </p>
                </div>
              </div>

              {/* 3. Beds */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                {/* Image Side */}
                <div className="lg:col-span-6 flex justify-center">
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-zinc-900/40 backdrop-blur-2xl group transition-all duration-500 hover:border-brand-400/40 hover:shadow-[0_0_30px_rgba(6,148,162,0.15)]">
                    <img
                      src="/beds.jpeg"
                      alt="Clinic recovery beds"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>
                {/* Text Side */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
                    <Bed className="w-3.5 h-3.5" />
                    Premium Recovery Wards
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    State-of-the-Art Beds & Ward Setup
                  </h3>
                  <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                    We offer fully motorized, multi-functional ICU and recovery beds that guarantee patient comfort and safety. Each patient zone is integrated with central oxygen lines, advanced cardiac monitors, and prompt nurse call systems. Our clean, sanitized environments ensure an infection-free recovery period, managed by our vigilant nursing staff round the clock.
                  </p>
                </div>
              </div>

              {/* 4. Patient Being Treated */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                {/* Image Side - Order 2 on large screens, meaning it goes to the right */}
                <div className="lg:col-span-6 lg:order-2 flex justify-center">
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-zinc-900/40 backdrop-blur-2xl group transition-all duration-500 hover:border-brand-400/40 hover:shadow-[0_0_30px_rgba(6,148,162,0.15)]">
                    <img
                      src="/Patient%20without%20blood%20+%20Logo.png"
                      alt="Patient receiving treatment"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>
                {/* Text Side - Order 1 on large screens, meaning it goes to the left */}
                <div className="lg:col-span-6 lg:order-1 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold">
                    <Stethoscope className="w-3.5 h-3.5" />
                    Personalized Clinical Care
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Compassionate & Safe Treatments
                  </h3>
                  <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                    Our doctors, specialists, and nurses treat every patient with maximum dedication and care. We practice evidence-based medicine, ensuring high success rates and minimized pain. From checkups to complex outpatient procedures, we put patient comfort first, ensuring you understand every step of your diagnosis and recovery plan.
                  </p>
                </div>
              </div>

              {/* 5. Technology (Gadgets & Equipment) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                {/* Image Side */}
                <div className="lg:col-span-6 flex justify-center">
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-zinc-900/40 backdrop-blur-2xl group transition-all duration-500 hover:border-brand-400/40 hover:shadow-[0_0_30px_rgba(6,148,162,0.15)]">
                    <img
                      src="/Ultrasound%20Gadget.jpeg"
                      alt="Diagnostic Ultrasound Technology"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>
                {/* Text Side */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold">
                    <Cpu className="w-3.5 h-3.5" />
                    Advanced Diagnostic Tech
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Cutting-Edge Gadgets & Imaging
                  </h3>
                  <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                    We employ high-resolution ultrasound scanners, modern ECG machines, and advanced lab diagnostic tools to ensure rapid, precise medical results. By investing in top-tier medical gadgets, we reduce testing times and eliminate diagnostic errors, enabling our specialists to start the correct treatment path without delay.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Section 3: Meet Our Team */}
        <section className="relative py-24 bg-zinc-950">
          {/* Ambient glow orbs */}
          <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-brand-500/5 blur-3xl pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            
            <div className="text-center mb-16">
              <span className="inline-block text-[11px] font-semibold tracking-widest uppercase text-zinc-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full mb-3">
                TEAM EXPERTS
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400 mt-2 mb-4">
                Dedicated professionals centered on your well-being
              </h2>
              <p className="text-zinc-400 max-w-xl mx-auto text-sm leading-relaxed">
                Our board-certified clinical specialists bring years of experience and specialized knowledge to manage your healthcare journey safely and comprehensively.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              
              {/* Doctor 1 */}
              <div className="bg-zinc-950/40 backdrop-blur-2xl rounded-2xl border border-white/6 p-8 flex flex-col items-center text-center hover:bg-black hover:border-brand-500/20 hover:shadow-[0_10px_40px_rgba(6,148,162,0.04)] transition-all duration-300 group">
                <div className="relative w-40 h-45 rounded-[20%] overflow-hidden mb-6 shadow-xl border-2 border-white/10 bg-zinc-900 group-hover:border-brand-400/40 transition-all duration-300 flex items-center justify-center">
                  <img
                    src="/doctor1.jpg"
                    alt="Dr. Aisha Rehman"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <h3 className="font-bold text-white text-lg mb-1 group-hover:text-brand-300 transition-colors">
                  Dr. Aisha Rehman
                </h3>
                <span className="text-[10px] font-bold tracking-widest text-brand-300 bg-brand-500/10 border border-brand-400/20 px-2.5 py-0.5 rounded-full mb-5 uppercase">
                  Lead Primary Care Physician
                </span>
                <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
                  Dr. Aisha Rehman specializes in preventative medicine and family health. She is committed to forming long-term, supportive partnerships to help patients prevent diseases and adopt healthy lifestyles.
                </p>
              </div>

              {/* Doctor 2 */}
              <div className="bg-zinc-950/40 backdrop-blur-2xl rounded-2xl border border-white/6 p-8 flex flex-col items-center text-center hover:bg-black hover:border-brand-500/20 hover:shadow-[0_10px_40px_rgba(6,148,162,0.04)] transition-all duration-300 group">
                <div className="relative w-40 h-45 rounded-[20%] overflow-hidden mb-6 shadow-xl border-2 border-white/10 bg-zinc-900 group-hover:border-brand-400/40 transition-all duration-300 flex items-center justify-center">
                  <img
                    src="/doctor2.jpg"
                    alt="Dr. Marcus Chen"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <h3 className="font-bold text-white text-lg mb-1 group-hover:text-brand-300 transition-colors">
                  Dr. Marcus Chen
                </h3>
                <span className="text-[10px] font-bold tracking-widest text-brand-300 bg-brand-500/10 border border-brand-400/20 px-2.5 py-0.5 rounded-full mb-5 uppercase">
                  Consultant Cardiologist
                </span>
                <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
                  Dr. Marcus Chen focuses on advanced cardiovascular health and stroke prevention. Combining patient-centric therapeutic options with telehealth, he guides clients toward optimal heart wellness.
                </p>
              </div>

            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  )
}
