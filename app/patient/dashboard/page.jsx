import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import PatientAppointmentList from "@/components/patient-appointment-list";
import { Calendar, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'
import RealTimeClock from "@/components/real-time-clock";
import AppointmentStatusCard from "@/components/appointment-status-card";

function SuccessBanner({ message }) {
  return (
    <div className="mb-6 p-4 text-sm font-medium text-emerald-300 bg-emerald-500/5 backdrop-blur-xl border border-emerald-500/15 rounded-xl flex items-center gap-2.5 animate-fade-in shadow-[0_4px_20px_rgba(16,185,129,0.02)]">
      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function InfoBanner({ message }) {
  return (
    <div className="mb-6 p-4 text-sm font-medium text-zinc-350 bg-white/5 backdrop-blur-xl border border-white/8 rounded-xl flex items-center gap-2.5 animate-fade-in">
      <CheckCircle2 className="w-5 h-5 text-zinc-500 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function ErrorBanner({ message }) {
  return (
    <div className="mb-6 p-4 text-sm font-medium text-red-400 bg-red-500/5 backdrop-blur-xl border border-red-500/15 rounded-xl flex items-center gap-2.5 animate-fade-in shadow-[0_4px_20px_rgba(239,68,68,0.02)]">
      <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export default async function PatientDashboard({ searchParams }) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // 1. Fetch Profile for Onboarding Check
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, date_of_birth')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  if (!profile.date_of_birth) {
    redirect('/patient/onboarding');
  }

  // 2. Fetch Appointments for this Patient
  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
        id, status, scheduled_at, reason_for_visit, notes,
        rejection_reason, cancellation_reason, duration_minutes,
        confirmed_at, created_at,
        profiles!appointments_doctor_id_fkey(full_name),
        specialties(name)
    `)
    .eq('patient_id', user.id)
    .is('deleted_at', null)
    .order('scheduled_at', { ascending: false });

  const params = await searchParams
  const isWelcome = params?.welcome === 'true'

  const banners = {
    booked: { msg: 'Your appointment request has been sent. The doctor will respond shortly.', color: 'emerald' },
    cancelled: { msg: 'Your appointment has been cancelled.', color: 'slate' },
  }
  const errorBanners = {
    cannot_cancel: 'This appointment cannot be cancelled.',
    too_late_to_cancel: 'Appointments cannot be cancelled within 2 hours of the scheduled time.',
  }

  // Calculate metrics
  const activeCount = appointments?.filter(a => ['pending', 'confirmed'].includes(a.status)).length || 0;
  const completedCount = appointments?.filter(a => a.status === 'completed').length || 0;

  return (
    <div className="p-8 bg-black min-h-screen">
      <div className="max-w-5xl mx-auto">
        {isWelcome && <SuccessBanner message="Your profile has been saved. Welcome to Tj's Medical Hub." />}
        {params?.booked && <SuccessBanner message={banners.booked.msg} />}
        {params?.cancelled && <InfoBanner message={banners.cancelled.msg} />}
        {params?.error && <ErrorBanner message={errorBanners[params.error] || 'An error occurred'} />}

        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Patient Dashboard</h1>
            <p className="text-sm text-zinc-400 mt-1">
              Welcome back, <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-emerald-400">{profile.full_name}</span>
            </p>
          </div>
          <RealTimeClock />
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white/6 backdrop-blur-2xl rounded-2xl border border-white/12 p-6 flex items-center justify-between hover:border-brand-500/20 hover:shadow-[0_10px_40px_rgba(6,148,162,0.04)] transition-all duration-300 group">
            <div>
              <p className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">Active Consultations</p>
              <h3 className="text-3xl font-extrabold text-white mt-2 tracking-tight">{activeCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/8 border border-white/15 flex items-center justify-center text-zinc-350 group-hover:bg-brand-500/10 group-hover:text-brand-300 transition-all">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white/6 backdrop-blur-2xl rounded-2xl border border-white/12 p-6 flex items-center justify-between hover:border-emerald-500/20 hover:shadow-[0_10px_40px_rgba(16,185,129,0.04)] transition-all duration-300 group">
            <div>
              <p className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">Completed Visits</p>
              <h3 className="text-3xl font-extrabold text-white mt-2 tracking-tight">{completedCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/8 border border-white/15 flex items-center justify-center text-zinc-350 group-hover:bg-emerald-500/10 group-hover:text-emerald-300 transition-all">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <AppointmentStatusCard appointments={appointments || []} />
        </div>

        {/* Appointments List */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white tracking-tight">Your Consultations</h2>
          <PatientAppointmentList
            initialAppointments={appointments || []}
            userId={user.id}
          />
        </div>
      </div>
    </div>
  );
}