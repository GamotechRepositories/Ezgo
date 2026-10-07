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
  'Approve a vendor before hosts can book them.',
  'Pay the vendor after the host marks the event done.',
  'Cancel a paid booking and refund the host in full.',
];

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [demos, setDemos] = useState<DemoAccount[]>([]);

  useEffect(() => {
    api.demoAccounts().then((list) => setDemos(list.filter((a) => a.role === 'admin'))).catch(() => {});
  }, []);

  const login = async (nextPhone: string, nextPassword: string) => {
    setBusy(true);
    setError('');
    try {
      onSuccess(await api.login(nextPhone, nextPassword));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-2 bg-[#f8fafc] lg:bg-white">
      <aside className="hidden lg:flex flex-col justify-between bg-[#fff6f1] border-r border-orange-100 px-12 xl:px-16 py-10">
        <EzzyGoLogo variant="admin" size="lg" />
        <div className="max-w-md">
          <h2 className="text-4xl font-bold text-slate-900 leading-tight">The desk for vendors, payments, and refunds</h2>
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
        <p className="text-base text-slate-500">Admin accounts are created by EzzyGo. There is no public sign-up.</p>
      </aside>

      <main className="min-h-dvh lg:h-dvh lg:overflow-y-auto flex flex-col px-4 py-6 sm:px-8 lg:px-12 xl:px-16">
        <div className="w-full max-w-[440px] mx-auto my-auto bg-white border border-slate-200 rounded-3xl shadow-sm p-5 sm:p-8 lg:border-0 lg:shadow-none lg:p-0 lg:bg-transparent">
          <div className="lg:hidden mb-6">
            <EzzyGoLogo variant="admin" size="lg" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Admin log in</h1>
          <p className="text-base text-slate-600 mt-2">Check vendors, payments, and the services shown to hosts.</p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              login(phone, password);
            }}
            className="mt-6 space-y-4"
          >
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
                  autoComplete="current-password"
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
              {busy ? 'Please wait...' : 'Log in'}
            </button>
          </form>

          {demos.length > 0 && (
            <div className="mt-6 pt-5 border-t border-slate-200 space-y-2">
              <p className="text-sm font-medium text-slate-700">Or continue with the demo account</p>
              {demos.map((demo) => (
                <button
                  key={demo.phone}
                  type="button"
                  disabled={busy}
                  onClick={() => login(demo.phone, demo.password)}
                  className="w-full min-h-12 text-left px-4 py-2.5 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50 cursor-pointer disabled:opacity-50"
                >
                  <span className="block text-base font-semibold text-slate-900">{demo.name}</span>
                  <span className="block text-sm text-slate-500 break-all">{demo.phone} · {demo.password}</span>
                </button>
              ))}
            </div>
          )}

          <p className="lg:hidden mt-6 text-base text-slate-500">New admin accounts are not open for sign-up.</p>
        </div>
      </main>
    </div>
  );
};
