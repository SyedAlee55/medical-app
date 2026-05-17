'use client'

import { useState } from 'react'
import { login, signUp } from './actions'

export default function LoginClient({ errorMessage, infoMessage }) {
  const [activeRole, setActiveRole] = useState(null) // null = nothing selected yet
  const [mode, setMode] = useState('login') // 'login' or 'signup'

  const errorMap = {
    invalid_credentials: 'Incorrect email or password.',
    wrong_portal: 'This account does not have access to this portal. Please select the correct login option.',
    weak_password: 'Password must be at least 12 characters with uppercase, number and symbol.',
    invalid_input: 'Please check your details and try again.',
    too_many_attempts: 'Too many attempts. Please wait and try again.',
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center px-4 py-12">

      {/* Logo / Branding */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Tj's Medical Hub
        </h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
          Secure medical portal
        </p>
      </div>

      {/* Role selector — two large cards */}
      <div className="w-full max-w-md">
        <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-widest text-center mb-4">
          I am a
        </p>
        <div className="grid grid-cols-2 gap-3 mb-8">

          {/* Patient card */}
          <button
            type="button"
            onClick={() => { setActiveRole('patient'); setMode('login') }}
            className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 py-6 px-4 transition-all duration-150 cursor-pointer
              ${activeRole === 'patient'
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-950 dark:border-blue-500'
                : 'border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-600'
              }`}
          >
            <span className="text-2xl">🧑⚕️</span>
            <span className={`text-sm font-semibold ${activeRole === 'patient' ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-zinc-300'}`}>
              Patient
            </span>
            <span className="text-xs text-slate-400 dark:text-zinc-500 text-center leading-tight">
              Book appointments & manage your health
            </span>
          </button>

          {/* Doctor/Staff card */}
          <button
            type="button"
            onClick={() => { setActiveRole('doctor'); setMode('login') }}
            className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 py-6 px-4 transition-all duration-150 cursor-pointer
              ${activeRole === 'doctor'
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-950 dark:border-blue-500'
                : 'border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-600'
              }`}
          >
            <span className="text-2xl">👨⚕️</span>
            <span className={`text-sm font-semibold ${activeRole === 'doctor' ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-zinc-300'}`}>
              Doctor / Staff
            </span>
            <span className="text-xs text-slate-400 dark:text-zinc-500 text-center leading-tight">
              Manage consultations & patient requests
            </span>
          </button>

        </div>

        {/* Form panel — only shows after a role is selected */}
        {activeRole && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-700 p-6 shadow-sm">

            {/* Login / Signup tab switch */}
            <div className="flex rounded-lg border border-slate-200 dark:border-zinc-700 overflow-hidden mb-6">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-2 text-sm font-medium transition-colors
                  ${mode === 'login'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-zinc-900'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
                  }`}
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex-1 py-2 text-sm font-medium transition-colors border-l border-slate-200 dark:border-zinc-700
                  ${mode === 'signup'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-zinc-900'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
                  }`}
              >
                {activeRole === 'doctor' ? 'Apply' : 'Sign up'}
              </button>
            </div>

            {/* Error / info banners */}
            {errorMessage && (
              <div className="mb-4 p-3 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                {errorMap[errorMessage] || errorMessage}
              </div>
            )}
            {infoMessage === 'check_email' && (
              <div className="mb-4 p-3 text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                Check your email to confirm your account before logging in.
              </div>
            )}

            {/* LOGIN FORM */}
            {mode === 'login' && (
              <form className="flex flex-col gap-4">
                <input type="hidden" name="role" value={activeRole} />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-zinc-400">
                    Email address
                  </label>
                  <input
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-transparent text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-zinc-400">
                    Password
                  </label>
                  <input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-transparent text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                  />
                </div>

                <button
                  formAction={login}
                  className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors mt-1"
                >
                  Log in as {activeRole === 'patient' ? 'Patient' : 'Doctor / Staff'}
                </button>
              </form>
            )}

            {/* SIGNUP FORM */}
            {mode === 'signup' && (
              <form className="flex flex-col gap-4">
                <input type="hidden" name="role" value={activeRole} />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-zinc-400">
                    Full name
                  </label>
                  <input
                    name="fullName"
                    type="text"
                    placeholder={activeRole === 'doctor' ? 'Dr. John Smith' : 'Jane Smith'}
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-transparent text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-zinc-400">
                    Email address
                  </label>
                  <input
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-transparent text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-zinc-400">
                    Password
                  </label>
                  <input
                    name="password"
                    type="password"
                    placeholder="Min. 12 characters"
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-transparent text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Doctor-specific notice */}
                {activeRole === 'doctor' && (
                  <p className="text-xs text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2.5">
                    Doctor and staff accounts require administrator approval before access is granted. You will be notified by email.
                  </p>
                )}

                <button
                  formAction={signUp}
                  className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors mt-1"
                >
                  {activeRole === 'doctor' ? 'Submit application' : 'Create patient account'}
                </button>
              </form>
            )}

          </div>
        )}

        {/* Placeholder when nothing is selected yet */}
        {!activeRole && (
          <p className="text-center text-sm text-slate-400 dark:text-zinc-500">
            Select your role above to continue
          </p>
        )}

      </div>
    </div>
  )
}
