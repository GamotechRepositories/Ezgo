import { useEffect, useState } from 'react';
import { EzzyGoLogo } from './EzzyGoLogo';
import { api, type DemoAccount } from '../services/api';
import type { User } from '../types';

interface LoginPageProps {
  onSuccess: (user: User) => void;
}

const fieldClass =
  'mt-1.5 w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#f95724] focus:ring-2 focus:ring-[#f95724]/15';

const points = [
  'See the requests hosts have posted in your city.',
  'Send a price at or below the limit they set.',
  'You get your full bid after the event. EzzyGo takes nothing from it.',
];

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [serviceArea, setServiceArea] = useState('Pune');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [demos, setDemos] = useState<DemoAccount[]>([]);

  useEffect(() => {
    api.demoAccounts().then((list) => setDemos(list.filter((a) => a.role === 'provider'))).catch(() => {});
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const action = mode === 'register'
      ? api.register({ name, phone, password, businessName, serviceArea })
      : api.login(phone, password);
    action
      .then(onSuccess)
      .catch((err: any) => setError(err.message))
      .finally(() => setBusy(false));
  };

  const loginDemo = (demo: DemoAccount) => {
    setPhone(demo.phone);
    setPassword(demo.password);
    setBusy(true);
    setError('');
    api.login(demo.phone, demo.password)
      .then(onSuccess)
      .catch((err: any) => setError(err.message))
      .finally(() => setBusy(false));
  };

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-2 bg-[#f8fafc] lg:bg-white">
      <aside className="hidden lg:flex flex-col justify-between bg-[#fff6f1] border-r border-orange-100 px-12 xl:px-16 py-10">
        <EzzyGoLogo variant="vendor" size="lg" />
        <div className="max-w-md">
          <h2 className="text-4xl font-bold text-slate-900 leading-tight">Send your price. Keep all of it.</h2>
          <ol className="mt-8 space-y-4">
            {points.map((point, index) => (
              <li key={point} className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-white border border-orange-200 text-[#f95724] text-sm font-semibold flex items-center justify-center shrink-0">
                  {index + 1}
                </span>
                <span className="text-base text-slate-700 leading-snug pt-0.5">{point}</span>
              </li>
            ))}
          </ol>
        </div>
        <p className="text-base text-slate-600">
          Booking an event?{' '}
          <a className="text-[#f95724] font-semibold hover:underline" href="http://localhost:5173">
            Open the host app
          </a>
        </p>
      </aside>

      <main className="min-h-dvh lg:h-dvh lg:overflow-y-auto flex flex-col px-4 py-6 sm:px-8 lg:px-12 xl:px-16">
        <div className="w-full max-w-[440px] mx-auto my-auto bg-white border border-slate-200 rounded-3xl shadow-sm p-5 sm:p-8 lg:border-0 lg:shadow-none lg:p-0 lg:bg-transparent">
          <div className="lg:hidden mb-6">
            <EzzyGoLogo variant="vendor" size="lg" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {mode === 'login' ? 'Vendor log in' : 'Create a vendor account'}
          </h1>
          <p className="text-base text-slate-600 mt-2">
            {mode === 'login'
              ? 'See open requests and send your price.'
              : 'Hosts will see your business name on your bids.'}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === 'register' && (
              <>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Your name</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" className={fieldClass} />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Business name</span>
                  <input
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                    placeholder="e.g. Rajesh Pro Audio"
                    className={fieldClass}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">City you work in</span>
                  <input value={serviceArea} onChange={(e) => setServiceArea(e.target.value)} required className={fieldClass} />
                </label>
              </>
            )}

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Mobile number</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                inputMode="tel"
                autoComplete="tel"
                placeholder="10-digit mobile number"
                className={fieldClass}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Password</span>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className={`${fieldClass} pr-16`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>

            {error && (
              <p className="text-sm text-rose-800 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2.5">{error}</p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full h-12 rounded-full bg-[#f95724] hover:bg-[#e04818] text-white font-semibold text-base disabled:opacity-50 cursor-pointer"
            >
              {busy ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError('');
            }}
            className="mt-4 text-base font-semibold text-[#f95724] hover:underline cursor-pointer"
          >
            {mode === 'login' ? 'New vendor? Create an account' : 'Already have an account? Log in'}
          </button>

          {mode === 'login' && demos.length > 0 && (
            <div className="mt-6 pt-5 border-t border-slate-200 space-y-2">
              <p className="text-sm font-medium text-slate-700">Or continue with a demo account</p>
              {demos.map((demo) => (
                <button
                  key={demo.phone}
                  type="button"
                  disabled={busy}
                  onClick={() => loginDemo(demo)}
                  className="w-full min-h-12 text-left px-4 py-2.5 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50 cursor-pointer disabled:opacity-50"
                >
                  <span className="block text-base font-semibold text-slate-900">{demo.businessName || demo.name}</span>
                  <span className="block text-sm text-slate-500 break-all">{demo.phone} · {demo.password}</span>
                </button>
              ))}
            </div>
          )}

          <p className="lg:hidden mt-6 text-base text-slate-600">
            Booking an event?{' '}
            <a className="text-[#f95724] font-semibold hover:underline" href="http://localhost:5173">
              Open the host app
            </a>
          </p>
        </div>
      </main>
    </div>
  );
};
