'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Bell, CheckCircle2, XCircle, Clock, X } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { GLOBAL_TIMEZONE } from '@/utils/time'

// ── Derive notification items from appointments ─────────────────────────────
function deriveNotifications(appointments, role) {
  const items = []

  for (const apt of appointments) {
    const patientName = apt.patient?.full_name || 'Patient'
    const doctorName  = apt.doctor?.full_name  || 'Doctor'
    const specialty   = apt.specialties?.name  || 'General'
    const timeLabel   = apt.scheduled_at
      ? new Date(apt.scheduled_at).toLocaleString('en-US', {
          timeZone: GLOBAL_TIMEZONE,
          month: 'short', day: 'numeric',
          hour: '2-digit', minute: '2-digit',
        })
      : 'Unknown time'

    if (role === 'patient') {
      if (apt.status === 'confirmed' && apt.confirmed_at) {
        items.push({
          id:        `${apt.id}:confirmed`,
          icon:      'confirmed',
          title:     'Appointment Confirmed',
          body:      `Dr. ${doctorName} confirmed your ${specialty} appointment on ${timeLabel}.`,
          timestamp: apt.confirmed_at,
        })
      }
      if (apt.status === 'rejected' && apt.rejected_at) {
        items.push({
          id:        `${apt.id}:rejected`,
          icon:      'rejected',
          title:     'Appointment Declined',
          body:      `Dr. ${doctorName} declined your ${specialty} appointment on ${timeLabel}.${apt.rejection_reason ? ` Reason: ${apt.rejection_reason}` : ''}`,
          timestamp: apt.rejected_at,
        })
      }
      if (apt.status === 'cancelled' && apt.cancelled_at) {
        items.push({
          id:        `${apt.id}:cancelled`,
          icon:      'cancelled',
          title:     'Appointment Cancelled',
          body:      `Your ${specialty} appointment on ${timeLabel} was cancelled.`,
          timestamp: apt.cancelled_at,
        })
      }
    }

    if (role === 'doctor' || role === 'staff') {
      if (apt.status === 'pending') {
        items.push({
          id:        `${apt.id}:pending`,
          icon:      'pending',
          title:     'New Appointment Request',
          body:      `${patientName} requested a ${specialty} consultation on ${timeLabel}.`,
          timestamp: apt.created_at,
        })
      }
      if (apt.status === 'cancelled' && apt.cancelled_at) {
        items.push({
          id:        `${apt.id}:cancelled`,
          icon:      'cancelled',
          title:     'Appointment Cancelled by Patient',
          body:      `${patientName} cancelled their ${specialty} appointment on ${timeLabel}.`,
          timestamp: apt.cancelled_at,
        })
      }
    }
  }

  return items
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 20)
}

const ICON_MAP = {
  confirmed: { Component: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  rejected:  { Component: XCircle,      color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20' },
  cancelled: { Component: X,            color: 'text-zinc-400',    bg: 'bg-zinc-800/40 border-zinc-700/30' },
  pending:   { Component: Clock,        color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20' },
}

function timeAgo(timestamp) {
  const diff = Date.now() - new Date(timestamp).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function NotificationBell({ userId, role }) {
  const [open, setOpen]                   = useState(false)
  const [notifications, setNotifications] = useState([])
  const [readIds, setReadIds]             = useState(new Set())
  const [loading, setLoading]             = useState(true)
  const panelRef                          = useRef(null)
  const STORAGE_KEY                       = `notif_read_${userId}`

  // ── Load persisted read-state from localStorage ─────────────────────────
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      setReadIds(new Set(stored))
    } catch { /* ignore */ }
  }, [STORAGE_KEY])

  // ── Fetch appointments → derive notifications ────────────────────────────
  const fetchNotifications = useCallback(async () => {
    const supabase = createClient()

    let query = supabase
      .from('appointments')
      .select(`
        id, status, scheduled_at, created_at,
        confirmed_at, rejected_at, cancelled_at,
        rejection_reason,
        patient:profiles!appointments_patient_id_fkey(full_name),
        doctor:profiles!appointments_doctor_id_fkey(full_name),
        specialties(name)
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(50)

    if (role === 'patient') {
      query = query.eq('patient_id', userId)
    } else {
      query = query.eq('doctor_id', userId)
    }

    const { data, error } = await query

    if (error) {
      console.error('[NotificationBell] fetch error:', error.message)
      setLoading(false)
      return
    }

    setNotifications(deriveNotifications(data || [], role))
    setLoading(false)
  }, [userId, role])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  // ── Close on outside click ───────────────────────────────────────────────
  useEffect(() => {
    if (!open) return
    function handleOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length

  function markAllRead() {
    const next = new Set([...readIds, ...notifications.map(n => n.id)])
    setReadIds(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...next])) } catch {}
  }

  function markOneRead(id) {
    const next = new Set([...readIds, id])
    setReadIds(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...next])) } catch {}
  }

  return (
    <div ref={panelRef} className="relative">

      {/* ── Bell button ─────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="relative p-2 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-white/5 cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 rounded-full bg-brand-500 border border-black text-white text-[9px] font-bold flex items-center justify-center shadow-[0_0_8px_rgba(6,148,162,0.4)]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown panel ──────────────────────────────────────────── */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-zinc-950 border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] z-[9999] overflow-hidden">

          {/* Header row */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-brand-400" />
              <h3 className="text-sm font-semibold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 bg-brand-500/20 border border-brand-400/30 text-brand-300 text-[9px] font-bold rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-[10px] text-zinc-500 hover:text-brand-300 font-semibold transition-colors cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Body */}
          <div className="max-h-[420px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-5 h-5 border-2 border-brand-500/30 border-t-brand-400 rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 px-6">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-zinc-600" />
                </div>
                <p className="text-sm text-zinc-500 font-medium">No notifications yet</p>
                <p className="text-xs text-zinc-600 text-center">
                  Appointment updates will appear here.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-white/5">
                {notifications.map(notif => {
                  const isRead   = readIds.has(notif.id)
                  const iconInfo = ICON_MAP[notif.icon] || ICON_MAP.pending
                  const Icon     = iconInfo.Component
                  return (
                    <li
                      key={notif.id}
                      onClick={() => markOneRead(notif.id)}
                      className={`flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors ${
                        isRead
                          ? 'opacity-55 hover:opacity-75 hover:bg-white/3'
                          : 'bg-white/3 hover:bg-white/6'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${iconInfo.bg}`}>
                        <Icon className={`w-4 h-4 ${iconInfo.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-xs font-semibold leading-snug ${isRead ? 'text-zinc-400' : 'text-white'}`}>
                            {notif.title}
                          </p>
                          {!isRead && (
                            <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-1 shadow-[0_0_6px_rgba(6,148,162,0.5)]" />
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed line-clamp-2">
                          {notif.body}
                        </p>
                        <p className="text-[10px] text-zinc-600 mt-1 font-medium">
                          {timeAgo(notif.timestamp)}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-white/5 text-center">
              <p className="text-[10px] text-zinc-600">
                Showing last {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
