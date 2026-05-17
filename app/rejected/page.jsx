import { logout } from '@/app/login/actions'

export default function RejectedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Application Not Approved</h1>
        <p className="text-slate-600">Your application was not approved. Please contact the clinic for more information.</p>
        <form action={logout}>
          <button className="w-full py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors font-medium">Sign Out</button>
        </form>
      </div>
    </div>
  )
}
