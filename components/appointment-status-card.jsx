'use client'

import { useState, useEffect } from 'react'
import { Clock, Calendar, CheckCircle2, AlertCircle } from 'lucide-react'
import { GLOBAL_TIMEZONE } from '@/utils/time'

export default function AppointmentStatusCard({ appointments }) {
  const [mounted, setMounted] = useState(false)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => {
      setNow(new Date())
    }, 15000) // update every 15 seconds for responsiveness
    return () => clearInterval(timer)
  }, [])

  // Find upcoming: pending/confirmed and scheduled in the future
  const upcoming = appointments
    ?.filter(a => ['pending', 'confirmed'].includes(a.status) && new Date(a.scheduled_at) > now)
    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at)) || [];

  const nextAppointment = upcoming[0];

  // If no upcoming, get the most recent one (first in the list after filtering out upcoming)
  const lastAppointment = nextAppointment
    ? null
    : appointments?.[0]; // appointments is already sorted by scheduled_at desc

  if (!mounted) {
    return (
      <div className="bg-white/6 backdrop-blur-2xl rounded-2xl border border-white/12 p-6 flex items-center justify-between animate-pulse">
        <div className="space-y-2">
          <div className="h-3 w-24 bg-white/10 rounded" />
          <div className="h-8 w-32 bg-white/10 rounded" />
        </div>
        <div className="w-12 h-12 rounded-xl bg-white/8 border border-white/15" />
      </div>
    );
  }

  if (nextAppointment) {
    const diffMs = new Date(nextAppointment.scheduled_at).getTime() - now.getTime();
    let timeLeftStr = "Starting now";
    if (diffMs > 0) {
      const diffMins = Math.floor(diffMs / (60 * 1000));
      const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
      const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

      if (diffMins < 60) {
        timeLeftStr = `In ${diffMins} min${diffMins !== 1 ? 's' : ''}`;
      } else if (diffHours < 24) {
        const remainingMins = diffMins % 60;
        timeLeftStr = `In ${diffHours} hr${diffHours !== 1 ? 's' : ''} ${remainingMins > 0 ? `${remainingMins}m` : ''}`;
      } else {
        const remainingHours = diffHours % 24;
        timeLeftStr = `In ${diffDays} day${diffDays !== 1 ? 's' : ''} ${remainingHours > 0 ? `${remainingHours}h` : ''}`;
      }
    }

    const doctorName = nextAppointment.profiles?.full_name || 'Doctor';
    const statusText = nextAppointment.status === 'confirmed' ? 'Confirmed' : 'Pending Approval';
    const borderHoverClass = nextAppointment.status === 'confirmed' 
      ? 'hover:border-emerald-500/20 hover:shadow-[0_10px_40px_rgba(16,185,129,0.04)]' 
      : 'hover:border-amber-500/20 hover:shadow-[0_10px_40px_rgba(245,158,11,0.04)]';
    const iconContainerHoverClass = nextAppointment.status === 'confirmed' 
      ? 'group-hover:bg-emerald-500/10 group-hover:text-emerald-300' 
      : 'group-hover:bg-amber-500/10 group-hover:text-amber-300';

    return (
      <div className={`bg-white/6 backdrop-blur-2xl rounded-2xl border border-white/12 p-6 flex items-center justify-between transition-all duration-300 group ${borderHoverClass}`}>
        <div className="min-w-0 flex-1 pr-4">
          <p className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">Upcoming Appt.</p>
          <h3 className="text-2xl font-extrabold text-white mt-2 tracking-tight truncate">
            {timeLeftStr}
          </h3>
          <p className="text-[11px] text-zinc-450 mt-1 truncate">
            <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${nextAppointment.status === 'confirmed' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
            {statusText} with Dr. {doctorName}
          </p>
        </div>
        <div className={`w-12 h-12 rounded-xl bg-white/8 border border-white/15 flex items-center justify-center text-zinc-350 transition-all shrink-0 ${iconContainerHoverClass}`}>
          <Clock className="w-6 h-6 animate-pulse text-brand-300" />
        </div>
      </div>
    );
  }

  if (lastAppointment) {
    const doctorName = lastAppointment.profiles?.full_name || 'Doctor';
    let statusText = lastAppointment.status.charAt(0).toUpperCase() + lastAppointment.status.slice(1);
    if (lastAppointment.status === 'overridden') statusText = 'Rescheduled';

    const formattedDate = new Date(lastAppointment.scheduled_at).toLocaleDateString('en-US', {
      timeZone: GLOBAL_TIMEZONE,
      month: 'short',
      day: 'numeric'
    });

    let statusColorClass = 'text-zinc-350';
    let borderHoverClass = 'hover:border-white/30 hover:shadow-[0_10px_40px_rgba(255,255,255,0.02)]';
    let iconContainerHoverClass = 'group-hover:bg-white/15 group-hover:text-white';
    let Icon = CheckCircle2;

    if (lastAppointment.status === 'completed') {
      statusColorClass = 'text-emerald-400';
      borderHoverClass = 'hover:border-emerald-500/20 hover:shadow-[0_10px_40px_rgba(16,185,129,0.04)]';
      iconContainerHoverClass = 'group-hover:bg-emerald-500/10 group-hover:text-emerald-300';
    } else if (['cancelled', 'rejected'].includes(lastAppointment.status)) {
      statusColorClass = 'text-red-400';
      borderHoverClass = 'hover:border-red-500/20 hover:shadow-[0_10px_40px_rgba(239,68,68,0.04)]';
      iconContainerHoverClass = 'group-hover:bg-red-500/10 group-hover:text-red-300';
      Icon = AlertCircle;
    }

    return (
      <div className={`bg-white/6 backdrop-blur-2xl rounded-2xl border border-white/12 p-6 flex items-center justify-between transition-all duration-300 group ${borderHoverClass}`}>
        <div className="min-w-0 flex-1 pr-4">
          <p className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">Last Appointment</p>
          <h3 className="text-2xl font-extrabold text-white mt-2 tracking-tight truncate">
            {statusText}
          </h3>
          <p className="text-[11px] text-zinc-450 mt-1 truncate">
            Dr. {doctorName} on {formattedDate}
          </p>
        </div>
        <div className={`w-12 h-12 rounded-xl bg-white/8 border border-white/15 flex items-center justify-center text-zinc-350 transition-all shrink-0 ${iconContainerHoverClass}`}>
          <Icon className="w-6 h-6 text-zinc-400" />
        </div>
      </div>
    );
  }

  // No appointments scheduled at all
  return (
    <div className="bg-white/6 backdrop-blur-2xl rounded-2xl border border-white/12 p-6 flex items-center justify-between hover:border-brand-500/20 hover:shadow-[0_10px_40px_rgba(6,148,162,0.04)] transition-all duration-300 group">
      <div className="min-w-0 flex-1 pr-4">
        <p className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">Next Appointment</p>
        <h3 className="text-2xl font-extrabold text-white mt-2 tracking-tight">
          No Bookings
        </h3>
        <p className="text-[11px] text-zinc-450 mt-1">
          Click below to book your first visit
        </p>
      </div>
      <div className="w-12 h-12 rounded-xl bg-white/8 border border-white/15 flex items-center justify-center text-zinc-350 group-hover:bg-brand-500/10 group-hover:text-brand-300 transition-all shrink-0">
        <Calendar className="w-6 h-6 text-zinc-400" />
      </div>
    </div>
  );
}
