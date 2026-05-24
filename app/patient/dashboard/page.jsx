import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import PatientAppointmentList from "@/components/patient-appointment-list";
import { Calendar, CheckCircle2, Star, Clock } from 'lucide-react'

function SuccessBanner({ message }) {
  return (
    <div className="mb-6 p-4 text-sm font-medium text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2.5 animate-fade-in">
      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function InfoBanner({ message }) {
  return (
    <div className="mb-6 p-4 text-sm font-medium text-zinc-800 bg-zinc-50 border border-zinc-100 rounded-xl flex items-center gap-2.5 animate-fade-in">
      <CheckCircle2 className="w-5 h-5 text-zinc-500 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function ErrorBanner({ message }) {
  return (
    <div className="mb-6 p-4 text-sm font-medium text-red-800 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2.5 animate-fade-in">
      <CheckCircle2 className="w-5 h-5 text-red-600 shrink-0" />
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
    <div className="p-8 bg-zinc-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {isWelcome && <SuccessBanner message="Your profile has been saved. Welcome to Tj's Medical Hub." />}
        {params?.booked && <SuccessBanner message={banners.booked.msg} />}
        {params?.cancelled && <InfoBanner message={banners.cancelled.msg} />}
        {params?.error && <ErrorBanner message={errorBanners[params.error] || 'An error occurred'} />}

        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Patient Dashboard</h1>
            <p className="type-body text-zinc-500 mt-1">
              Welcome back, <span className="font-semibold text-brand-600">{profile.full_name}</span>
            </p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-2xl border border-zinc-100 p-6 flex items-center justify-between shadow-sm">
            <div>
              <p className="type-label text-zinc-400">Active Consultations</p>
              <h3 className="text-2xl font-bold text-zinc-900 mt-1">{activeCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-100 p-6 flex items-center justify-between shadow-sm">
            <div>
              <p className="type-label text-zinc-400">Completed Visits</p>
              <h3 className="text-2xl font-bold text-zinc-900 mt-1">{completedCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-100 p-6 flex items-center justify-between shadow-sm">
            <div>
              <p className="type-label text-zinc-400">Care Rating</p>
              <h3 className="text-2xl font-bold text-zinc-900 mt-1">4.9 / 5.0</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
              <Star className="w-6 h-6 fill-amber-500" />
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-6">
          <h2 className="type-h3 text-zinc-900 font-bold">Your Consultations</h2>
          <PatientAppointmentList 
            initialAppointments={appointments || []} 
            userId={user.id} 
          />
        </div>
      </div>
    </div>
  );
}